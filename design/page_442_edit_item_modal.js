var l_items_details = {};
var dim_edit_done = "N";
var auto_crush = "N";

//ASA-2024.3 Start
function validate_crush(p_crush_type) {
    try {
        logDebug("function : validate_crush; p_crush_type: "+p_crush_type, "S");
        if (l_items_details.g_multiselect == 'N') {
            if (p_crush_type == "VERT") {
                if (l_items_details.actualHeight == "H") {
                    if (parseFloat($v("P442_CRUSH_VERT")) > parseFloat($v("P442_CRUSH_HGT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_VERT", 0);
                    }
                } else if (l_items_details.actualHeight == "W") {
                    if (parseFloat($v("P442_CRUSH_VERT")) > parseFloat($v("P442_CRUSH_WDT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_VERT", 0);
                    };
                } else if (l_items_details.actualHeight == "D") {
                    if (parseFloat($v("P442_CRUSH_VERT")) > parseFloat($v("P442_CRUSH_DPT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_VERT", 0);
                    };
                }
            } else if (p_crush_type == "HORIZ") {
                if (l_items_details.actualWidth == "H") {
                    if (parseFloat($v("P442_CRUSH_HORIZ")) > parseFloat($v("P442_CRUSH_HGT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_HORIZ", 0);
                    }
                } else if (l_items_details.actualWidth == "W") {
                    if (parseFloat($v("P442_CRUSH_HORIZ")) > parseFloat($v("P442_CRUSH_WDT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_HORIZ", 0)
                    }
                } else if (l_items_details.actualWidth == "D") {
                    if (parseFloat($v("P442_CRUSH_HORIZ")) > parseFloat($v("P442_CRUSH_DPT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_HORIZ", 0);
                    }
                }
            } else if (p_crush_type == "DEPTH") {
                if (l_items_details.actualDepth == "H") {
                    if (parseFloat($v("P442_CRUSH_DEPTH")) > parseFloat($v("P442_CRUSH_HGT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_DEPTH", 0);
                    }
                } else if (l_items_details.actualDepth == "W") {
                    if (parseFloat($v("P442_CRUSH_DEPTH")) > parseFloat($v("P442_CRUSH_WDT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_DEPTH", 0);
                    }
                } else if (l_items_details.actualDepth == "D") {
                    if (parseFloat($v("P442_CRUSH_DEPTH")) > parseFloat($v("P442_CRUSH_DPT_PERC"))) {
                        alert(get_message("POGCR_MAX_CRUSH_VALIDATION"));
                        $s("P442_CRUSH_DEPTH", 0);
                    }
                }
            }
        }
    } catch (err) {
        error_handling(err);
    } finally {
        logDebug("function : validate_crush; ", "E");
    }
}
//ASA-2024.3 End

function setDefault() {
    try {
        logDebug("function : setDefault ; ", "S");
        l_items_details = sessionStorage.getItem("items_details") !== null ? JSON.parse(sessionStorage.getItem("items_details")) : {};
        l_items_details.dim_details = {};
        console.log("items_details value from session", l_items_details);
        sessionStorage.removeItem("items_details");
        const l_MCapTopFacing = l_items_details.MCapTopFacing;
        var itemOnShelf = false; //ASA-1410

        if ((l_items_details.g_multiselect == "Y" || l_items_details.g_ctrl_select == "Y") && typeof l_items_details.delete_details !== 'undefined') { //ASA-1418//l_items_details.delete_details.length > 0) {
            itemOnShelf = checkValueConsistency(l_items_details.delete_details, 'CType', 'SHELF');//ASA-1410
            $s("P442_ITEM_CODE", "Mixed");
            $s("P442_BARCODE", "Mixed");
            $s("P442_ITEM_DESC", "Mixed");
            $s("P442_LOCATION_ID", "");
            $s("P442_ITEM_WIDTH", 0);
            $s("P442_ITEM_HEIGHT", 0);
            $s("P442_ITEM_DEPTH", 0);
            $s("P442_CRUSH_WDT_PERC", 0);
            $s("P442_CRUSH_HGT_PERC", 0);
            $s("P442_CRUSH_DPT_PERC", 0);
            $s("P442_CASE_WIDTH", 0);
            $s("P442_CASE_HGT", 0);
            $s("P442_CASE_DEPTH", 0);
            $s("P442_TRAY_WIDTH", 0);
            $s("P442_TRAY_HGT", 0);
            $s("P442_TRAY_DEPTH", 0);
            $s("P442_DISP_WIDTH", 0);
            $s("P442_DISP_HGT", 0);
            $s("P442_DISP_DEPTH", 0);
            // ASA-1410
            // $s("P442_CAP_STYLE", 0);
            // //ASA-1170, Start
            // $s("P442_CAP_FACING", 0);
            // $s("P442_CAP_MERCH_STYLE", "");
            // $s("P442_CAP_ORIENTATION", "");
            // //ASA-1170, End
            // $s("P442_CAP_HORZ", 0); //ASA-1179
            // $s("P442_CAP_DEPT", 0); //ASA-1179
            $s("P442_ITEM_BASE_VERT", 1);
            $s("P442_ITEM_BASE_DEPTH", 1);
            $s("P442_ITEM_BASE_HORIZ", 1);
            $s("P442_CRUSH_HORIZ", 0);
            $s("P442_CRUSH_VERT", 0);
            $s("P442_CRUSH_DEPTH", 0);
            $s("P442_ITEM_ROTATION", 0);
            // $s("P442_NESTING", "");//ASA-1410
            $s("P442_ITEM_CONTAIN", "");
            $s("P442_PRICE", "");
            $s("P442_COST", "");
            $s("P442_REG_MOVEMENT", "");
            $s("P442_MOVEMENT_BASIS", "");
            $s("P442_BASKET_FACTOR", 0);
            $s("P442_ITEM_OVERHANG", 0);
            $s("P442_ITEM_HORIZ_GAP", 0);
            $s("P442_ITEM_VERT_GAP", 0);
            $s("P442_PRODUCT_IS_CONT", "N");
            // $s("P442_NESTING_VAL", 0);//ASA-1410
            $s("P442_CONTAIN_VAL", 0);
            $s("P442_PEG_PER_FACING", "");
            $s("P442_BRAND", "");
            $s("P442_ITEM_GROUP", "");
            $s("P442_ITEM_DEPT", "");
            $s("P442_CLASS", "");
            $s("P442_SUBCLASS", "");
            $s("P442_STD_UOM", "");
            $s("P442_ITEM_SIZE_DESC", "");
            $s("P442_ITEM_SUPPLIER", "");
            //ASA-1410, Start
            // $s("P442_MERCH_STYLE", "");
            // $s("P442_ITEM_ORIENTATION", "");
            // $s("P442_ITEM_FIXED", "");
            // $s("P442_PEG_ID", "");
            // $s("P442_PEG_SPREAD", "");
            // $s("P442_ITEM_COLOR", "#FFFFFF");
            setIconForInconsistentTag(l_items_details.delete_details, 'MerchStyle', 'P442_MERCH_STYLE');
            setIconForInconsistentTag(l_items_details.delete_details, 'Orientation', 'P442_ITEM_ORIENTATION');
            setIconForInconsistentTag(l_items_details.delete_details, 'Fixed', 'P442_ITEM_FIXED');
            setIconForInconsistentTag(l_items_details.delete_details, 'PegID', 'P442_PEG_ID');
            setIconForInconsistentTag(l_items_details.delete_details, 'PegSpread', 'P442_PEG_SPREAD');
            setIconForInconsistentTag(l_items_details.delete_details, 'Color', 'P442_ITEM_COLOR', '');
            setIconForInconsistentTag(l_items_details.delete_details, 'MPogHorizFacings', 'P442_POG_MAX_H_FACINGS', '');
            setIconForInconsistentTag(l_items_details.delete_details, 'MPogVertFacings', 'P442_POG_MAX_V_FACINGS', '');
            setIconForInconsistentTag(l_items_details.delete_details, 'MPogDepthFacings', 'P442_POG_MAX_D_FACINGS', '');
            //ASA-1410, End
            $s("P442_UNIT_CAPACITY", "");
            $s("P442_UNIT_PER_CASE", ""); //ASA-1136
            $s("P442_UNIT_PER_TRAY", ""); //ASA-1136
            $("#P442_ITEM_WIDTH").addClass("apex_disabled");
            $("#P442_ITEM_HEIGHT").addClass("apex_disabled");
            $("#P442_ITEM_DEPTH").addClass("apex_disabled");
            $("#P442_CRUSH_WDT_PERC").addClass("apex_disabled");
            $("#P442_CRUSH_HGT_PERC").addClass("apex_disabled");
            $("#P442_CRUSH_DPT_PERC").addClass("apex_disabled");
            $("#P442_CASE_WIDTH").addClass("apex_disabled");
            $("#P442_CASE_HGT").addClass("apex_disabled");
            $("#P442_CASE_DEPTH").addClass("apex_disabled");
            $("#P442_TRAY_WIDTH").addClass("apex_disabled");
            $("#P442_TRAY_HGT").addClass("apex_disabled");
            $("#P442_TRAY_DEPTH").addClass("apex_disabled");
            $("#P442_DISP_WIDTH").addClass("apex_disabled");
            $("#P442_DISP_HGT").addClass("apex_disabled");
            $("#P442_DISP_DEPTH").addClass("apex_disabled");
            $("#P442_PEG_ID_CONTAINER").show();
            $("#P442_PEG_SPREAD_CONTAINER").show();
            $("#P442_PEG_PER_FACING_CONTAINER").show();
            $("#P442_ITEM_FIXED_CONTAINER").show();
            $("#P442_ITEM_ROTATION_CONTAINER").show();
            //ASA-1410
            // $("#P442_CAP_STYLE_CONTAINER").show();
            // $("#P442_CAP_FACING_CONTAINER").show(); //ASA-1170
            // $("#P442_CAP_MERCH_STYLE_CONTAINER").show(); //ASA-1170
            // $("#P442_CAP_ORIENTATION_CONTAINER").show(); //ASA-1170
            // $("#P442_CAP_MAX_HIGH_CONTAINER").show();
            // $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();


            $("#P442_ITEM_QTY_CONTAINER").hide();
            $("#P442_AUTO_PLACING_CONTAINER").hide();
            $("#P442_ITEM_FIXED").removeClass("apex_disabled");
            //ASA-1410
            // $("#P442_CAP_STYLE").addClass("apex_disabled");
            // $("#P442_CAP_FACING").addClass("apex_disabled"); //ASA-1170
            // $("#P442_CAP_MERCH_STYLE").addClass("apex_disabled"); //ASA-1170
            // $("#P442_CAP_ORIENTATION").addClass("apex_disabled"); //ASA-1170
            // $("#P442_CAP_DEPT").addClass("apex_disabled"); //ASA-1179
            // $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
            // $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
            $("#P442_ITEM_BASE_VERT").addClass("apex_disabled");
            $("#P442_ITEM_BASE_DEPTH").addClass("apex_disabled");
            $("#P442_ITEM_BASE_HORIZ").addClass("apex_disabled");
            if (parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }
            $("#P442_ITEM_ROTATION").addClass("apex_disabled");
            // $("#P442_NESTING").addClass("apex_disabled");//ASA-1410
            $("#P442_ITEM_CONTAIN").addClass("apex_disabled");
            $("#P442_ITEM_ORIENTATION").removeClass("apex_disabled");
            $("#P442_MERCH_STYLE").removeClass("apex_disabled");
            $("#P442_PRICE").addClass("apex_disabled");
            $("#P442_COST").addClass("apex_disabled");
            $("#P442_REG_MOVEMENT").addClass("apex_disabled");
            $("#P442_MOVEMENT_BASIS").addClass("apex_disabled");
            $("#P442_BASKET_FACTOR").addClass("apex_disabled");
            $("#P442_ITEM_OVERHANG").addClass("apex_disabled");
            $("#P442_ITEM_HORIZ_GAP").addClass("apex_disabled");
            $("#P442_ITEM_VERT_GAP").addClass("apex_disabled");
            $("#P442_PRODUCT_IS_CONT").addClass("apex_disabled");
            // $("#P442_NESTING_VAL").addClass("apex_disabled");//ASA-1410
            $("#P442_CONTAIN_VAL").addClass("apex_disabled");
            $("#P442_LOCATION_ID").addClass("apex_disabled");
            $("#P442_PEG_PER_FACING").addClass("apex_disabled");
            $("#P442_UNIT_CAPACITY").addClass("apex_disabled"); //ASA-1136
            $("#P442_UNIT_PER_CASE").addClass("apex_disabled"); //ASA-1136
            $("#P442_UNIT_PER_TRAY").addClass("apex_disabled"); //ASA-1136
            $("#DELETE_ITEM").hide();
            $("#base_region").show();
            $("#others_region").show();
            $("#crush_region").show();
            $("#capDtls").show();
            $("#SR_position_tab_tab a").trigger("click");
            $("#P442_CRUSH_HORIZ_CONTAINER .t-Form-itemText--post").addClass('u-hidden'); //ASA-1386 20240521
            $("#P442_CRUSH_VERT_CONTAINER .t-Form-itemText--post").addClass('u-hidden'); //ASA-1386 20240521
            $("#P442_CRUSH_DEPTH_CONTAINER .t-Form-itemText--post").addClass('u-hidden'); //ASA-1386 20240521

            //ASA-1410
            if (itemOnShelf) {
                setIconForInconsistentTag(l_items_details.delete_details, 'ItemNesting', 'P442_NESTING');
                const defaultNesting = $v('P442_NESTING');
                if (defaultNesting == "W") {
                    setIconForInconsistentTag(l_items_details.delete_details, 'NW', 'P442_NESTING_VAL', 0);
                } else if (defaultNesting == "H") {
                    setIconForInconsistentTag(l_items_details.delete_details, 'NH', 'P442_NESTING_VAL', 0);
                } else if (defaultNesting == "D") {
                    setIconForInconsistentTag(l_items_details.delete_details, 'ND', 'P442_NESTING_VAL', 0);
                }
                const nestingValue = $v('P442_NESTING_VAL');
                if (nvl(nestingValue) !== 0) {
                    $s("P442_NESTING_VAL", (nestingValue * 100).toFixed(2));
                }

                setIconForInconsistentTag(l_items_details.delete_details, 'CapStyle', 'P442_CAP_STYLE', 0);
                const defaultCapStyle = $v('P442_CAP_STYLE');
                if (defaultCapStyle == '0') {
                    $s('P442_CAP_FACING', 0);
                    $s('P442_CAP_MERCH_STYLE', '');
                    $s('P442_CAP_ORIENTATION', '');
                    $s('P442_CAP_HORZ', 0);
                    $s('P442_CAP_DEPT', 0);
                } else {
                    setIconForInconsistentTag(l_items_details.delete_details, 'CapFacing', 'P442_CAP_FACING', 0);
                    setIconForInconsistentTag(l_items_details.delete_details, 'CapMerch', 'P442_CAP_MERCH_STYLE');
                    setIconForInconsistentTag(l_items_details.delete_details, 'CapOrientaion', 'P442_CAP_ORIENTATION');
                    setIconForInconsistentTag(l_items_details.delete_details, defaultCapStyle !== '0' ? 'BHoriz' : 'CapHorz', 'P442_CAP_HORZ', 0);
                    setIconForInconsistentTag(l_items_details.delete_details, 'CapDepth', 'P442_CAP_DEPT', 0);
                }
                setIconForInconsistentTag(l_items_details.delete_details, 'CapMaxH', 'P442_CAP_MAX_HIGH');
                setIconForInconsistentTag(l_items_details.delete_details, 'MaxHCapStyle', 'P442_MAX_HIGH_CAP_STYLE');
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_FACING_CONTAINER").show();
                $("#P442_CAP_MERCH_STYLE_CONTAINER").show();
                $("#P442_CAP_ORIENTATION_CONTAINER").show();
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();

            } else {
                $s("P442_NESTING", "");
                $s("P442_NESTING_VAL", 0);
                $("#P442_NESTING").addClass("apex_disabled");
                $("#P442_NESTING_VAL").addClass("apex_disabled");
                $s("P442_CAP_STYLE", 0);
                $s("P442_CAP_FACING", 0);
                $s("P442_CAP_MERCH_STYLE", "");
                $s("P442_CAP_ORIENTATION", "");
                $s("P442_CAP_HORZ", 0);
                $s("P442_CAP_DEPT", 0);
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_FACING_CONTAINER").show();
                $("#P442_CAP_MERCH_STYLE_CONTAINER").show();
                $("#P442_CAP_ORIENTATION_CONTAINER").show();
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_STYLE").addClass("apex_disabled");
                $("#P442_CAP_FACING").addClass("apex_disabled");
                $("#P442_CAP_MERCH_STYLE").addClass("apex_disabled");
                $("#P442_CAP_ORIENTATION").addClass("apex_disabled");
                $("#P442_CAP_DEPT").addClass("apex_disabled");
                $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
                $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
            }
            apex.item("P442_CAP_STYLE").setFocus();   //ASA-1507 #2
        } else {
            auto_crush = l_items_details.ShelfAutoCrush;
            $s("P442_ITEM_EDIT_IND", "Y");
            $s("P442_ITEM_WIDTH", parseFloat((l_items_details.UW * 100).toFixed(3))); //ASA-1087 toFixed(2)
            $s("P442_ITEM_HEIGHT", parseFloat((l_items_details.UH * 100).toFixed(3))); //ASA-1087 toFixed(2)
            $s("P442_ITEM_DEPTH", parseFloat((l_items_details.UD * 100).toFixed(3))); //ASA-1087 toFixed(2)
            $s("P442_ITEM_CODE", l_items_details.Item);
            $s("P442_DIM_TYPE", l_items_details.DimT);
            $s("P442_BARCODE", l_items_details.Barcode);
            $s("P442_ITEM_DESC", l_items_details.Desc);
            $s("P442_LOCATION_ID", l_items_details.LocID);
            $s("P442_PEG_ID", l_items_details.PegID);
            $s("P442_PEG_SPREAD", l_items_details.PegSpread);
            $s("P442_PEG_PER_FACING", l_items_details.PegPerFacing);
            console.log("items_details.UnitperCase", l_items_details.UnitperCase, l_items_details.UnitperTray);
            $s("P442_UNIT_PER_CASE", l_items_details.UnitperCase); //ASA-1136 --S
            $s("P442_UNIT_PER_TRAY", l_items_details.UnitperTray);
            $s("P442_ITEM_BASE_HORIZ", l_items_details.BHoriz);
            $s("P442_ITEM_BASE_VERT", l_items_details.BVert);
            console.log("BaseD", l_items_details.BaseD);
            $s("P442_ITEM_BASE_DEPTH", l_items_details.BaseD);
            //ASA-1129
            if (l_items_details.Combine !== "" && l_items_details.Combine !== "N") {
                $s("P442_ITEM_FIXED", "N");
            } else {
                $s("P442_ITEM_FIXED", l_items_details.Fixed);
            }
            $s("P442_CAP_STYLE", l_items_details.CapStyle);
            $s("P442_CAP_FACING", l_items_details.CapFacing); //ASA-1170
            $s("P442_CAP_MERCH_STYLE", l_items_details.CapMerch); //ASA-1170
            $s("P442_CAP_ORIENTATION", l_items_details.CapOrientaion); //ASA-1170
            if (l_items_details.CapStyle !== "0") {
                $s("P442_CAP_HORZ", l_items_details.BHoriz); //ASA-1179
            } else {
                $s("P442_CAP_HORZ", l_items_details.CapHorz); //ASA-1179
            }
            $s("P442_CAP_DEPT", l_items_details.CapDepth); //ASA-1179//ASA-1412
            $s("P442_CAP_MAX_HIGH", l_items_details.CapMaxH);
            $s("P442_MAX_HIGH_CAP_STYLE", l_items_details.MaxHCapStyle);
            $s("P442_ITEM_ROTATION", l_items_details.Rotation);
            //ASA-1762
            if (typeof l_items_details.Orientation === 'number') {
                l_items_details.Orientation = String(l_items_details.Orientation);
            }
            $s("P442_ITEM_ORIENTATION", l_items_details.Orientation);
            $s("P442_MERCH_STYLE", l_items_details.MerchStyle);
            $s("P442_ITEM_COLOR", l_items_details.Color);

            $s("P442_ITEM_SUPPLIER", l_items_details.Supplier);
            $s("P442_BRAND", l_items_details.Brand);
            $s("P442_ITEM_GROUP", l_items_details.Group);
            $s("P442_ITEM_DEPT", l_items_details.Dept);
            //Regression Issue 3 20241111
            if (!(typeof l_items_details.Class == "undefined" || l_items_details.Class == "" || l_items_details.Class == null || l_items_details.Class == "null")){
                $s("P442_CLASS", (l_items_details.Class).replace(/\//g, "-"));
            }
            $s("P442_SUBCLASS", l_items_details.SubClass);
            $s("P442_STD_UOM", l_items_details.StdUOM);
            $s("P442_ITEM_SIZE_DESC", l_items_details.SizeDesc);
            $s("P442_PRICE", l_items_details.Price);
            $s("P442_COST", l_items_details.Cost);
            $s("P442_DAYS_OF_SUPPLY", l_items_details.DaysOfSupply);
            $s("P442_REG_MOVEMENT", l_items_details.RegMovement);
            $s("P442_MOVEMENT_BASIS", l_items_details.MoveBasis);
            $s("P442_MAX_V_FACINGS", l_items_details.MVertFacings == -1 ? "" : l_items_details.MVertFacings); //ASA-874
            $s("P442_MAX_H_FACINGS", l_items_details.MHorizFacings == -1 ? "" : l_items_details.MHorizFacings);
            $s("P442_MAX_D_FACINGS", l_items_details.MDepthFacings == -1 ? "" : l_items_details.MDepthFacings);
            $s("P442_POG_MAX_V_FACINGS", nvl(l_items_details.MPogVertFacings) == 0 ? "" : l_items_details.MPogVertFacings);   //ASA-1408, ASA-1408 issue 1
            $s("P442_POG_MAX_H_FACINGS", nvl(l_items_details.MPogHorizFacings) == 0 ? "" : l_items_details.MPogHorizFacings); //ASA-1408, ASA-1408 issue 1
            $s("P442_POG_MAX_D_FACINGS", nvl(l_items_details.MPogDepthFacings) == 0 ? "" : l_items_details.MPogDepthFacings); //ASA-1408, ASA-1408 issue 1

            $s("P442_CRUSH_WDT_PERC", l_items_details.CWPerc);
            $s("P442_CRUSH_HGT_PERC", l_items_details.CHPerc);
            $s("P442_CRUSH_DPT_PERC", l_items_details.CDPerc);
            //ASA-1386 -S
            var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim($v("P442_ITEM_ORIENTATION"), l_items_details.OW, l_items_details.OH, l_items_details.OD) //ASA 1386 22052024 -s
            if ((actualWidth == "W" && l_items_details.MHorizCrushed == "Y") || (actualWidth == "H" && l_items_details.MVertCrushed == "Y") || (actualWidth == "D" && l_items_details.MDepthCrushed == "Y")) {
                $("#P442_CRUSH_HORIZ_CONTAINER .t-Form-itemText--post").removeClass('u-hidden').addClass('textdesign');
            } else {
                $("#P442_CRUSH_HORIZ_CONTAINER .t-Form-itemText--post").removeClass('textdesign').addClass('u-hidden');//ASA-1386 20240521
            }
            if ((actualHeight == "W" && l_items_details.MHorizCrushed == "Y") || (actualHeight == "H" && l_items_details.MVertCrushed == "Y") || (actualHeight == "D" && l_items_details.MDepthCrushed == "Y")) {
                $("#P442_CRUSH_VERT_CONTAINER .t-Form-itemText--post").removeClass('u-hidden').addClass('textdesign');

            } else {
                $("#P442_CRUSH_VERT_CONTAINER .t-Form-itemText--post").removeClass('textdesign').addClass('u-hidden');//ASA-1386 20240521
            }
            if ((actualDepth == "W" && l_items_details.MHorizCrushed == "Y") || (actualDepth == "H" && l_items_details.MVertCrushed == "Y") || (actualDepth == "D" && l_items_details.MDepthCrushed == "Y")) {
                $("#P442_CRUSH_DEPTH_CONTAINER .t-Form-itemText--post").removeClass('u-hidden').addClass('textdesign');
            } else {
                $("#P442_CRUSH_DEPTH_CONTAINER .t-Form-itemText--post").removeClass('textdesign').addClass('u-hidden');//ASA-1386 20240521
            } //ASA 1386 22052024 -E
            //ASA-1386 -E

            $s("P442_ITEM_CONTAIN", l_items_details.ItemContain);
            if ($v("P442_ITEM_CONTAIN") == "W") {
                $s("P442_CONTAIN_VAL", (l_items_details.CnW * 100).toFixed(2));
            } else if ($v("P442_ITEM_CONTAIN") == "H") {
                $s("P442_CONTAIN_VAL", (l_items_details.CnH * 100).toFixed(2));
            } else if ($v("P442_ITEM_CONTAIN") == "D") {
                $s("P442_CONTAIN_VAL", (l_items_details.CnD * 100).toFixed(2));
            }

            $s("P442_NESTING", l_items_details.ItemNesting);
            if ($v("P442_NESTING") == "W") {
                $s("P442_NESTING_VAL", (l_items_details.NW * 100).toFixed(2));
            } else if ($v("P442_NESTING") == "H") {
                $s("P442_NESTING_VAL", (l_items_details.NH * 100).toFixed(2));
            } else if ($v("P442_NESTING") == "D") {
                $s("P442_NESTING_VAL", (l_items_details.ND * 100).toFixed(2));
            }
            $("#P442_NESTING_VAL").addClass("apex_disabled");
            $("#P442_CONTAIN_VAL").addClass("apex_disabled");

            $s("P442_PRODUCT_IS_CONT", l_items_details.IsContainer);

            $("#P442_UNIT_CAPACITY").addClass("apex_disabled"); //ASA-1136
            if ($v("P442_MERCH_STYLE") == "0" || $v("P442_MERCH_STYLE") == "3") {
                $("#P442_UNIT_PER_CASE_CONTAINER").hide(); //ASA-1136
                $("#P442_UNIT_PER_TRAY_CONTAINER").hide(); //ASA-1136
            } else {
                if ($v("P442_MERCH_STYLE") == "1") {
                    $("#P442_UNIT_PER_TRAY_CONTAINER").show();
                    $("#P442_UNIT_PER_TRAY").addClass("apex_disabled");
                } else {
                    $("#P442_UNIT_PER_CASE_CONTAINER").show();
                    $("#P442_UNIT_PER_CASE").addClass("apex_disabled");
                }
            } //ASA--1136-E
            /* ASA-1087 toFixed(2) */
            $s("P442_BASKET_FACTOR", parseFloat((l_items_details.BsktFactor * 100).toFixed(3)));
            $s("P442_ITEM_OVERHANG", parseFloat((l_items_details.OverHang * 100).toFixed(3)));
            $s("P442_ITEM_HORIZ_GAP", parseFloat((l_items_details.HorizGap * 100).toFixed(3)));
            $s("P442_ITEM_VERT_GAP", parseFloat((l_items_details.VertGap * 100).toFixed(3)));
            $s("P442_CASE_WIDTH", parseFloat((l_items_details.CW * 100).toFixed(3)));
            $s("P442_CASE_HGT", parseFloat((l_items_details.CH * 100).toFixed(3)));
            $s("P442_CASE_DEPTH", parseFloat((l_items_details.CD * 100).toFixed(3)));
            $s("P442_TRAY_WIDTH", parseFloat((l_items_details.TW * 100).toFixed(3)));
            $s("P442_TRAY_HGT", parseFloat((l_items_details.TH * 100).toFixed(3)));
            $s("P442_TRAY_DEPTH", parseFloat((l_items_details.TD * 100).toFixed(3)));
            $s("P442_DISP_WIDTH", parseFloat((l_items_details.DW * 100).toFixed(3)));
            $s("P442_DISP_HGT", parseFloat((l_items_details.DH * 100).toFixed(3)));
            $s("P442_DISP_DEPTH", parseFloat((l_items_details.DD * 100).toFixed(3)));
            /* END ASA-1087 */
            $s("P442_ITEM_QTY", l_items_details.Quantity);

            $("#P442_ITEM_WIDTH").addClass("apex_disabled");
            $("#P442_ITEM_HEIGHT").addClass("apex_disabled");
            $("#P442_ITEM_DEPTH").addClass("apex_disabled");
            $("#P442_CRUSH_WDT_PERC").addClass("apex_disabled");
            $("#P442_CRUSH_HGT_PERC").addClass("apex_disabled");
            $("#P442_CRUSH_DPT_PERC").addClass("apex_disabled");
            $("#P442_CASE_WIDTH").addClass("apex_disabled");
            $("#P442_CASE_HGT").addClass("apex_disabled");
            $("#P442_CASE_DEPTH").addClass("apex_disabled");
            $("#P442_TRAY_WIDTH").addClass("apex_disabled");
            $("#P442_TRAY_HGT").addClass("apex_disabled");
            $("#P442_TRAY_DEPTH").addClass("apex_disabled");
            $("#P442_DISP_WIDTH").addClass("apex_disabled");
            $("#P442_DISP_HGT").addClass("apex_disabled");
            $("#P442_DISP_DEPTH").addClass("apex_disabled");

            if (l_items_details.CType == "BASKET") {
                if (l_items_details.BsktFill == "F" || l_items_details.BsktFill == "T") {
                    $("#P442_ITEM_QTY").addClass("apex_disabled");
                } else {
                    $("#P442_ITEM_QTY").removeClass("apex_disabled");
                }

                $("#P442_PEG_ID_CONTAINER").hide();
                $("#P442_PEG_SPREAD_CONTAINER").hide();
                $("#P442_PEG_PER_FACING_CONTAINER").hide();
                $("#P442_ITEM_FIXED_CONTAINER").hide();
                $("#P442_ITEM_ROTATION_CONTAINER").hide();
                $("#P442_CAP_STYLE_CONTAINER").hide();
                $("#P442_CAP_MAX_HIGH_CONTAINER").hide();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").hide();
                $("#P442_ITEM_QTY_CONTAINER").show();
                $("#base_region").hide();
                $("#others_region").hide();
                $("#capDtls").hide(); //ASA-1170
            } else if (l_items_details.CType == "CHEST" || l_items_details.CType == "PALLET") {
                $("#P442_PEG_ID_CONTAINER").show();
                $("#P442_PEG_SPREAD_CONTAINER").show();
                $("#P442_PEG_PER_FACING_CONTAINER").show();
                $("#P442_ITEM_FIXED_CONTAINER").show();
                $("#P442_ITEM_ROTATION_CONTAINER").show();
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();
                $("#P442_ITEM_QTY_CONTAINER").hide();
                $("#P442_CAP_STYLE").addClass("apex_disabled");
                $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
                $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
                $("#P442_ITEM_FIXED").addClass("apex_disabled");
                //ASA-1178
                if (l_items_details.CType == "PALLET") {
                    $("#P442_ITEM_BASE_VERT").addClass("apex_disabled");
                }
                $("#P442_ITEM_BASE_DEPTH").removeClass("apex_disabled");
                $("#P442_ITEM_BASE_HORIZ").removeClass("apex_disabled");
                $("#P442_ITEM_ROTATION").removeClass("apex_disabled");
                $("#base_region").show();
                $("#others_region").show();
                if (l_items_details.CType == "CHEST") {
                    $("#crush_region").show();
                } else {
                    $("#crush_region").hide();
                }
                $("#capDtls").hide(); //ASA-1170
            } else if (l_items_details.CType == "HANGINGBAR") {
                $("#P442_PEG_ID_CONTAINER").show();
                $("#P442_PEG_SPREAD_CONTAINER").show();
                $("#P442_PEG_PER_FACING_CONTAINER").show();
                $("#P442_ITEM_FIXED_CONTAINER").show();
                //ASA-1129
                if (l_items_details.Combine !== "" && l_items_details.Combine !== "N") {
                    $("#P442_ITEM_FIXED").addClass("apex_disabled");
                } else {
                    $("#P442_ITEM_FIXED").removeClass("apex_disabled");
                }
                $("#P442_ITEM_ROTATION_CONTAINER").show();
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();
                $("#P442_ITEM_QTY_CONTAINER").hide();
                $("#P442_CAP_STYLE").addClass("apex_disabled");
                $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
                $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
                $("#P442_ITEM_BASE_VERT").addClass("apex_disabled");
                $("#P442_ITEM_BASE_DEPTH").removeClass("apex_disabled");
                $("#P442_ITEM_BASE_HORIZ").removeClass("apex_disabled");
                $("#P442_ITEM_ROTATION").addClass("apex_disabled");
                $("#base_region").show();
                $("#others_region").show();
                // $("#crush_region").hide();
                $("#crush_region").show();//ASA-1677
                $("#capDtls").hide(); //ASA-1170
            } else if (l_items_details.CType == "ROD") {
                $("#P442_PEG_ID_CONTAINER").show();
                $("#P442_PEG_SPREAD_CONTAINER").show();
                $("#P442_PEG_PER_FACING_CONTAINER").show();
                $("#P442_ITEM_FIXED_CONTAINER").show();
                $("#P442_ITEM_ROTATION_CONTAINER").show();
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();
                $("#P442_ITEM_QTY_CONTAINER").hide();
                $("#P442_CAP_STYLE").addClass("apex_disabled");
                $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
                $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
                $("#P442_ITEM_FIXED").removeClass("apex_disabled");
                $("#P442_ITEM_BASE_VERT").addClass("apex_disabled");
                $("#P442_ITEM_BASE_DEPTH").removeClass("apex_disabled");
                $("#P442_ITEM_BASE_HORIZ").addClass("apex_disabled");
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
                $("#P442_CRUSH_VERT").removeClass("apex_disabled");
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
                $("#P442_ITEM_ROTATION").addClass("apex_disabled");
                $("#base_region").show();
                $("#others_region").show();
                $("#crush_region").show();
                $("#capDtls").hide(); //ASA-1170
            } else if (l_items_details.CType == "PEGBOARD") {
                $("#P442_PEG_ID_CONTAINER").show();
                $("#P442_PEG_SPREAD_CONTAINER").show();
                $("#P442_PEG_PER_FACING_CONTAINER").show();
                $("#P442_ITEM_FIXED_CONTAINER").show();
                $("#P442_ITEM_ROTATION_CONTAINER").show();
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_FACING_CONTAINER").show(); //ASA-1170
                $("#P442_CAP_MERCH_STYLE_CONTAINER").show(); //ASA-1170
                $("#P442_CAP_ORIENTATION_CONTAINER").show(); //ASA-1170
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();
                $("#P442_ITEM_QTY_CONTAINER").hide();
                $("#P442_CAP_STYLE").addClass("apex_disabled");
                $("#P442_CAP_FACING").addClass("apex_disabled"); //ASA-1170
                $("#P442_CAP_MERCH_STYLE").addClass("apex_disabled"); //ASA-1170
                $("#P442_CAP_ORIENTATION").addClass("apex_disabled"); //ASA-1170
                $("#P442_CAP_DEPT").addClass("apex_disabled"); //ASA-1179
                $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
                $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
                $("#P442_ITEM_FIXED").addClass("apex_disabled");
                $("#P442_ITEM_BASE_VERT").removeClass("apex_disabled");
                $("#P442_ITEM_BASE_HORIZ").removeClass("apex_disabled");
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
                $("#P442_ITEM_ROTATION").addClass("apex_disabled");
                $("#base_region").show();
                $("#others_region").show();
                $("#crush_region").show();
                $("#capDtls").hide(); //ASA-1170
            } else {
                $("#P442_PEG_ID_CONTAINER").show();
                $("#P442_PEG_SPREAD_CONTAINER").show();
                $("#P442_PEG_PER_FACING_CONTAINER").show();
                $("#P442_ITEM_FIXED_CONTAINER").show();
                $("#P442_ITEM_ROTATION_CONTAINER").show();
                $("#P442_CAP_STYLE_CONTAINER").show();
                $("#P442_CAP_FACING_CONTAINER").show(); //ASA-1170
                $("#P442_CAP_MERCH_STYLE_CONTAINER").show(); //ASA-1170
                $("#P442_CAP_ORIENTATION_CONTAINER").show(); //ASA-1170
                $("#P442_CAP_MAX_HIGH_CONTAINER").show();
                $("#P442_MAX_HIGH_CAP_STYLE_CONTAINER").show();
                $("#P442_ITEM_QTY_CONTAINER").hide();
                $("#P442_PRODUCT_IS_CONT").removeClass("apex_disabled");
                $("#P442_LOCATION_ID").removeClass("apex_disabled");
                $("#P442_PEG_PER_FACING").removeClass("apex_disabled");
                if (l_items_details.g_carpark_item_flag == "Y") {//ASA-1418
                    $("#P442_CAP_STYLE").addClass("apex_disabled");
                    $("#P442_CAP_FACING").addClass("apex_disabled"); //ASA-1170
                    $("#P442_CAP_MERCH_STYLE").addClass("apex_disabled"); //ASA-1170
                    $("#P442_CAP_ORIENTATION").addClass("apex_disabled"); //ASA-1170
                    $("#P442_CAP_DEPT").addClass("apex_disabled"); //ASA-1179
                    $("#P442_CAP_MAX_HIGH").addClass("apex_disabled");
                    $("#P442_MAX_HIGH_CAP_STYLE").addClass("apex_disabled");
                    $("#P442_ITEM_FIXED").addClass("apex_disabled");
                    $("#P442_ITEM_BASE_VERT").addClass("apex_disabled");
                    $("#P442_ITEM_BASE_DEPTH").addClass("apex_disabled");
                    $("#P442_ITEM_BASE_HORIZ").addClass("apex_disabled");
                    $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
                    $("#P442_CRUSH_VERT").addClass("apex_disabled");
                    $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
                    $("#P442_ITEM_ROTATION").addClass("apex_disabled");
                    $("#P442_NESTING").addClass("apex_disabled");
                    $("#P442_ITEM_CONTAIN").addClass("apex_disabled");
                    $("#P442_MERCH_STYLE").addClass("apex_disabled");
                } else {
                    $("#P442_CAP_STYLE").removeClass("apex_disabled");
                    $("#P442_CAP_FACING").removeClass("apex_disabled"); //ASA-1170
                    $("#P442_CAP_MERCH_STYLE").removeClass("apex_disabled"); //ASA-1170
                    $("#P442_CAP_ORIENTATION").removeClass("apex_disabled"); //ASA-1170
                    $("#P442_CAP_DEPT").removeClass("apex_disabled"); //ASA-1179
                    $("#P442_CAP_MAX_HIGH").removeClass("apex_disabled");
                    $("#P442_MAX_HIGH_CAP_STYLE").removeClass("apex_disabled");
                    //ASA-1129
                    if (l_items_details.Combine !== "" && l_items_details.Combine !== "N") {
                        $("#P442_ITEM_FIXED").addClass("apex_disabled");
                    } else {
                        $("#P442_ITEM_FIXED").removeClass("apex_disabled");
                    }
                    $("#P442_ITEM_BASE_VERT").removeClass("apex_disabled");
                    $("#P442_ITEM_BASE_DEPTH").removeClass("apex_disabled");
                    $("#P442_ITEM_BASE_HORIZ").removeClass("apex_disabled");
                    $("#P442_CRUSH_HORIZ").removeClass("apex_disabled");
                    $("#P442_CRUSH_VERT").removeClass("apex_disabled");
                    $("#P442_CRUSH_DEPTH").removeClass("apex_disabled");
                    $("#P442_ITEM_ROTATION").removeClass("apex_disabled");
                    $("#P442_NESTING").removeClass("apex_disabled");
                    $("#P442_ITEM_CONTAIN").removeClass("apex_disabled");
                    $("#P442_ITEM_ORIENTATION").removeClass("apex_disabled");
                    $("#P442_MERCH_STYLE").removeClass("apex_disabled");
                    if (l_items_details.CapStyle !== "0" && l_items_details.ItemNesting == "") {
                        $s("P442_NESTING", "");
                        $("#P442_NESTING").addClass("apex_disabled");
                        $("#P442_CAP_FACING").removeClass("apex_disabled");
                        $("#P442_CAP_MERCH_STYLE").removeClass("apex_disabled");
                        $("#P442_CAP_ORIENTATION").removeClass("apex_disabled");
                        $("#P442_CAP_DEPT").removeClass("apex_disabled"); //ASA-1179
                    } else if (l_items_details.CapStyle == "0" && l_items_details.ItemNesting !== "") {
                        $("#P442_NESTING").removeClass("apex_disabled");
                        $s("P442_CAP_FACING", 0);
                        $s("P442_CAP_HORZ", 0); //ASA-1179
                        $s("P442_CAP_DEPT", 0); //ASA-1179
                        $s("P442_CAP_MERCH_STYLE", "");
                        $s("P442_CAP_ORIENTATION", "");
                        $("#P442_CAP_FACING").addClass("apex_disabled");
                        $("#P442_CAP_MERCH_STYLE").addClass("apex_disabled");
                        $("#P442_CAP_ORIENTATION").addClass("apex_disabled");
                        $("#P442_CAP_DEPT").addClass("apex_disabled"); //ASA-1179
                    }
                }
                $("#base_region").show();
                $("#others_region").show();
                $("#crush_region").show();
                $("#capDtls").show(); //ASA-1170
            }
            if ((typeof l_items_details.BottomObjID !== "undefined" && l_items_details.BottomObjID !== "") || (typeof l_items_details.TopObjID !== "undefined" && l_items_details.TopObjID !== "")) {
                $("#P442_ITEM_BASE_HORIZ").addClass("apex_disabled");
                $("#P442_ITEM_ORIENTATION").addClass("apex_disabled");
            } else if (l_items_details.g_carpark_item_flag == "N") {//ASA-1418
                $("#P442_ITEM_BASE_HORIZ").removeClass("apex_disabled");
                $("#P442_ITEM_ORIENTATION").removeClass("apex_disabled");
            }
            if (l_items_details.Delist == "Y") {
                $("#P442_ITEM_COLOR").addClass("apex_disabled");
                $("#P442_ITEM_COLOR_PICKER").addClass("apex_disabled");
                $("#CUSTOM_COLOR_ITEM").addClass("apex_disabled");
            } else {
                $("#P442_ITEM_COLOR").removeClass("apex_disabled");
                $("#P442_ITEM_COLOR_PICKER").removeClass("apex_disabled");
                $("#CUSTOM_COLOR_ITEM").removeClass("apex_disabled");
            }

            $("#SR_position_tab_tab a").trigger("click");

            //ASA-2024 Issue4 Start
            l_items_details.DepthAutoCrushed = "N";
            l_items_details.VertAutoCrushed = "N";
            l_items_details.HorizAutoCrushed = "N";
            if (((l_items_details.CrushD > 0 && l_items_details.actualDepth == "D") || (l_items_details.CrushVert > 0 && l_items_details.actualDepth == "H") || (l_items_details.CrushHoriz > 0 && l_items_details.actualDepth == "W")) && l_items_details.MDepthCrushed == "N") {
                l_items_details.DepthAutoCrushed = "Y";
            }

            if (((l_items_details.CrushD > 0 && l_items_details.actualHeight == "D") || (l_items_details.CrushVert > 0 && l_items_details.actualHeight == "H") || (l_items_details.CrushHoriz > 0 && l_items_details.actualHeight == "W")) && l_items_details.MVertCrushed == "N") {
                l_items_details.VertAutoCrushed = "Y";
            }

            if (((l_items_details.CrushD > 0 && l_items_details.actualWidth == "D") || (l_items_details.CrushVert > 0 && l_items_details.actualWidth == "H") || (l_items_details.CrushHoriz > 0 && l_items_details.actualWidth == "W")) && l_items_details.MHorizCrushed == "N") {
                l_items_details.HorizAutoCrushed = "Y";
            }
            //ASA-2024 Issue4 End

            //ASA-2024 Issue5 Start
            if (l_items_details.actualHeight == "W" && parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (l_items_details.actualHeight == "H" && parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (l_items_details.actualHeight == "D" && parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (l_items_details.actualWidth == "W" && parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (l_items_details.actualWidth == "H" && parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (l_items_details.actualWidth == "D" && parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (l_items_details.actualDepth == "W" && parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }
            if (l_items_details.actualDepth == "H" && parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }
            if (l_items_details.actualDepth == "D" && parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }
            //ASA-2024 Issue5 End

            //ASA-2024.3 Start
            l_items_details.OldOrientation = l_items_details.Orientation;
            l_items_details.OrientationChng = "N";
            $("#P442_CRUSH_HORIZ_CONTAINER .t-Form-itemText--post").removeClass('textdesign').addClass('u-hidden');
            $("#P442_CRUSH_VERT_CONTAINER .t-Form-itemText--post").removeClass('textdesign').addClass('u-hidden');
            $("#P442_CRUSH_DEPTH_CONTAINER .t-Form-itemText--post").removeClass('textdesign').addClass('u-hidden');

            //ASA-2024 Issue2 Start
            if (((l_items_details.actualHeight == "H" && l_items_details.CrushVert > 0) || (l_items_details.actualHeight == "W" && l_items_details.CrushHoriz > 0) || (l_items_details.actualHeight == "D" && l_items_details.CrushD > 0)) && l_items_details.MVertCrushed == "Y") {
                $("#P442_CRUSH_VERT_CONTAINER .t-Form-itemText--post").removeClass('u-hidden').addClass('textdesign');
            }

            if (((l_items_details.actualWidth == "H" && l_items_details.CrushVert > 0) || (l_items_details.actualWidth == "W" && l_items_details.CrushHoriz > 0) || (l_items_details.actualWidth == "D" && l_items_details.CrushD > 0)) && l_items_details.MHorizCrushed == "Y") {
                $("#P442_CRUSH_HORIZ_CONTAINER .t-Form-itemText--post").removeClass('u-hidden').addClass('textdesign');
            }

            if (((l_items_details.actualDepth == "H" && l_items_details.CrushVert > 0) || (l_items_details.actualDepth == "W" && l_items_details.CrushHoriz > 0) || (l_items_details.actualDepth == "D" && l_items_details.CrushD > 0)) && l_items_details.MDepthCrushed == "Y") {
                $("#P442_CRUSH_DEPTH_CONTAINER .t-Form-itemText--post").removeClass('u-hidden').addClass('textdesign');
            }
            //ASA-2024 Issue2 End

            if (l_items_details.actualHeight == "H") {
                $s("P442_CRUSH_VERT", l_items_details.CrushVert);
            } else if (l_items_details.actualHeight == "W") {
                $s("P442_CRUSH_VERT", l_items_details.CrushHoriz);
            } else if (l_items_details.actualHeight == "D") {
                $s("P442_CRUSH_VERT", l_items_details.CrushD);
            } else {
                $s("P442_CRUSH_VERT", 0);
            }
            if (l_items_details.actualWidth == "H") {
                $s("P442_CRUSH_HORIZ", l_items_details.CrushVert);
            } else if (l_items_details.actualWidth == "W") {
                $s("P442_CRUSH_HORIZ", l_items_details.CrushHoriz);
            } else if (l_items_details.actualWidth == "D") {
                $s("P442_CRUSH_HORIZ", l_items_details.CrushD);
            } else {
                $s("P442_CRUSH_HORIZ", 0);
            }
            if (l_items_details.actualDepth == "H") {
                $s("P442_CRUSH_DEPTH", l_items_details.CrushVert);
            } else if (l_items_details.actualDepth == "W") {
                $s("P442_CRUSH_DEPTH", l_items_details.CrushHoriz);
            } else if (l_items_details.actualDepth == "D") {
                $s("P442_CRUSH_DEPTH", l_items_details.CrushD);
            } else {
                $s("P442_CRUSH_DEPTH", 0);                
            }
            //ASA-2024.3 End

            var merch_style;
            if ($v("P442_MERCH_STYLE") == "0") {
                merch_style = "U";
            } else if ($v("P442_MERCH_STYLE") == "1") {
                merch_style = "T";
            } else if ($v("P442_MERCH_STYLE") == "2") {
                merch_style = "C";
            } else if ($v("P442_MERCH_STYLE") == "3") {
                merch_style = "D";
            }
            logDebug("function : item region image loading", "S");
            apex.server.process(
                "dummy",
                {
                    pageItems: "#P442_ITEM_CODE",
                },
                {
                    dataType: "text",
                    async: false,
                    complete: function (ajaxResponse) {
                        $("#front .t-Region-body img").remove();
                        $("#left .t-Region-body img").remove();
                        $("#top .t-Region-body img").remove();
                        $("#back .t-Region-body img").remove();
                        $("#right .t-Region-body img").remove();
                        $("#bottom .t-Region-body img").remove();

                        $("#front .t-Region-body").append('<img src="f?p=105:0:' + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE:NO::AI_ITEM,AI_IMG_TYPE,AI_IMG_DIM,AI_RANDOM_STRING:" + $v("P442_ITEM_CODE") + ",1," + merch_style + "," + new Date().getTime() + '" alt="No Image" >'); //ASA-1500 Issue 2
                        $("#left .t-Region-body").append('<img src="f?p=105:0:' + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE:NO::AI_ITEM,AI_IMG_TYPE,AI_IMG_DIM,AI_RANDOM_STRING:" + $v("P442_ITEM_CODE") + ",2," + merch_style + "," + new Date().getTime() + '" alt="No Image" >'); //ASA-1500 Issue 2
                        $("#top .t-Region-body").append('<img src="f?p=105:0:' + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE:NO::AI_ITEM,AI_IMG_TYPE,AI_IMG_DIM,AI_RANDOM_STRING:" + $v("P442_ITEM_CODE") + ",3," + merch_style + "," + new Date().getTime() + '" alt="No Image" >'); //ASA-1500 Issue 2
                        $("#back .t-Region-body").append('<img src="f?p=105:0:' + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE:NO::AI_ITEM,AI_IMG_TYPE,AI_IMG_DIM,AI_RANDOM_STRING:" + $v("P442_ITEM_CODE") + ",7," + merch_style + "," + new Date().getTime() + '" alt="No Image" >'); //ASA-1500 Issue 2
                        $("#right .t-Region-body").append('<img src="f?p=105:0:' + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE:NO::AI_ITEM,AI_IMG_TYPE,AI_IMG_DIM,AI_RANDOM_STRING:" + $v("P442_ITEM_CODE") + ",8," + merch_style + "," + new Date().getTime() + '" alt="No Image" >'); //ASA-1500 Issue 2
                        $("#bottom .t-Region-body").append('<img src="f?p=105:0:' + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE:NO::AI_ITEM,AI_IMG_TYPE,AI_IMG_DIM,AI_RANDOM_STRING:" + $v("P442_ITEM_CODE") + ",9," + merch_style + "," + new Date().getTime() + '" alt="No Image" >'); //ASA-1500 Issue 2
                        var select = document.querySelector("#live_images");
                        select.querySelectorAll("img").forEach(function (img) {
                            img.onerror = function () {
                                this.style.display = "none";
                                $(this).parent().css("height", "26vh");
                            };
                        });
                        //ASA-1170
                        if ($v("P442_CAP_STYLE") == "0") {
                            $("#P442_CAP_FACING").addClass("apex_disabled");
                            $("#P442_CAP_MERCH_STYLE").addClass("apex_disabled");
                            $("#P442_CAP_ORIENTATION").addClass("apex_disabled");
                            $("#P442_CAP_DEPT").addClass("apex_disabled"); //ASA-1179
                        }
                        apex.item("P442_ITEM_BASE_HORIZ").setFocus();
                    },
                }
            );
        }
        l_items_details.MCapTopFacing = l_MCapTopFacing;
        //ASA-1507 #2 Start
        $('body').on('keydown', function (event) {
            if (event.keyCode == 13 && $('#item_dim_details').dialog('isOpen') != true && $('#uploadImage').dialog('isOpen') != true) {   //ASA-1507 #5
                event.preventDefault();
                $('#CREATE_ITEM').click();
            }
        });
        //ASA-1507 #2 End
        logDebug("function : setDefault ; ", "E");
        console.log(l_items_details);
    } catch (err) {
        error_handling(err);
    }
}

function onchange_crush_horiz(p_param) {
    try {
        logDebug("function : onchange_crush_horiz ; p_param" + p_param, "S");
        if (l_items_details.g_multiselect !== "Y") {
            if (p_param) {
                if (l_items_details.actualWidth == "W") {
                    $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
                    $s("P442_CRUSH_HORIZ", 0);
                } else if (l_items_details.actualWidth == "H") {
                    $("#P442_CRUSH_VERT").addClass("apex_disabled");
                    $s("P442_CRUSH_VERT", 0);
                } else if (l_items_details.actualWidth == "D") {
                    $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
                    $s("P442_CRUSH_DEPTH", 0);
                }
            } else {
                if (l_items_details.actualWidth == "W") {
                    $("#P442_CRUSH_HORIZ").removeClass("apex_disabled");
                } else if (l_items_details.actualWidth == "H") {
                    $("#P442_CRUSH_VERT").removeClass("apex_disabled");
                } else if (l_items_details.actualWidth == "D") {
                    $("#P442_CRUSH_DEPTH").removeClass("apex_disabled");
                }
            }
        } else {
            $("#P442_CRUSH_HORIZ").removeClass("apex_disabled");
            $("#P442_CRUSH_VERT").removeClass("apex_disabled");
            $("#P442_CRUSH_DEPTH").removeClass("apex_disabled");
            $s("P442_CRUSH_HORIZ", 0);
            $s("P442_CRUSH_VERT", 0);
            $s("P442_CRUSH_DEPTH", 0);
        }
        logDebug("function : onchange_crush_horiz ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function onchange_crush_vert(p_param) {
    try {
        logDebug("function : onchange_crush_vert ; p_param" + p_param, "S");
        if (p_param) {
            if (l_items_details.actualHeight == "W") {
                $("#P442_CRUSH_HORIZ").removeClass("apex_disabled");
            } else if (l_items_details.actualHeight == "H") {
                $("#P442_CRUSH_VERT").removeClass("apex_disabled");
            } else if (l_items_details.actualHeight == "D") {
                $("#P442_CRUSH_DEPTH").removeClass("apex_disabled");
            }
        } else {
            if (l_items_details.actualHeight == "W") {
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
                $s("P442_CRUSH_HORIZ", 0);
            } else if (l_items_details.actualHeight == "H") {
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
                $s("P442_CRUSH_VERT", 0);
            } else if (l_items_details.actualHeight == "D") {
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
                $s("P442_CRUSH_DEPTH", 0);
            }
        }
        logDebug("function : onchange_crush_vert ; p_param" + p_param, "E");
    } catch (err) {
        error_handling(err);
    }
}

function onchange_crush_depth(p_param) {
    try {
        logDebug("function : onchange_crush_depth ; p_param" + p_param, "S");
        if (p_param) {
            if (l_items_details.actualDepth == "W") {
                $("#P442_CRUSH_HORIZ").removeClass("apex_disabled");
            } else if (l_items_details.actualDepth == "H") {
                $("#P442_CRUSH_VERT").removeClass("apex_disabled");
            } else if (l_items_details.actualDepth == "D") {
                $("#P442_CRUSH_DEPTH").removeClass("apex_disabled");
            }
        } else {
            if (l_items_details.actualDepth == "W") {
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
                $s("P442_CRUSH_HORIZ", 0);
            } else if (l_items_details.actualDepth == "H") {
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
                $s("P442_CRUSH_VERT", 0);
            } else if (l_items_details.actualDepth == "D") {
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
                $s("P442_CRUSH_DEPTH", 0);
            }
        }
        logDebug("function : onchange_crush_depth ; p_param" + p_param, "E");
    } catch (err) {
        error_handling(err);
    }
}

function nesting_cont_set_value(p_param) {
    try {
        logDebug("function : nesting_cont_set_value ; p_param" + p_param, "S");
        if (p_param == "NEST") {
            //ASA-1410
            var nestingWidth = !(isNaN(l_items_details.NW)) ? (nvl(l_items_details.NW) * 100).toFixed(2) : 0;
            var nestingHeight = !(isNaN(l_items_details.NH)) ? (nvl(l_items_details.NH) * 100).toFixed(2) : 0;
            var nestingDepth = !(isNaN(l_items_details.ND)) ? (nvl(l_items_details.ND) * 100).toFixed(2) : 0;
            if ($v("P442_NESTING") == "W") {
                $s("P442_NESTING_VAL", nestingWidth);//ASA-1410
                $s("P442_CAP_STYLE", 0);
                $("#P442_CAP_STYLE").addClass("apex_disabled");
            } else if ($v("P442_NESTING") == "H") {
                $s("P442_NESTING_VAL", nestingHeight);//ASA-1410
                $s("P442_CAP_STYLE", 0);
                $("#P442_CAP_STYLE").addClass("apex_disabled");
            } else if ($v("P442_NESTING") == "D") {
                $s("P442_NESTING_VAL", nestingDepth);//ASA-1410
                $s("P442_CAP_STYLE", 0);
                $("#P442_CAP_STYLE").addClass("apex_disabled");
            } else {
                $s("P442_NESTING_VAL", 0);
                $("#P442_CAP_STYLE").removeClass("apex_disabled");
            }
            $("#P442_NESTING_VAL").addClass("apex_disabled");
        } else {
            if ($v("P442_ITEM_CONTAIN") == "W") {
                $s("P442_CONTAIN_VAL", (l_items_details.CnW * 100).toFixed(2));
            } else if ($v("P442_ITEM_CONTAIN") == "H") {
                $s("P442_CONTAIN_VAL", (l_items_details.CnH * 100).toFixed(2));
            } else if ($v("P442_ITEM_CONTAIN") == "D") {
                $s("P442_CONTAIN_VAL", (l_items_details.CnD * 100).toFixed(2));
            } else {
                $s("P442_CONTAIN_VAL", 0);
            }
            $("#P442_CONTAIN_VAL").addClass("apex_disabled");
        }
        logDebug("function : nesting_cont_set_value ; p_param" + p_param, "E");
    } catch (err) {
        error_handling(err);
    }
}

async function disable_enable_crush() {
    try {
        logDebug("function : disable_enable_crush ; ", "S");
        if (l_items_details.g_multiselect == "N" && l_items_details.g_ctrl_select == "N") {
            var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim($v("P442_ITEM_ORIENTATION"), l_items_details.OW, l_items_details.OH, l_items_details.OD);
            var details = await get_orientation(l_items_details.ModuleIndex, l_items_details.ShelfIndex, $v("P442_ITEM_ORIENTATION"));
            $("#P442_CRUSH_VERT").removeClass("apex_disabled");
            $("#P442_CRUSH_HORIZ").removeClass("apex_disabled");
            $("#P442_CRUSH_DEPTH").removeClass("apex_disabled");
            if (l_items_details.actualHeight == "W" && parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $s("P442_CRUSH_HORIZ", 0);
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (l_items_details.actualHeight == "H" && parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $s("P442_CRUSH_VERT", 0);
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (l_items_details.actualHeight == "D" && parseFloat($v("P442_CRUSH_HGT_PERC")) == 0) {
                $s("P442_CRUSH_DEPTH", 0);
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }

            if (l_items_details.actualWidth == "W" && parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $s("P442_CRUSH_HORIZ", 0);
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (l_items_details.actualWidth == "H" && parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $s("P442_CRUSH_VERT", 0);
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (l_items_details.actualWidth == "D" && parseFloat($v("P442_CRUSH_WDT_PERC")) == 0) {
                $s("P442_CRUSH_DEPTH", 0);
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }

            if (l_items_details.actualDepth == "W" && parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $s("P442_CRUSH_HORIZ", 0);
                $("#P442_CRUSH_HORIZ").addClass("apex_disabled");
            }
            if (l_items_details.actualDepth == "H" && parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $s("P442_CRUSH_VERT", 0);
                $("#P442_CRUSH_VERT").addClass("apex_disabled");
            }
            if (l_items_details.actualDepth == "D" && parseFloat($v("P442_CRUSH_DPT_PERC")) == 0) {
                $s("P442_CRUSH_DEPTH", 0);
                $("#P442_CRUSH_DEPTH").addClass("apex_disabled");
            }
        }
        logDebug("function : disable_enable_crush ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function dimention_req_ind() {
    try {
        logDebug("function : dimention_req_ind", "S");
        var model = apex.region("ig_item_dim").widget().interactiveGrid("getViews", "grid").model;
        model.forEach(function (record) {
            var req_ind = model.getValue(record, "REQUIRED_IND");
            if (req_ind == "Y") {
                var code = model.getValue(record, "CODE");
                var selector = "#ig_item_dim [data-id=" + code + "] td:first";
                $(selector).addClass("a-Icon icon-asterisk");
            }
        });
        logDebug("function : dimention_req_ind", "E");
    } catch (err) {
        error_handling(err);
    }
}

function invoke_save_item_dim() {
    try {
        logDebug("function : invoke_save_item_dim", "S");
        dim_edit_done = "Y";
        var model = apex.region("ig_item_dim").widget().interactiveGrid("getViews", "grid").model;
        model.forEach(function (record) {
            var code = model.getValue(record, "CODE");
            console.log("code", code, model.getValue(record, "WIDTH"), model.getValue(record, "HEIGHT"));
            if ($v("P442_MERCH_STYLE") == "0" && code == "U") {
                $s("P442_SELECTED_WIDTH", model.getValue(record, "WIDTH"));
                $s("P442_SELECTED_HEIGHT", model.getValue(record, "HEIGHT"));
                $s("P442_SELECTED_DEPTH", model.getValue(record, "DEPTH"));
            } else if ($v("P442_MERCH_STYLE") == "1" && code == "T") {
                $s("P442_SELECTED_WIDTH", model.getValue(record, "WIDTH"));
                $s("P442_SELECTED_HEIGHT", model.getValue(record, "HEIGHT"));
                $s("P442_SELECTED_DEPTH", model.getValue(record, "DEPTH"));
            } else if ($v("P442_MERCH_STYLE") == "3" && code == "D") {
                $s("P442_SELECTED_WIDTH", model.getValue(record, "WIDTH"));
                $s("P442_SELECTED_HEIGHT", model.getValue(record, "HEIGHT"));
                $s("P442_SELECTED_DEPTH", model.getValue(record, "DEPTH"));
            } else if ($v("P442_MERCH_STYLE") == "2" && code == "C") {
                $s("P442_SELECTED_WIDTH", model.getValue(record, "WIDTH"));
                $s("P442_SELECTED_HEIGHT", model.getValue(record, "HEIGHT"));
                $s("P442_SELECTED_DEPTH", model.getValue(record, "DEPTH"));
            }
        });
        logDebug("function : invoke_save_item_dim", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function save_item_master() {
    logDebug("function : save_item_master", "S");
    try {
        //ASA-1540  S
        l_items_details.UWchgInd = "N";
        l_items_details.UHchgInd = "N";
        l_items_details.UDchgInd = "N";
        l_items_details.DWchgInd = "N";
        l_items_details.DHchgInd = "N";
        l_items_details.DDchgInd = "N";
        l_items_details.CWchgInd = "N";
        l_items_details.CHchgInd = "N";
        l_items_details.CDchgInd = "N";
        l_items_details.RWchgInd = "N";
        l_items_details.RHchgInd = "N";
        l_items_details.RDchgInd = "N"
        l_items_details.TWchgInd = "N";
        l_items_details.THchgInd = "N";
        l_items_details.TDchgInd = "N";
        l_items_details.OWchgInd = "N";
        l_items_details.OHchgInd = "N";
        l_items_details.ODchgInd = "N";
        l_items_details.NWchgInd = "N";
        l_items_details.NHchgInd = "N";
        l_items_details.NDchgInd = "N";
        //ASA-1540  E
        var model = apex.region("ig_item_dim").widget().interactiveGrid("getViews", "grid").model;
        var i = 0;
        var item_code = [];
        var item_multiselct = "N";
        if (typeof l_items_details.delete_details !== "undefined" && l_items_details.delete_details.length > 0) {
            for (var item of l_items_details.delete_details) {
                item_code.push(item.Item);
            }
            if (l_items_details.g_multiselect == "Y") {
                item_multiselct = "Y"
            }
        }
        else {
            item_code = $v("P442_ITEM_CODE");
        }
        var dim_details = {};
        var code;
        var width, height, depth, unit_capacity; // ASA-1446
        model.forEach(function (record, id, recordId) {
            var details = [];
            code = model.getValue(record, "CODE");
            // ASA-1446
            width = '';
            height = '';
            depth = '';
            unit_capacity = '';

            if (model.getValue(record, "WIDTH") !== "") {
                if (code == "R") {
                    width = parseFloat(model.getValue(record, "WIDTH"));
                } else {
                    width = parseFloat(model.getValue(record, "WIDTH")) / 100;
                }
            }
            // ASA-1193
            if (model.getValue(record, "UNIT_CAPACITY") !== "") {
                if (code == "C") {
                    unit_capacity = parseFloat(model.getValue(record, "UNIT_CAPACITY"));
                }
                else if (code == "T") {
                    unit_capacity = parseFloat(model.getValue(record, "UNIT_CAPACITY"));
                }
                else {
                    unit_capacity = 0;
                }
            }
            if (model.getValue(record, "HEIGHT") !== "") {
                if (code == "R") {
                    height = parseFloat(model.getValue(record, "HEIGHT"));
                } else {
                    height = parseFloat(model.getValue(record, "HEIGHT")) / 100;
                }
            }
            if (model.getValue(record, "DEPTH") !== "") {
                if (code == "R") {
                    depth = parseFloat(model.getValue(record, "DEPTH"));
                } else {
                    depth = parseFloat(model.getValue(record, "DEPTH")) / 100;
                }
            }
            if (model.getValue(record, "CHNG_IND") == "Y") { //ASA-1496 issue 6 S
                if (code == "N") {
                    l_items_details.MultiCheck = "Y";
                }

            }//ASA-1496 issue  6 E
            //ASA-1540 S
            for (obj of record) {
                if (i = record.length - 1) {
                    if (typeof obj.fields !== 'undefined') {
                        keys = Object.keys(obj.fields);
                        for (keyval of keys) {
                            var change_check = eval('obj.fields.' + keyval);
                            if (change_check["changed"] == true) {
                                if (recordId == "U") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.UWchgInd = "Y";
                                    }
                                    if (keyval == "HEIGHT") {
                                        l_items_details.UHchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.UDchgInd = "Y";
                                    }
                                }
                                if (recordId == "R") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.RWchgInd = "Y";
                                    }
                                    if (keyval == "HEIGHT") {
                                        l_items_details.RHchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.RDchgInd = "Y";
                                    }
                                }
                                if (recordId == "C") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.CWchgInd = "Y";
                                    }
                                    if (keyval == "HEIGHT") {
                                        l_items_details.CHchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.CDchgInd = "Y";
                                    }
                                }
                                if (recordId == "T") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.TWchgInd = "Y";
                                    }
                                    if (keyval == "HEIGHT") {
                                        l_items_details.THchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.TDchgInd = "Y";
                                    }
                                }

                                if (recordId == "D") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.DWchgInd = "Y";
                                    }
                                    if (keyval == "HEIGHT") {
                                        l_items_details.DHchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.DDchgInd = "Y";
                                    }
                                }

                                if (recordId == "N") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.NWchgInd = "Y";
                                    }
                                    if (keyval == "HEIGHT") {
                                        l_items_details.NHchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.NDchgInd = "Y";
                                    }
                                }
                                if (recordId == "O") {
                                    if (keyval == "WIDTH") {
                                        l_items_details.OWchgInd = "Y";
                                    }
                                    if (keyval == "WIDTH") {
                                        l_items_details.OHchgInd = "Y";
                                    }
                                    if (keyval == "DEPTH") {
                                        l_items_details.ODchgInd = "Y";
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //ASA-1540 S
            if (code == "U" && $v("P442_MERCH_STYLE") == 0) {
                $s("P442_ITEM_WIDTH", parseFloat((width * 100).toFixed(3)));
                $s("P442_ITEM_HEIGHT", parseFloat((height * 100).toFixed(3)));
                $s("P442_ITEM_DEPTH", parseFloat((depth * 100).toFixed(3)));
                $s("P442_TRAY_WIDTH", 0);
                $s("P442_TRAY_HGT", 0);
                $s("P442_TRAY_DEPTH", 0);
                $s("P442_DISP_WIDTH", 0);
                $s("P442_DISP_HGT", 0);
                $s("P442_DISP_DEPTH", 0);
                $s("P442_CASE_WIDTH", 0);
                $s("P442_CASE_HGT", 0);
                $s("P442_CASE_DEPTH", 0);
            } else if (code == "T" && $v("P442_MERCH_STYLE") == 1) {
                $s("P442_TRAY_WIDTH", parseFloat((width * 100).toFixed(3)));
                $s("P442_TRAY_HGT", parseFloat((height * 100).toFixed(3)));
                $s("P442_TRAY_DEPTH", parseFloat((depth * 100).toFixed(3)));
                $s("P442_UNIT_PER_TRAY", unit_capacity);
                $s("P442_DISP_WIDTH", 0);
                $s("P442_DISP_HGT", 0);
                $s("P442_DISP_DEPTH", 0);
                $s("P442_CASE_WIDTH", 0);
                $s("P442_CASE_HGT", 0);
                $s("P442_CASE_DEPTH", 0);
                $s("P442_ITEM_WIDTH", 0);
                $s("P442_ITEM_HEIGHT", 0);
                $s("P442_ITEM_DEPTH", 0);
                $s("P442_CONTAIN_VAL", 0);
                $s("P442_NESTING_VAL", 0);
            } else if (code == "D" && $v("P442_MERCH_STYLE") == 3) {
                $s("P442_DISP_WIDTH", parseFloat((width * 100).toFixed(3)));
                $s("P442_DISP_HGT", parseFloat((height * 100).toFixed(3)));
                $s("P442_DISP_DEPTH", parseFloat((depth * 100).toFixed(3)));
                $s("P442_TRAY_WIDTH", 0);
                $s("P442_TRAY_HGT", 0);
                $s("P442_TRAY_DEPTH", 0);
                $s("P442_CASE_WIDTH", 0);
                $s("P442_CASE_HGT", 0);
                $s("P442_CASE_DEPTH", 0);
                $s("P442_ITEM_WIDTH", 0);
                $s("P442_ITEM_HEIGHT", 0);
                $s("P442_ITEM_DEPTH", 0);
                $s("P442_CONTAIN_VAL", 0);
                $s("P442_NESTING_VAL", 0);
            } else if (code == "C" && $v("P442_MERCH_STYLE") == 2) {
                $s("P442_CASE_WIDTH", parseFloat((width * 100).toFixed(3)));
                $s("P442_CASE_HGT", parseFloat((height * 100).toFixed(3)));
                $s("P442_CASE_DEPTH", parseFloat(depth * 100).toFixed(3));
                $s("P442_UNIT_PER_CASE", unit_capacity);
                $s("P442_TRAY_WIDTH", 0);
                $s("P442_TRAY_HGT", 0);
                $s("P442_TRAY_DEPTH", 0);
                $s("P442_DISP_WIDTH", 0);
                $s("P442_DISP_HGT", 0);
                $s("P442_DISP_DEPTH", 0);
                $s("P442_ITEM_WIDTH", 0);
                $s("P442_ITEM_HEIGHT", 0);
                $s("P442_ITEM_DEPTH", 0);
                $s("P442_CONTAIN_VAL", 0);
                $s("P442_NESTING_VAL", 0);
            } else if (code == "R") {
                $s("P442_CRUSH_WDT_PERC", parseFloat((width == '' ? 0 : width).toFixed(3)));    // ASA-1446
                $s("P442_CRUSH_HGT_PERC", parseFloat((height == '' ? 0 : height).toFixed(3)));  // ASA-1446
                $s("P442_CRUSH_DPT_PERC", parseFloat((depth == '' ? 0 : depth).toFixed(3)));    // ASA-1446
            } else if (code == "O" && $v("P442_MERCH_STYLE") == 0) {
                if ($v("P442_ITEM_CONTAIN") == "W") {
                    $s("P442_CONTAIN_VAL", (width * 100).toFixed(2));
                } else if ($v("P442_ITEM_CONTAIN") == "H") {
                    $s("P442_CONTAIN_VAL", (height * 100).toFixed(2));
                } else if ($v("P442_ITEM_CONTAIN") == "D") {
                    $s("P442_CONTAIN_VAL", (depth * 100).toFixed(2));
                }
            } else if (code == "N" && $v("P442_MERCH_STYLE") == 0) {
                if ($v("P442_NESTING") == "W") {
                    $s("P442_NESTING_VAL", (width * 100).toFixed(2));
                } else if ($v("P442_NESTING") == "H") {
                    $s("P442_NESTING_VAL", (height * 100).toFixed(2));
                } else if ($v("P442_NESTING") == "D") {
                    $s("P442_NESTING_VAL", (depth * 100).toFixed(2));
                }
            }

            // ASA-1446
            details.push(width); //ASA-1496 TASK 7
            details.push(height);//ASA-1496 TASK 7
            details.push(depth);//ASA-1496 TASK 7
            details.push(unit_capacity);//ASA-1496 TASK 7
            dim_details[code] = details;
            // unit_capacity = '';
        });
        //ASA-1496 TASK 7 S
        apex.server.process(
            "UPDATE_ITEM_DIM",
            {
                f01: item_code,
                p_clob_01: JSON.stringify(dim_details),//ASA-1496
                // x02: code,
                // x03: width,
                // x04: height,
                // x05: depth,
                // x06: item_multiselct,
                // x07: unit_capacity // ASA-1193
            },
            {
                dataType: "text",
                success: async function (pData) {
                    l_items_details.OrgUW = nvl(dim_details["U"][0]);
                    l_items_details.OrgUH = nvl(dim_details["U"][1]);
                    l_items_details.OrgUD = nvl(dim_details["U"][2]);
                    l_items_details.OrgTW = nvl(dim_details["T"][0]);
                    l_items_details.OrgTH = nvl(dim_details["T"][1]);
                    l_items_details.OrgTD = nvl(dim_details["T"][2]);
                    l_items_details.OrgDW = nvl(dim_details["D"][0]);
                    l_items_details.OrgDH = nvl(dim_details["D"][1]);
                    l_items_details.OrgDD = nvl(dim_details["D"][2]);
                    l_items_details.OrgCW = nvl(dim_details["C"][0]);
                    l_items_details.OrgCH = nvl(dim_details["C"][1]);
                    l_items_details.OrgCD = nvl(dim_details["C"][2]);
                    l_items_details.OrgCWPerc = nvl(dim_details["R"][0]);
                    l_items_details.OrgCHPerc = nvl(dim_details["R"][1]);
                    l_items_details.OrgCDPerc = nvl(dim_details["R"][2]);
                    l_items_details.OrgCnW = nvl(dim_details["O"][0]);
                    l_items_details.OrgCnH = nvl(dim_details["O"][1]);
                    l_items_details.OrgCnD = nvl(dim_details["O"][2]);
                    l_items_details.CnW = nvl(dim_details["O"][0]);
                    l_items_details.CnH = nvl(dim_details["O"][1]);
                    l_items_details.CnD = nvl(dim_details["O"][2]);
                    l_items_details.NW = nvl(dim_details["N"][0]);
                    l_items_details.NH = nvl(dim_details["N"][1]);
                    l_items_details.ND = nvl(dim_details["N"][2]);
                    l_items_details.OrgNW = nvl(dim_details["N"][0]);
                    l_items_details.OrgNH = nvl(dim_details["N"][1]);
                    l_items_details.OrgND = nvl(dim_details["N"][2]);
                    l_items_details.dim_details = dim_details;
                    apex.message.showPageSuccess(apex.lang.getMessage("APEX.IG.CHANGES_SAVED"));

                    g_dblclick_opened = "N";
                    if (l_items_details.g_multiselect !== "Y" && l_items_details.CType !== 'CHEST') {//ASA-1300
                        if (typeof l_items_details.ShelfInfo !== 'undefined') {
                            if (l_items_details.ShelfInfo[0].Combine == 'N' || l_items_details.ShelfInfo[0].Combine == '') {
                                await get_crush_perc(l_items_details);
                            }
                        } else {
                            await get_crush_perc(l_items_details);
                        }
                    }
                    closeInlineDialog("item_dim_details");

                }, loadingIndicatorPosition: "page",
            }
        );
        //ASA-1496 TASK 7 E
        logDebug("function : save_item_master", "E");
    } catch (err) {
        console.log("err", err);
    }
}

function validate_submit() {
    try {
        logDebug("function : validate_submit ", "S");
        var nesting_value = parseFloat($v("P442_NESTING_VAL")) / 100;//ASA-1410, shifted out of if-else
        if (l_items_details.g_multiselect == "N" && l_items_details.g_ctrl_select == "N") {
            //ASA-1408 issue 7
            var maHFacing = l_items_details.MHorizFacings, maxVFacing = l_items_details.MVertFacings, maxDFacing = l_items_details.MDepthFacings;
            if (parseFloat($v("P442_POG_MAX_H_FACINGS")) > 0 && parseFloat($v("P442_POG_MAX_H_FACINGS")) > maHFacing) {
                maHFacing = parseFloat($v("P442_POG_MAX_H_FACINGS"));
            }
            if (parseFloat($v("P442_POG_MAX_V_FACINGS")) > 0 && parseFloat($v("P442_POG_MAX_V_FACINGS")) > maxVFacing) {
                maxVFacing = parseFloat($v("P442_POG_MAX_V_FACINGS"));
            }
            if (parseFloat($v("P442_POG_MAX_D_FACINGS")) > 0 && parseFloat($v("P442_POG_MAX_D_FACINGS")) > maxDFacing) {
                maxDFacing = parseFloat($v("P442_POG_MAX_D_FACINGS"));
            }
            if (($v("P442_MERCH_STYLE") == "0" && parseFloat($v("P442_ITEM_WIDTH")) / 100 <= 0 && parseFloat($v("P442_ITEM_HEIGHT")) / 100 <= 0 && parseFloat($v("P442_ITEM_DEPTH")) / 100 <= 0) || ($v("P442_MERCH_STYLE") == "2" && parseFloat($v("P442_CASE_WIDTH")) / 100 <= 0 && parseFloat($v("P442_CASE_HGT")) / 100 <= 0 && parseFloat($v("P442_CASE_DEPTH")) / 100 <= 0) || ($v("P442_MERCH_STYLE") == "1" && parseFloat($v("P442_TRAY_WIDTH")) / 100 <= 0 && parseFloat($v("P442_TRAY_HGT")) / 100 <= 0 && parseFloat($v("P442_TRAY_DEPTH")) / 100 <= 0) || ($v("P442_MERCH_STYLE") == "3" && parseFloat($v("P442_DISP_WIDTH")) / 100 <= 0 && parseFloat($v("P442_DISP_HGT")) / 100 <= 0 && parseFloat($v("P442_DISP_DEPTH")) / 100 <= 0)) {
                alert(get_message("DIM_NOT_NULL"));
            } else if (parseFloat($v("P442_ITEM_BASE_HORIZ")) == 0 || parseFloat($v("P442_ITEM_BASE_VERT")) == 0 || parseFloat($v("P442_ITEM_BASE_DEPTH")) == 0 || parseFloat($v("P442_POG_MAX_V_FACINGS")) == 0 || parseFloat($v("P442_POG_MAX_H_FACINGS")) == 0 || parseFloat($v("P442_POG_MAX_D_FACINGS")) == 0) { //ASA – 1408 //ASA-1408 issue 1
                alert(get_message("FACING_NOT_LESS_TH_ONE"));
            } else if ((maHFacing < parseFloat($v("P442_ITEM_BASE_HORIZ")) && maHFacing > -1) || (maxVFacing < parseFloat($v("P442_ITEM_BASE_VERT")) && maxVFacing > -1) || (maxDFacing < parseFloat($v("P442_ITEM_BASE_DEPTH")) && maxDFacing > -1)) {
                //ASA-1408 issue 7
                alert(get_message("POGCR_MAX_FACING_REACH"));
            } else if ($v("P442_ITEM_ROTATION") !== "" && (parseFloat($v("P442_ITEM_ROTATION")) > 359 || parseFloat($v("P442_ITEM_ROTATION")) < 0)) {
                alert(get_message("ROTATION_BTW_RANGE"));
            } else if (nesting_value > 0 && $v("P442_NESTING") == "H" && nesting_value > l_items_details.H) {
                alert(get_message("LOST_FROM_NEST_HGT_GRT", l_items_details.Shelf));
            } else if (nesting_value > 0 && $v("P442_NESTING") == "W" && nesting_value > l_items_details.W) {
                alert(get_message("LOST_FROM_NEST_WDT_GRT", l_items_details.Shelf));
            } else if (nesting_value > 0 && $v("P442_NESTING") == "D" && nesting_value > l_items_details.D) {
                alert(get_message("LOST_FROM_NEST_DPT_GRT", l_items_details.Shelf));
            } else if (parseFloat($v("P442_CRUSH_WDT_PERC")) > 100 || parseFloat($v("P442_CRUSH_HGT_PERC")) > 100 || parseFloat($v("P442_CRUSH_DPT_PERC")) > 100) {
                alert(get_message("ITEM_CRUSH_GRT_100", l_items_details.Shelf));
            } else if ($v("P442_CAP_STYLE") == "1" && $v("P442_CAP_FACING") > 1) {
                alert(get_message("CAP_HORZ_FAC_GRT_ERR"));
            } else {
                submit_items("S");
            }
        } else {
            //ASA-1410
            if (nesting_value > 0 && $v("P442_NESTING") == "H" && nesting_value > l_items_details.H) {
                alert(get_message("LOST_FROM_NEST_HGT_GRT", l_items_details.Shelf));
            } else if (nesting_value > 0 && $v("P442_NESTING") == "W" && nesting_value > l_items_details.W) {
                alert(get_message("LOST_FROM_NEST_WDT_GRT", l_items_details.Shelf));
            } else if (nesting_value > 0 && $v("P442_NESTING") == "D" && nesting_value > l_items_details.D) {
                alert(get_message("LOST_FROM_NEST_DPT_GRT", l_items_details.Shelf));
            } else if ($v("P442_CAP_STYLE") == "1" && $v("P442_CAP_FACING") > 1) {
                alert(get_message("CAP_HORZ_FAC_GRT_ERR"));
            } else {
                submit_items("M");
            }
        }
        logDebug("function : validate_submit ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function submit_items(p_option) {
    try {
        logDebug("function : submit_items ", "S");
        var sucess = 'Y';
        if (p_option == "M") {
            l_items_details.PegID = $v("P442_PEG_ID");
            l_items_details.PegSpread = $v("P442_PEG_SPREAD");
            l_items_details.Fixed = $v("P442_ITEM_FIXED");
            l_items_details.Orientation = $v("P442_ITEM_ORIENTATION");
            l_items_details.MerchStyle = $v("P442_MERCH_STYLE");
            l_items_details.Color = $v("P442_ITEM_COLOR");
            l_items_details.MPogVertFacings = parseFloat($v("P442_POG_MAX_V_FACINGS")); //ASA-1408
            l_items_details.MPogHorizFacings = parseFloat($v("P442_POG_MAX_H_FACINGS")); //ASA-1408
            l_items_details.MPogDepthFacings = parseFloat($v("P442_POG_MAX_D_FACINGS")); //ASA-1408 //ASA-1408 issue 1
            l_items_details.Action = "U";
            //ASA-1410
            l_items_details.ItemNesting = $v("P442_NESTING");
            l_items_details.NestingVal = parseFloat($v("P442_NESTING_VAL")) / 100;
            //ASA-1496 issue 5 S
            // if ($v("P442_NESTING") == "W") {
            //     l_items_details.NW = parseFloat($v("P442_NESTING_VAL")) / 100;
            // } else if ($v("P442_NESTING") == "H") {
            //     l_items_details.NH = parseFloat($v("P442_NESTING_VAL")) / 100;
            // } else if ($v("P442_NESTING") == "D") {
            //     l_items_details.ND = parseFloat($v("P442_NESTING_VAL")) / 100;
            // }
            //ASA-1496 issue 5 E
            l_items_details.CapStyle = $v("P442_CAP_STYLE");
            l_items_details.CapFacing = $v("P442_CAP_FACING");
            l_items_details.CapMerch = $v("P442_CAP_MERCH_STYLE");
            l_items_details.CapOrientaion = $v("P442_CAP_ORIENTATION");
            l_items_details.CapDepth = $v("P442_CAP_DEPT");
            l_items_details.CapHorz = $v("P442_CAP_HORZ");
            l_items_details.CapMaxH = parseFloat($v("P442_CAP_MAX_HIGH"));
            l_items_details.MaxHCapStyle = $v("P442_MAX_HIGH_CAP_STYLE");
            l_items_details.CapDepthChanged = $v("P442_CAP_DEPTH_CHANGED");
        } else {
            l_items_details.ItemNesting = $v("P442_NESTING");
            l_items_details.OrientationDesc = $("#P442_ITEM_ORIENTATION :selected").text();
            l_items_details.ItemContain = $v("P442_ITEM_CONTAIN");
            l_items_details.IsContainer = $v("P442_PRODUCT_IS_CONT");

            if ($v("P442_ITEM_CONTAIN") == "W") {
                l_items_details.CnW = parseFloat($v("P442_CONTAIN_VAL")) / 100;
            } else if ($v("P442_ITEM_CONTAIN") == "H") {
                l_items_details.CnH = parseFloat($v("P442_CONTAIN_VAL")) / 100;
            } else if ($v("P442_ITEM_CONTAIN") == "D") {
                l_items_details.CnD = parseFloat($v("P442_CONTAIN_VAL")) / 100;
            }
            //ASA-1496 issue 5 S
            // if ($v("P442_NESTING") == "W") {
            //     l_items_details.NW = parseFloat($v("P442_NESTING_VAL")) / 100;
            // } else if ($v("P442_NESTING") == "H") {
            //     l_items_details.NH = parseFloat($v("P442_NESTING_VAL")) / 100;
            // } else if ($v("P442_NESTING") == "D") {
            //     l_items_details.ND = parseFloat($v("P442_NESTING_VAL")) / 100;
            // }
            //ASA-1496 issue 5 E
            l_items_details.BHoriz = parseFloat($v("P442_ITEM_BASE_HORIZ"));
            l_items_details.BVert = parseFloat($v("P442_ITEM_BASE_VERT"));
            if (l_items_details.CType == "BASKET") {
                l_items_details.BaseD = parseFloat($v("P442_ITEM_QTY"));
            } else {
                l_items_details.BaseD = parseFloat($v("P442_ITEM_BASE_DEPTH"));
            }
            l_items_details.NestingVal = parseFloat($v("P442_NESTING_VAL")) / 100;
            l_items_details.ContainVal = parseFloat($v("P442_CONTAIN_VAL")) / 100;
            l_items_details.Color = $v("P442_ITEM_COLOR");
            l_items_details.MPogVertFacings = parseFloat($v("P442_POG_MAX_V_FACINGS")); //ASA-1408
            l_items_details.MPogHorizFacings = parseFloat($v("P442_POG_MAX_H_FACINGS")); //ASA-1408
            l_items_details.MPogDepthFacings = parseFloat($v("P442_POG_MAX_D_FACINGS")); //ASA-1408 //ASA-1408 issue 1
            l_items_details.UnitperCase = $v("P442_UNIT_PER_CASE"); //ASA-1136 --S
            l_items_details.UnitperTray = $v("P442_UNIT_PER_TRAY");
            l_items_details.Fixed = $v("P442_ITEM_FIXED");
            l_items_details.LocID = $v("P442_LOCATION_ID");
            l_items_details.Orientation = $v("P442_ITEM_ORIENTATION");
            l_items_details.MerchStyle = $v("P442_MERCH_STYLE");
            l_items_details.Rotation = parseFloat($v("P442_ITEM_ROTATION"));
            l_items_details.CapStyle = $v("P442_CAP_STYLE");
            l_items_details.CapFacing = $v("P442_CAP_FACING"); //ASA-1170
            l_items_details.CapMerch = $v("P442_CAP_MERCH_STYLE"); //ASA-1170
            l_items_details.CapOrientaion = $v("P442_CAP_ORIENTATION"); //ASA-1170
            l_items_details.CapDepth = $v("P442_CAP_DEPT"); //ASA-1179
            l_items_details.CapHorz = $v("P442_CAP_HORZ"); //ASA-1179
            l_items_details.CapMaxH = parseFloat($v("P442_CAP_MAX_HIGH"));
            l_items_details.MaxHCapStyle = $v("P442_MAX_HIGH_CAP_STYLE");
            l_items_details.PegID = $v("P442_PEG_ID");
            l_items_details.PegSpread = $v("P442_PEG_SPREAD");
            l_items_details.PegPerFacing = $v("P442_PEG_PER_FACING");
            l_items_details.BsktFactor = parseFloat($v("P442_BASKET_FACTOR")) / 100;
            l_items_details.OverHang = parseFloat($v("P442_ITEM_OVERHANG")) / 100;
            l_items_details.HorizGap = parseFloat($v("P442_ITEM_HORIZ_GAP")) / 100;
            l_items_details.VertGap = parseFloat($v("P442_ITEM_VERT_GAP")) / 100;
            l_items_details.Quantity = parseFloat($v("P442_ITEM_QTY"));
            l_items_details.CapDepthChanged = $v("P442_CAP_DEPTH_CHANGED");
            l_items_details.Action = "U";
        }
        if (l_items_details.CapStyle !== 0 && $v("P442_CAP_DEPTH_CHANGED") == 'Y') {
            sucess = await validate_cap_depth();
        }
        if (sucess == "Y") {
            var l_combine_crush = "N";//ASA-1307
            if (p_option !== "M") {
                g_combinedShelfs = l_items_details.g_combinedShelfs;
                var [oldCombinationIndex, oldShelfCombIndx] = getCombinationShelf(l_items_details.PIndex, l_items_details.ShelfInfo[0].Shelf);
                if (oldCombinationIndex !== -1) {
                    l_combine_crush = g_combinedShelfs[oldCombinationIndex][0].AllowAutoCrush;
                }
            }

            if (auto_crush == "Y" || l_combine_crush == "Y") {
                // S ASA-1104
                    //if ($v("P442_CRUSH_HORIZ") > 0 && $v("P442_CRUSH_HORIZ") > $v("P442_CRUSH_WDT_PERC") && $v("P442_CRUSH_VERT") > 0 && $v("P442_CRUSH_VERT") > $v("P442_CRUSH_HGT_PERC") && $v("P442_CRUSH_DEPTH") > 0 && $v("P442_CRUSH_DEPTH") > $v("P442_CRUSH_DPT_PERC")) {
                    //ASA-2024.3 Start
                    //ASA-2024 Issue4 Start
                    var [itemW, itemH, itemD, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(l_items_details.OldOrientation, l_items_details.OW, l_items_details.OH, l_items_details.OD);
                    if (l_items_details.OldOrientation == "0") {
                        l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ"));
                        l_items_details.CrushVert = parseFloat($v("P442_CRUSH_VERT"));
                        l_items_details.CrushD = parseFloat($v("P442_CRUSH_DEPTH"));
                    } else if (l_items_details.OldOrientation !== "0") {
                        if (actualHeight == "H") {
                            l_items_details.CrushVert = parseFloat($v("P442_CRUSH_VERT"));
                        } else if (actualHeight == "W") {
                            l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_VERT"));
                        } else if (actualHeight == "D") {
                            l_items_details.CrushD = parseFloat($v("P442_CRUSH_VERT"));
                        }
                        if (actualWidth == "H") {
                            l_items_details.CrushVert = parseFloat($v("P442_CRUSH_HORIZ"));
                        } else if (actualWidth == "W") {
                            l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ"));
                        } else if (actualWidth == "D") {
                            l_items_details.CrushD = parseFloat($v("P442_CRUSH_HORIZ"));
                        }
                        if (actualDepth == "H") {
                            l_items_details.CrushVert = parseFloat($v("P442_CRUSH_DEPTH"));
                        } else if (actualDepth == "W") {
                            l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_DEPTH"));
                        } else if (actualDepth == "D") {
                            l_items_details.CrushD = parseFloat($v("P442_CRUSH_DEPTH"));
                        }
                    }
                    if (l_items_details.OrientationChng == "Y") {
                        if (l_items_details.HorizAutoCrushed == "Y") {
                            if (actualWidth == "D") {
                                l_items_details.CrushD = 0;
                            } else if (actualWidth == "W") {
                                l_items_details.CrushHoriz = 0;
                            } else if (actualWidth == "H")  {
                                l_items_details.CrushVert = 0;
                            }
                        };
                        if (l_items_details.VertAutoCrushed == "Y") {
                            if (actualHeight == "D") {
                                l_items_details.CrushD = 0;
                            } else if (actualHeight == "W") {
                                l_items_details.CrushHoriz = 0;
                            } else if (actualHeight == "H")  {
                                l_items_details.CrushVert = 0;
                            }
                        };
                        if (l_items_details.DepthAutoCrushed == "Y") {
                            if (actualDepth == "D") {
                                l_items_details.CrushD = 0;
                            } else if (actualDepth == "W") {
                                l_items_details.CrushHoriz = 0;
                            } else if (actualDepth == "H")  {
                                l_items_details.CrushVert = 0;
                            }
                        };
                    }
                    //ASA-2024 Issue4 End
                    l_items_details.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC"));
                    l_items_details.CHPerc = parseFloat($v("P442_CRUSH_HGT_PERC"));
                    l_items_details.CDPerc = parseFloat($v("P442_CRUSH_DPT_PERC"));
                    //ASA-2024.3 End
                    if (l_combine_crush == "Y") {//ASA-1307
                        l_items_details.ShelfAutoCrush = l_combine_crush;
                    }
                    //}

                sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                apex.submit("SAVE_FINAL");
            } else {
                //SM3.20230807 Regression Issue 10, removed "$v("P442_CRUSH_WDT_PERC") > 0 && $v("P442_CRUSH_WDT_PERC") <= 50" from below if block
                if (l_items_details.CType == "SHELF" || l_items_details.g_multiselect == 'Y' || l_items_details.CType == "CHEST") { //ASA-1300
                    if (parseFloat($v("P442_CRUSH_WDT_PERC")) > 0 || parseFloat($v("P442_CRUSH_HGT_PERC")) > 0 || parseFloat($v("P442_CRUSH_DPT_PERC")) > 0) {
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
                        var c_type = typeof l_items_details.CType !== 'undefined' ? l_items_details.CType.toLowerCase() : '';//ASA1318 Task 4 -- when multi edit item. this will not have value.

                        //Task_29818 - Start
                        // ax_message.confirm(get_message("POGCR_SHELF_AUTO_CRUSH", c_type), function (e) {
                        //     if (e) {
                        //         l_items_details.ShelfAutoCrush = "Y";
                        //         l_items_details.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC"));
                        //         l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ"));
                        //         l_items_details.CHPerc = parseFloat($v("P442_CRUSH_HGT_PERC"));
                        //         l_items_details.CrushVert = parseFloat($v("P442_CRUSH_VERT"));
                        //         l_items_details.CDPerc = parseFloat($v("P442_CRUSH_DPT_PERC"));
                        //         l_items_details.CrushD = parseFloat($v("P442_CRUSH_DEPTH"));
                        //         sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                        //         apex.submit("SAVE_FINAL");

                        //     } else {
                        //         l_items_details.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC"));
                        //         l_items_details.CHPerc = parseFloat($v("P442_CRUSH_HGT_PERC"));
                        //         l_items_details.CDPerc = parseFloat($v("P442_CRUSH_DPT_PERC"));
                        //         if (l_items_details.CType == 'CHEST') {
                        //             l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ"));
                        //             l_items_details.CrushVert = parseFloat($v("P442_CRUSH_VERT"));
                        //             l_items_details.CrushD = parseFloat($v("P442_CRUSH_DEPTH"));
                        //         }
                        //         l_items_details.ShelfAutoCrush = "N";
                        //         sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                        //         apex.submit("SAVE_FINAL");
                        //     }
                        // });

                        confirm(
                            get_message("POGCR_SHELF_AUTO_CRUSH", c_type),
                            get_message("SHCT_YES"),
                            get_message("SHCT_NO"),
                            function(){
                                l_items_details.ShelfAutoCrush = "Y";
                                l_items_details.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC"));
                                l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ"));
                                l_items_details.CHPerc = parseFloat($v("P442_CRUSH_HGT_PERC"));
                                l_items_details.CrushVert = parseFloat($v("P442_CRUSH_VERT"));
                                l_items_details.CDPerc = parseFloat($v("P442_CRUSH_DPT_PERC"));
                                l_items_details.CrushD = parseFloat($v("P442_CRUSH_DEPTH"));
                                sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                                apex.submit("SAVE_FINAL");
                            },
                            function(){
                                l_items_details.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC"));
                                l_items_details.CHPerc = parseFloat($v("P442_CRUSH_HGT_PERC"));
                                l_items_details.CDPerc = parseFloat($v("P442_CRUSH_DPT_PERC"));
                                if (l_items_details.CType == 'CHEST') {
                                    l_items_details.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ"));
                                    l_items_details.CrushVert = parseFloat($v("P442_CRUSH_VERT"));
                                    l_items_details.CrushD = parseFloat($v("P442_CRUSH_DEPTH"));
                                }
                                l_items_details.ShelfAutoCrush = "N";
                                sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                                apex.submit("SAVE_FINAL");
                            }
                        );
                        //Task_29818 - End
                    } else {
                        l_items_details.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC"));
                        l_items_details.CHPerc = parseFloat($v("P442_CRUSH_HGT_PERC"));
                        l_items_details.CDPerc = parseFloat($v("P442_CRUSH_DPT_PERC"));
                        l_items_details.ShelfAutoCrush = "N";
                        sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                        apex.submit("SAVE_FINAL");
                    }
                } // E ASA-1104
                else {
                    sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                    apex.submit("SAVE_FINAL");
                }
            }
        }
        logDebug("function : submit_items ", "E");
    } catch (err) {
        error_handling(err);
    }
}

//Start Task_26899
function reset_manual_cursh() {
    if (l_items_details.g_multiselect == "N" && l_items_details.g_ctrl_select == "N" && l_items_details.OldOrientation !== $v("P442_ITEM_ORIENTATION")) { //ASA-2024 Issue4
        var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim($v("P442_ITEM_ORIENTATION"), l_items_details.OW, l_items_details.OH, l_items_details.OD);
        var [itemwidth, itemheight, itemdepth, oactualHeight, oactualWidth, oactualDepth] = get_new_orientation_dim(l_items_details.OldOrientation, l_items_details.OW, l_items_details.OH, l_items_details.OD);

        l_items_details.actualDepth = actualDepth;
        l_items_details.actualHeight = actualHeight;
        l_items_details.actualWidth = actualWidth;
        l_items_details.MHorizCrushed = 'N';
        l_items_details.MVertCrushed = 'N';
        l_items_details.MDepthCrushed = 'N';

        // ASA-2024.3 Start
        if (l_items_details.HorizAutoCrushed == "Y") {
            if (oactualWidth == "D") {
                l_items_details.CrushD = 0;
            } else if (oactualWidth == "W") {
                l_items_details.CrushHoriz = 0;
            } else if (oactualWidth == "H")  {
                l_items_details.CrushVert = 0;
            }
        };
        if (l_items_details.VertAutoCrushed == "Y") {
            if (oactualHeight == "D") {
                l_items_details.CrushD = 0;
            } else if (oactualHeight == "W") {
                l_items_details.CrushHoriz = 0;
            } else if (oactualHeight == "H")  {
                l_items_details.CrushVert = 0;
            }
        };
        if (l_items_details.DepthAutoCrushed == "Y") {
            if (oactualDepth == "D") {
                l_items_details.CrushD = 0;
            } else if (oactualDepth == "W") {
                l_items_details.CrushHoriz = 0;
            } else if (oactualDepth == "H")  {
                l_items_details.CrushVert = 0;
            }
        };
        let l_crushHoriz  = l_items_details.CrushHoriz;
        let l_crushVert  = l_items_details.CrushVert;
        let l_crushDepth  = l_items_details.CrushD;
        if ((actualHeight == "W" && l_crushHoriz > 0) || (actualHeight == "H" && l_crushVert > 0) || (actualHeight == "D" && l_crushDepth > 0)) {
            if (l_items_details.VertAutoCrushed == "N") { //ASA-2024 Issue4
                l_items_details.MVertCrushed = 'Y';
            }
        }
        if ((actualWidth == 'W' && l_crushHoriz > 0) || (actualWidth == 'H' && l_crushVert > 0) || (actualWidth == 'D' && l_crushDepth > 0)) {
            if (l_items_details.HorizAutoCrushed == "N") { //ASA-2024 Issue4
                l_items_details.MHorizCrushed = 'Y';
            }
        }
        if ((actualDepth == 'W' && l_crushHoriz > 0) || (actualDepth == 'H' && l_crushVert > 0) || (actualDepth == 'D' && l_crushDepth > 0)) {
            if ($v("P442_CAP_STYLE") == "0" || $v("P442_CAP_STYLE") == "") {
                if (l_items_details.DepthAutoCrushed == "N") { //ASA-2024 Issue4
                    l_items_details.MDepthCrushed = 'Y';
                }
            } else {
                l_items_details.MDepthCrushed = 'N';
            }
        }
        // ASA-2024.3 End
    }
}//End Task_26899

async function get_crush_perc(p_items_details) {
    var total_width = 0;
    var shelfdtl = p_items_details.ShelfInfo[0];
    var horiz_gap,
        spread_gap,
        item_width,
        item_height,
        item_depth;
    var items_arr = p_items_details.ItemInfo;
    var crush_width = parseFloat($v("P442_CRUSH_WDT_PERC")),
        crush_height = parseFloat($v("P442_CRUSH_HGT_PERC")),
        crush_depth = parseFloat($v("P442_CRUSH_DPT_PERC"));
    var crush_index_arr = [];
    var crush_width_arr = [],
        crush_horiz_arr = [];
    var new_item_sum = 0;
    var crush_item_ind = "N";
    var new_crush_perc = 0;
    var new_avilable_space = 0;
    var l_called_from = "X";

    if ($v("P442_MERCH_STYLE") == "0") {
        if (parseFloat(p_items_details.UW.toFixed(3)) !== parseFloat(p_items_details.OrgUW.toFixed(3)) || parseFloat(p_items_details.UH.toFixed(3)) !== parseFloat(p_items_details.OrgUH.toFixed(3)) || parseFloat(p_items_details.UD.toFixed(3)) !== parseFloat(p_items_details.OrgUD.toFixed(3))) {
            item_width = p_items_details.OrgUW;
            item_height = p_items_details.OrgUH;
            item_depth = p_items_details.OrgUD;
        } else {
            item_width = p_items_details.UW;
            item_height = p_items_details.UH;
            item_depth = p_items_details.UD;
        }
    } else if ($v("P442_MERCH_STYLE") == "2") {
        if (parseFloat(p_items_details.CW.toFixed(3)) !== parseFloat(p_items_details.OrgCW.toFixed(3)) || parseFloat(p_items_details.CH.toFixed(3)) !== parseFloat(p_items_details.OrgCH.toFixed(3)) || parseFloat(p_items_details.CD.toFixed(3)) !== parseFloat(p_items_details.OrgCD.toFixed(3))) {
            item_width = p_items_details.OrgCW;
            item_height = p_items_details.OrgCH;
            item_depth = p_items_details.OrgCD;
        } else {
            item_width = p_items_details.CW;
            item_height = p_items_details.CH;
            item_depth = p_items_details.CD;
        }
    } else if ($v("P442_MERCH_STYLE") == "1") {
        if (parseFloat(p_items_details.TW.toFixed(3)) !== parseFloat(p_items_details.OrgTW.toFixed(3)) || parseFloat(p_items_details.TH.toFixed(3)) !== parseFloat(p_items_details.OrgTH.toFixed(3)) || parseFloat(p_items_details.TD.toFixed(3)) !== parseFloat(p_items_details.OrgTD.toFixed(3))) {
            item_width = p_items_details.OrgTW;
            item_height = p_items_details.OrgTH;
            item_depth = p_items_details.OrgTD;
        } else {
            item_width = p_items_details.TW;
            item_height = p_items_details.TH;
            item_depth = p_items_details.TD;
        }
    } else if ($v("P442_MERCH_STYLE") == "3") {
        if (parseFloat(p_items_details.DW.toFixed(3)) !== parseFloat(p_items_details.OrgDW.toFixed(3)) || parseFloat(p_items_details.DH.toFixed(3)) !== parseFloat(p_items_details.OrgDH.toFixed(3)) || parseFloat(p_items_details.DD.toFixed(3)) !== parseFloat(p_items_details.OrgDD.toFixed(3))) {
            item_width = p_items_details.OrgDW;
            item_height = p_items_details.OrgDH;
            item_depth = p_items_details.OrgDD;
        } else {
            item_width = p_items_details.DW;
            item_height = p_items_details.DH;
            item_depth = p_items_details.DD;
        }
    }
    var base_depth = 0;
    if (shelfdtl.ObjType == "BASKET") {
        base_depth = parseFloat($v("P442_ITEM_QTY"));
    } else {
        base_depth = parseFloat($v("P442_ITEM_BASE_DEPTH"));
    }
    item_width = item_width * parseFloat($v("P442_ITEM_BASE_HORIZ")) + (parseFloat($v("P442_ITEM_HORIZ_GAP")) / 100) * (parseFloat($v("P442_ITEM_BASE_HORIZ")) - 1);
    item_height = item_height * parseFloat($v("P442_ITEM_BASE_VERT")) + (parseFloat($v("P442_ITEM_VERT_GAP")) / 100) * (parseFloat($v("P442_ITEM_BASE_VERT")) - 1);
    item_depth = item_depth * ((p_items_details.g_overhung_shelf_active == 'Y' || p_items_details.g_auto_cal_depth_fac == 'Y') ? 1 : base_depth);

    if (shelfdtl.ObjType == "PEGBOARD") {
        var horiz_gap = shelfdtl.VertiSpacing;
    } else {
        var horiz_gap = shelfdtl.HorizGap;
    }
    if (horiz_gap > 0) {
        spread_gap = horiz_gap;
    } else {
        spread_gap = 0;
    }
    for (const items of p_items_details.ItemInfo) {
        if (p_items_details.ObjID !== items.ObjID) {
            total_width += items.W + spread_gap;
        }
    }
    total_width = total_width + item_width;

    if (total_width > shelfdtl.W) {
        var i = 0;
        var items_crush_width = 0;
        for (const items of items_arr) {
            if (items.ObjID == p_items_details.ObjID) {
                items.CWPerc = parseFloat($v("P442_CRUSH_WDT_PERC")); //ASA-1223
                items.CrushHoriz = parseFloat($v("P442_CRUSH_HORIZ")); //ASA-1223
            }
            items_crush_width = (typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == "N") && parseFloat($v("P442_CRUSH_WDT_PERC")) > 0 ? items.CWPerc : items.CrushHoriz;
            if (items.Fixed == "N" && items_crush_width > 0) {
                crush_item_ind = "Y";
                crush_index_arr.push(i);
                crush_width_arr.push(items.W);
                crush_horiz_arr.push(items.CrushHoriz);
            }
            i++;
        }
        if (crush_item_ind == "Y") {
            for (i = 1; i < 100; i++) {
                new_item_sum = 0;
                var new_width = 0;
                var j = 0;
                for (const items of items_arr) {
                    var items_crush_width = 0;
                    items_crush_width = (typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == "N") && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz; //ASA-1223
                    if (crush_index_arr.indexOf(j) !== -1 && i <= items_crush_width) {
                        new_width = items.RW - items.RW * (i / 100); //ASA-1223
                        if (new_width >= items.RW - items.RW * (items_crush_width / 100)) { //ASA-1223
                            new_item_sum += new_width;
                            items.W = new_width;
                            items.CrushHoriz = i;
                        } else {
                            new_item_sum += items.RW; //ASA-1223
                        }
                    } else {
                        new_item_sum += items.W;
                    }
                    if (horiz_gap > 0) {
                        new_item_sum += items.SpreadItem;
                    }
                    j++;
                }
                new_avilable_space = shelfdtl.W - new_item_sum;
                if (new_avilable_space >= 0) {
                    item_width = new_width;
                    new_crush_perc = i;
                    l_called_from = 'X';
                    break;
                } else {
                    l_called_from = 'W';
                }
            }
            $s("P442_CRUSH_HORIZ", new_crush_perc);
        }
    }
    new_crush_perc = 0;
    if (item_height > p_items_details.Maxmerch) {
        for (i = 0; i < crush_height; i++) {
            new_height = item_height - (item_height * i) / 100;
            if (p_items_details.Maxmerch >= new_height) {
                new_crush_perc = i;
                l_called_from = 'X';
                break;
            } else {
                l_called_from = 'V';
            }
        }
        $s("P442_CRUSH_VERT", new_crush_perc);
    }
    new_crush_perc = 0;
    if (item_depth > shelfdtl.D) {
        var new_depth = 0;
        // var crush_value = 0;
        for (j = 0; j <= crush_depth; j++) {
            new_depth = item_depth - (item_depth * j) / 100;
            if (shelfdtl.D >= new_depth) {
                new_crush_perc = j;
                l_called_from = 'X';
                break;
            } else {
                l_called_from = 'D';
            }
        }
        $s("P442_CRUSH_DEPTH", new_crush_perc);
    }

    if (l_called_from != 'X') {
        switch (l_called_from) {
            case 'D':
                l_called_from = get_message("POGCR_CRUSH_DEPTH");
                break;
            case 'H':
                l_called_from = get_message("POGCR_CRUSH_HOZI");
                break;
            case 'V':
                l_called_from = get_message("POGCR_CRUSH_VERT");
                break;
        };

        alert(get_message("POGCR_VALIDATE_CRUSH_PER", l_called_from));
    }
}

async function validate_cap_depth() {
    return new Promise((resolve, reject) => {
        var item_width, item_height, item_depth, cap_width, cap_height, cap_depth;
        if ($v("P442_MERCH_STYLE") == "0") {
            if (parseFloat(l_items_details.UW.toFixed(3)) !== parseFloat(l_items_details.OrgUW.toFixed(3)) || parseFloat(l_items_details.UH.toFixed(3)) !== parseFloat(l_items_details.OrgUH.toFixed(3)) || parseFloat(l_items_details.UD.toFixed(3)) !== parseFloat(l_items_details.OrgUD.toFixed(3))) {
                item_width = l_items_details.OrgUW;
                item_height = l_items_details.OrgUH;
                item_depth = l_items_details.OrgUD;
            } else {
                item_width = l_items_details.UW;
                item_height = l_items_details.UH;
                item_depth = l_items_details.UD;
            }
        } else if ($v("P442_MERCH_STYLE") == "2") {
            if (parseFloat(l_items_details.CW.toFixed(3)) !== parseFloat(l_items_details.OrgCW.toFixed(3)) || parseFloat(l_items_details.CH.toFixed(3)) !== parseFloat(l_items_details.OrgCH.toFixed(3)) || parseFloat(l_items_details.CD.toFixed(3)) !== parseFloat(l_items_details.OrgCD.toFixed(3))) {
                item_width = l_items_details.OrgCW;
                item_height = l_items_details.OrgCH;
                item_depth = l_items_details.OrgCD;
            } else {
                item_width = l_items_details.CW;
                item_height = l_items_details.CH;
                item_depth = l_items_details.CD;
            }
        } else if ($v("P442_MERCH_STYLE") == "1") {
            if (parseFloat(l_items_details.TW.toFixed(3)) !== parseFloat(l_items_details.OrgTW.toFixed(3)) || parseFloat(l_items_details.TH.toFixed(3)) !== parseFloat(l_items_details.OrgTH.toFixed(3)) || parseFloat(l_items_details.TD.toFixed(3)) !== parseFloat(l_items_details.OrgTD.toFixed(3))) {
                item_width = l_items_details.OrgTW;
                item_height = l_items_details.OrgTH;
                item_depth = l_items_details.OrgTD;
            } else {
                item_width = l_items_details.TW;
                item_height = l_items_details.TH;
                item_depth = l_items_details.TD;
            }
        } else if ($v("P442_MERCH_STYLE") == "3") {
            if (parseFloat(l_items_details.DW.toFixed(3)) !== parseFloat(l_items_details.OrgDW.toFixed(3)) || parseFloat(l_items_details.DH.toFixed(3)) !== parseFloat(l_items_details.OrgDH.toFixed(3)) || parseFloat(l_items_details.DD.toFixed(3)) !== parseFloat(l_items_details.OrgDD.toFixed(3))) {
                item_width = l_items_details.OrgDW;
                item_height = l_items_details.OrgDH;
                item_depth = l_items_details.OrgDD;
            } else {
                item_width = l_items_details.DW;
                item_height = l_items_details.DH;
                item_depth = l_items_details.DD;
            }
        }

        var cap_merch = l_items_details.CapMerch == "" ? "0" : l_items_details.CapMerch;
        var cap_orientation = l_items_details.CapOrientaion == "" ? "4" : l_items_details.CapOrientaion;
        var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(l_items_details.Orientation, item_width, item_height, item_depth);
        var real_depth = item_depth * l_items_details.BaseD;

        if (cap_merch == "0") {
            if (parseFloat(l_items_details.UW.toFixed(3)) !== parseFloat(l_items_details.OrgUW.toFixed(3)) || parseFloat(l_items_details.UH.toFixed(3)) !== parseFloat(l_items_details.OrgUH.toFixed(3)) || parseFloat(l_items_details.UD.toFixed(3)) !== parseFloat(l_items_details.OrgUD.toFixed(3))) {
                cap_width = l_items_details.OrgUW;
                cap_height = l_items_details.OrgUH;
                cap_depth = l_items_details.OrgUD;
            } else {
                cap_width = l_items_details.UW;
                cap_height = l_items_details.UH;
                cap_depth = l_items_details.UD;
            }
        } else if (cap_merch == "2") {
            if (parseFloat(l_items_details.CW.toFixed(3)) !== parseFloat(l_items_details.OrgCW.toFixed(3)) || parseFloat(l_items_details.CH.toFixed(3)) !== parseFloat(l_items_details.OrgCH.toFixed(3)) || parseFloat(l_items_details.CD.toFixed(3)) !== parseFloat(l_items_details.OrgCD.toFixed(3))) {
                cap_width = l_items_details.OrgCW;
                cap_height = l_items_details.OrgCH;
                cap_depth = l_items_details.OrgCD;
            } else {
                cap_width = l_items_details.CW;
                cap_height = l_items_details.CH;
                cap_depth = l_items_details.CD;
            }
        } else if (cap_merch == "1") {
            if (parseFloat(l_items_details.TW.toFixed(3)) !== parseFloat(l_items_details.OrgTW.toFixed(3)) || parseFloat(l_items_details.TH.toFixed(3)) !== parseFloat(l_items_details.OrgTH.toFixed(3)) || parseFloat(l_items_details.TD.toFixed(3)) !== parseFloat(l_items_details.OrgTD.toFixed(3))) {
                cap_width = l_items_details.OrgTW;
                cap_height = l_items_details.OrgTH;
                cap_depth = l_items_details.OrgTD;
            } else {
                cap_width = l_items_details.TW;
                cap_height = l_items_details.TH;
                cap_depth = l_items_details.TD;
            }
        } else if (cap_merch == "3") {
            if (parseFloat(l_items_details.DW.toFixed(3)) !== parseFloat(l_items_details.OrgDW.toFixed(3)) || parseFloat(l_items_details.DH.toFixed(3)) !== parseFloat(l_items_details.OrgDH.toFixed(3)) || parseFloat(l_items_details.DD.toFixed(3)) !== parseFloat(l_items_details.OrgDD.toFixed(3))) {
                cap_width = l_items_details.OrgDW;
                cap_height = l_items_details.OrgDH;
                cap_depth = l_items_details.OrgDD;
            } else {
                cap_width = l_items_details.DW;
                cap_height = l_items_details.DH;
                cap_depth = l_items_details.DD;
            }
        }

        var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);
        var capdepth = Math.trunc(real_depth / cDepth);

        if (parseInt($v("P442_CAP_DEPT")) > capdepth) {
            alert(get_message("POGCR_CAP_DEPTH_VAL"));
            resolve("N");
        } else {
            resolve("Y");
        }
    });
}

//ASA-1410
function checkValueConsistency(pArray, pKey, pValue) {
    if (pArray.length === 0) return false;
    var itemArray = pArray.filter(pArray => pArray.Object == 'ITEM')
    var firstValue = nvl(itemArray[0].ItemObj[0][pKey]);
    firstValue = isNaN(firstValue) ? firstValue.toUpperCase() : firstValue;
    for (item of itemArray) {
        var itemValue = nvl(item.ItemObj[0][pKey]);
        itemValue = isNaN(itemValue) ? itemValue.toUpperCase() : itemValue;
        if (!(firstValue == itemValue && ((itemValue == pValue && nvl(pValue) !== 0) || nvl(pValue) == 0))) {
            return false;
        }
    }
    return true;
}

//ASA-1410
function setIconForInconsistentTag(pArray, p_json_tag, p_page_item, p_null_value = "") {
    if (!checkValueConsistency(pArray, p_json_tag)) {
        $('#' + p_page_item + '_CONTAINER').addClass('apex-item-wrapper--has-icon');
        $('#' + p_page_item).addClass('apex-item-has-icon');
        $('#' + p_page_item).after('<span class="apex-item-icon fa fa-exclamation-triangle-o" aria-hidden="true"></span>');
        $s(p_page_item, p_null_value);
    } else {
        var itemArray = pArray.filter(pArray => pArray.Object == 'ITEM')
        var firstValue = itemArray[0].ItemObj[0][p_json_tag];
        //ASA-1762
        if(p_page_item == "P442_ITEM_ORIENTATION"){
            firstValue = String(firstValue);
        }
        $s(p_page_item, firstValue);
    }
}