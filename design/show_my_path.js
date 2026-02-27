var g_enableItemLocHighlight = $v('P176_ENBL_ITEM_LOC_HIGH');
var g_whereIsItItem;

function selectCard(cardId) {
    var selectedCardArr = [];
    if ($v('P176_HIDDEN_ITEM') != '') {
        selectedCardArr = $v('P176_HIDDEN_ITEM').split(',');
    }
    var selectedCardList;
    $('#item-detail-card-region [data-id=' + cardId + ']').toggleClass('is-selected');
    var idx = selectedCardArr.indexOf(cardId.toString());
    if (idx == -1) {
        selectedCardArr.push(cardId);
    } else {
        selectedCardArr.splice(idx, 1);
    }
    for (const ele of selectedCardArr) {
        if (typeof selectedCardList == 'undefined') {
            selectedCardList = ele;
        } else {
            selectedCardList = selectedCardList + ',' + ele;
        }
    }
    $s('P176_HIDDEN_ITEM', selectedCardList);
}

function get_floorplan_url(p_ItemCode) {
    try {
        console.log(p_ItemCode);
        apex.server.process(
            "GET_FLOORPLAN_URL", {
            x01: p_ItemCode
        }, {
            dataType: "text",
            success: function (pData) {
                var return_data = $.trim(pData).split(",");
                if (return_data[0] == "ERROR") {
                    raise_error(pData);
                } else {
                    console.log(pData);
                    console.log(pData);
                    apex.navigation.redirect(pData);
                }
            },
            loadingIndicatorPosition: "page",
        });
    } catch (err) {
        error_handling(err);
    }
}

async function set_navigation(pMode) {
    if (pMode == 'P') {
        var retval = await navigate_button_action($v("P176_VDATE"), $v("P176_POG_DEFAULT_COLOR"), $v("P176_MODULE_DEFAULT_COLOR"), $v("P176_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P176_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P176_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P176_BASKET_WALL_THICK")), parseFloat($v("P176_CHEST_WALL_THICK")), $v("P176_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P176_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P176_POGCR_TEXT_DEFAULT_SIZE")), $v("P176_POG_TEXTBOX_DEFAULT_COLOR"), $v("P176_SHELF_DEFAULT_COLOR"), '#ffffff', 'N', '', 'N', $v("P176_ITEM_DFT_COLOR"), $v("P176_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P176_MERCH_STYLE"), $v("P176_POGCR_LOAD_IMG_FROM"), $v("P176_BU_ID"), $v("P176_POGCR_ITEM_NUM_LBL_COLOR"), $v("P176_POGCR_DISPLAY_ITEM_INFO"), $v("P176_POGCR_ITEM_NUM_LABEL_POS"), $v("P176_NOTCH_HEAD"), $v('P176_POGCR_DFT_ITEM_DESC'), $v('P176_POGCR_DFLT_LIVE_IMAGES'), $v('P176_POGCR_DFT_NOTCH_LABEL'), $v('P176_POGCR_DFT_FIXEL_LABEL'), $v('P176_POGCR_SHOW_DFLT_ITEM_LOC'), 'N', $v('P176_POGCR_STORE_ASSIST_STATUS_LIST'), '#object_info', '.numbertext', $v('P176_HIDDEN_ITEM'), $v('P176_POGCR_DFT_BASKET_FILL'), $v('P176_POGCR_DFT_BASKET_SPREAD'), $v('P176_POGCR_IMG_MAX_WIDTH'), $v('P176_POGCR_IMG_MAX_HEIGHT'), $v('P176_IMAGE_COMPRESS_RATIO'), parseInt($v('P176_POGINDEX')), 'P', $v('P176_POGCR_AUTO_CORRECT_POG'), $v('P176_POG_WIT_STATUS_BAR_FONTSIZE'), $v('P176_CUSTOM_POG_CODE_STATUS_BAR_WIT'));
        if (retval == 'SUCCESS') {
            $s('P176_POGINDEX', parseInt($v('P176_POGINDEX')) - 1);
        }

    } else {
        var retval = await navigate_button_action($v("P176_VDATE"), $v("P176_POG_DEFAULT_COLOR"), $v("P176_MODULE_DEFAULT_COLOR"), $v("P176_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P176_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P176_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P176_BASKET_WALL_THICK")), parseFloat($v("P176_CHEST_WALL_THICK")), $v("P176_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P176_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P176_POGCR_TEXT_DEFAULT_SIZE")), $v("P176_POG_TEXTBOX_DEFAULT_COLOR"), $v("P176_SHELF_DEFAULT_COLOR"), '#ffffff', 'N', '', 'N', $v("P176_ITEM_DFT_COLOR"), $v("P176_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P176_MERCH_STYLE"), $v("P176_POGCR_LOAD_IMG_FROM"), $v("P176_BU_ID"), $v("P176_POGCR_ITEM_NUM_LBL_COLOR"), $v("P176_POGCR_DISPLAY_ITEM_INFO"), $v("P176_POGCR_ITEM_NUM_LABEL_POS"), $v("P176_NOTCH_HEAD"), $v('P176_POGCR_DFT_ITEM_DESC'), $v('P176_POGCR_DFLT_LIVE_IMAGES'), $v('P176_POGCR_DFT_NOTCH_LABEL'), $v('P176_POGCR_DFT_FIXEL_LABEL'), $v('P176_POGCR_SHOW_DFLT_ITEM_LOC'), 'N', $v('P176_POGCR_STORE_ASSIST_STATUS_LIST'), '#object_info', '.numbertext', $v('P176_HIDDEN_ITEM'), $v('P176_POGCR_DFT_BASKET_FILL'), $v('P176_POGCR_DFT_BASKET_SPREAD'), $v('P176_POGCR_IMG_MAX_WIDTH'), $v('P176_POGCR_IMG_MAX_HEIGHT'), $v('P176_IMAGE_COMPRESS_RATIO'), parseInt($v('P176_POGINDEX')), 'N', $v('P176_POGCR_AUTO_CORRECT_POG'), $v('P176_POG_WIT_STATUS_BAR_FONTSIZE'), $v('P176_CUSTOM_POG_CODE_STATUS_BAR_WIT'));
        if (retval == 'SUCCESS') {
            $s('P176_POGINDEX', parseInt($v('P176_POGINDEX')) + 1);
        }
    }
}

async function get_pog_search(p_pog_code, p_ItemCode, p_scanningInd, p_ItemtoSet, p_defaultDays, p_pogTypeSeq, p_prevBtn, p_nextBtn, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_showTextbox, p_showImgBtnID, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode, p_pog_index) {
    try {
        logDebug("function : get_pog_search ", "S");
        g_auto_x_space = parseFloat($v("P176_POGCR_CHEST_ITEM_H_SPC")) / 100;
        g_auto_y_space = parseFloat($v("P176_POGCR_CHEST_ITEM_V_SPC")) / 100;

        g_ItemImages = [];
        g_pog_json = [];

        $s(p_ItemtoSet, p_ItemCode);

        apex.server.process(
            "GET_POG_LIST", {
            x01: p_ItemCode,
            x02: 'N',
            x03: p_defaultDays,
            x04: p_pogTypeSeq,
            x05: p_pog_code,
            pageItems: p_ItemtoSet
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    var details = ($.trim(pData)).split(',');
                    if (details[0] == 'ERROR') {
                        g_itemChanged = 'N';
                        removeLoadingIndicator(regionloadWait);
                        raise_error(details[1]);
                    } else {
                        $('#prev_btn').css('display', 'none');
                        $('#next_btn').css('display', 'none');
                        g_pog_list = JSON.parse($.trim(pData));
                        g_pog_json = [];
                        var returnVal = create_pog_first($.trim(pData), p_prevBtn, p_nextBtn, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_showTextbox, p_ItemCode, p_showImgBtnID, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode, p_pog_index); //ASA-1303
                        g_itemChanged = 'N'
                        logDebug("function : get_pog_search ", "E");
                    }
                } else {
                    g_itemChanged = 'N';
                    removeLoadingIndicator(regionloadWait);
                }
            },
        });

    } catch (err) {
        g_itemChanged = 'N';
        error_handling(err);
    }
}

async function create_pog_first(p_pog_list, p_prevBtn, p_nextBtn, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_showTextbox, p_selectedItem, p_showImgBtnID, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode, p_pog_index) {
    try {
        logDebug("function : create_pog_first ", "S");
        addLoadingIndicator();
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
            for (const pogs of g_pog_list) {
                await get_json_data_json(pogs.PogCode, pogs.PogVersion, "N", "");
                temp_pog.push(JSON.parse(JSON.stringify(g_pog_json_data[0])));
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
                    await create_module_from_json(temp_pog, new_pog_ind, "F", "N", "E", "Y", "N", "Y", "Y", "Y", org_mod_index, g_show_live_image, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index); //ASA-1491 Issue 3
                    render();
                    g_pog_index = lpogCnt;
                    g_pog_json[0].org_mod_index = org_mod_index;
                    if (p_autoCorrectInd == 'Y') {
                        await auto_align_peg_items(p_pog_index, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor);
                        await auto_position_all(g_camera, p_pog_index, p_pog_index);
                    }
                    await add_status_bar(p_statusLblList, p_objInfoRegionID, $v('P176_HIDDEN_ITEM'), 'N', p_pog_index, p_CusPogCode, p_statusbarFontSize); //p_selectedItem
                    render_blink_effect();
                    $(p_showImgBtnID).addClass('apex_disabled');
                    $(p_showImgBtnID).removeClass('apex_disabled');
                } else {
                    if (g_scene_objects.length > 0) {
                        await create_module_from_json(temp_pog, new_pog_ind, "F", "N", "E", "N", "N", "N", "Y", "Y", org_mod_index, g_show_live_image, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index);
                    }
                }
                lpogCnt++;
            }
            g_pog_json = g_multi_pog_json;

        }
        $('#prev_btn').css('display', 'block');
        $('#next_btn').css('display', 'block');
        logDebug("function : create_pog_first ", "E");
        return p_pog_index;
    } catch (err) {
        error_handling(err);
    }
}

async function onWindowResize_lib(event) {
    try {
        windowWidth = window.innerWidth;
        g_windowHeight = window.innerHeight;
        g_camera.aspect = windowWidth / g_windowHeight;
        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (g_windowHeight / g_initial_windowHeight));
        var devicePixelRatio = window.devicePixelRatio;

        g_renderer.setSize(windowWidth, g_windowHeight);
        g_camera.updateProjectionMatrix();
        if (g_start_pixel_ratio !== devicePixelRatio) {
            g_pog_index = 0;
            var new_pog_ind = g_pog_json[g_pog_index].DesignType == "D" ? "Y" : "N";
            var new_pog_ind = g_pog_json[g_pog_index].DesignType == "D" ? "Y" : "N";
            g_scene_objects = [];
            init_lib("Y", "N", "Y", g_pog_index);
            objects = {};
            objects["scene"] = g_scene;
            objects["renderer"] = g_renderer;
            g_scene_objects.push(objects);
            var TEMP_POG = [];
            TEMP_POG[0] = JSON.parse(JSON.stringify(g_pog_json[0]));
            g_pog_json = [];
            module_obj_array = [];
            addLoadingIndicator();
            var return_val = await create_module_from_json(TEMP_POG, new_pog_ind, "N", "N", "E", "Y", "N", "Y", "Y", "Y", TEMP_POG[0].org_mod_index, 'N', $v("P27_VDATE"), $v("P27_POG_DEFAULT_COLOR"), $v("P27_MODULE_DEFAULT_COLOR"), $v("P27_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P27_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P27_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P27_BASKET_WALL_THICK")), parseFloat($v("P27_CHEST_WALL_THICK")), $v("P27_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P27_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P27_POGCR_TEXT_DEFAULT_SIZE")), $v("P27_POG_TEXTBOX_DEFAULT_COLOR"), $v("P27_SHELF_DEFAULT_COLOR"), '#ffffff', 'N', '', 'N', $v("P27_ITEM_DFT_COLOR"), $v("P27_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P27_MERCH_STYLE"), $v("P27_POGCR_LOAD_IMG_FROM"), $v("P27_BU_ID"), $v("P27_POGCR_ITEM_NUM_LBL_COLOR"), $v("P27_POGCR_DISPLAY_ITEM_INFO"), $v("P27_POGCR_ITEM_NUM_LABEL_POS"), $v("P27_NOTCH_HEAD"), $v('P27_POGCR_DFT_ITEM_DESC'), $v('P27_POGCR_DFLT_LIVE_IMAGES'), $v('P27_POGCR_DFT_NOTCH_LABEL'), $v('P27_POGCR_DFT_FIXEL_LABEL'), $v('P27_POGCR_SHOW_DFLT_ITEM_LOC'), $v('P27_POGCR_DFT_BASKET_FILL'), $v('P27_POGCR_DFT_BASKET_SPREAD'), $v('P27_POGCR_IMG_MAX_WIDTH'), $v('P27_POGCR_IMG_MAX_HEIGHT'), $v('P27_IMAGE_COMPRESS_RATIO'), g_pog_index);
        }
        render(g_pog_index);
    } catch (err) {
        error_handling(err);
    }
}

function searchProduct(pSearchType) {
    try {
        $s('P176_SEARCH_TYPE', pSearchType);
        var search_item;
        if (pSearchType == 'A') {
            if ($v('P176_PRODUCT_DESC') == '') {
                raise_error('ERROR,' + get_message('NULL_ITEM'));
            } else {
                search_item = $v('P176_PRODUCT_DESC');
            }

        } else {
            search_item = $v('P176_HIDDEN_ITEM');
        }

        apex.server.process(
            "SEARCH_ITEMS", {
            x01: search_item,
            x02: pSearchType
        }, {
            dataType: "text",
            success: function (pData) {
                var return_data = $.trim(pData).split(",");
                if (return_data[0] == "ERROR") {
                    raise_error(pData);
                } else {
                    $('#rg_item_detail').show();
                    if (pSearchType == 'A') {
                        $('#rg_svg').hide();

                        $('#item-detail-card-region').show();
                        apex.jQuery('#rg_item_detail_heading').text(get_message('ITEM_DETAIL'));
                        $('#rg_buttons_cntr').show();
                        $('#id_previous_location').hide();
                        $('#id_next_location').hide();
                        $('#id_rotate').hide();
                        $('#id_set_location').hide();
                        apex.region('item-detail-card-region').refresh();
                    }
                }
            },
            loadingIndicatorPosition: "page",
        });
    } catch (err) {
        error_handling(err);
    }
}

async function add_status_bar(p_statusLblList, p_objInfoRegionID, p_hightlightProduct, p_showSOH, p_pog_index, p_CusPogCode, p_statusbarFontSize) {
    try {
        logDebug("function : add_status_bar; ", "S");
        var desc_list_arr = p_statusLblList.split(",");
        var append_detail = '';
        if (g_pog_json.length > 0) {

            var [item_exists = [], module = [], shelf = [], desc = [], item_info = [], horiz_facing = [], loc_id = []] = get_pog_info(p_pog_index, p_hightlightProduct, 'Y'); //ASA-1303

            if (p_objInfoRegionID !== '') {
                $(p_objInfoRegionID)
                    .contents()
                    .filter(function () {
                        return this.nodeType == 3;
                    })
                    .remove();
                // var $doc = $(document),
                //     $win = $(window),
                //     $this = $(p_objInfoRegionID);
                var valid_width = 0;
                var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //ASA-1254
                // for (i = 0; i < desc_list_arr.length; i++) {



                var line_width = 0;
                var divider = i > 0 ? " | " : "";
                if (item_info.length > 0) {
                    for (iItem = 0; iItem < item_info.length; iItem++) {
                        for (i = 0; i < desc_list_arr.length; i++) {
                            if (iItem == 0) {
                                if (desc_list_arr[i] == "POG_CODE") {
                                    if (p_CusPogCode == 'Y') {
                                        var cus_loc_id = (loc_id[iItem] < 10 ? '00' : loc_id[iItem] < 100 ? '0' : '') + loc_id[iItem];
                                        var cus_horiz_facing = (horiz_facing[iItem] < 10 ? '0' : '') + horiz_facing[iItem];
                                        var cus_shelf = (shelf.length < 2 ? '0' : '') + shelf[iItem];
                                        append_detail = append_detail + '<span style="color:#001fff">' + get_message('TEMP_HEAD_POG_CODE') + ': </span>' + g_pog_json[p_pog_index].POGCode + module[iItem] + cus_shelf + cus_loc_id + cus_horiz_facing; //asa-1303
                                        line_width = (get_message('TEMP_HEAD_POG_CODE') + ': ' + g_pog_json[p_pog_index].POGCode + module[iItem] + cus_shelf + cus_loc_id + cus_horiz_facing).visualLength("ruler");

                                        append_detail = append_detail + ' | ' + '<span style="color:#001fff">' + get_message('TEMP_HEAD_VERSION') + ': </span>' + g_pog_json[p_pog_index].Version;
                                        line_width = (get_message('TEMP_HEAD_VERSION') + ': ' + g_pog_json[p_pog_index].Version).visualLength("ruler");
                                    } else {
                                        append_detail = append_detail + '<span style="color:#001fff">' + get_message('TEMP_HEAD_POG_CODE') + ': </span>' + g_pog_json[p_pog_index].POGCode + '-' + g_pog_json[p_pog_index].Version;
                                        line_width = (get_message('TEMP_HEAD_POG_CODE') + ': ' + g_pog_json[p_pog_index].POGCode + '-' + g_pog_json[p_pog_index].Version).visualLength("ruler");
                                    }
                                }
                                if (desc_list_arr[i] == "MODULE") {
                                    append_detail = append_detail + '(' + module[iItem] + ')';
                                    line_width = ('(' + module[iItem] + ')').visualLength("ruler");
                                }
                            }

                            if (desc_list_arr[i] == "ITEM") {
                                append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('ITEM') + ': </span>' + item_info[iItem].Item;
                                line_width = (" | " + get_message('ITEM') + ': ' + item_info[iItem].Item).visualLength("ruler");
                            }
                            if (desc_list_arr[i] == "LOCID") {
                                append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('LOCATION_ID') + ': </span>' + item_info[iItem].LocID;
                                line_width = ('-' + loc_id).visualLength("ruler");
                            }
                            if (desc_list_arr[i] == "DESC") {
                                append_detail = append_detail + '-' + item_info[iItem].Desc;
                                line_width = ('-' + desc).visualLength("ruler");
                            }
                            if (desc_list_arr[i] == "SHELF") {
                                append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_ITEM_SHELF') + ': </span>' + shelf[iItem];
                                line_width = (" | " + shelf[iItem]).visualLength("ruler");
                            }
                            if (desc_list_arr[i] == "VERT_FACING") {
                                append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_VERT_FACING') + ': </span>' + item_info[iItem].BVert;
                                line_width = (" | " + shelf).visualLength("ruler");
                            }
                            if (desc_list_arr[i] == "HORIZ_FACING") {
                                append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_HORIZ_FACING') + ': </span>' + item_info[iItem].BHoriz;
                                line_width = (" | " + shelf).visualLength("ruler");
                            }
                            if (desc_list_arr[i] == "DEPTH_FACING") {
                                append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_DEPTH_FACING') + ': </span>' + item_info[iItem].BaseD;
                                line_width = (" | " + shelf).visualLength("ruler");
                            }
                        }
                        append_detail = append_detail + '<br>';
                    }

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
                contextElement.style.width = 100 + "vw";
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

function get_pog_info(p_pog_index, p_hightlightProduct, p_hightlightItem) {
    var k = 0;
    var item_exists = [];
    var module = [],
        shelf = [],
        desc = [],
        item_info = [],
        horiz_facing = [],
        loc_id = [];

    // Split p_hightlightProduct into an array of values
    const highlightProducts = p_hightlightProduct.split(',').map(item => item.trim());

    for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
        var i = 0;
        for (const shelfs of modules.ShelfInfo) {
            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                if (nvl(shelfs.ItemInfo) !== 0) {
                    var j = 0;
                    for (const items of shelfs.ItemInfo) {
                        // Check if the current item's Item exists in highlightProducts
                        if (highlightProducts.includes(items.Item)) {
                            if (p_hightlightItem == 'Y') {
                                selectedObj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                var highlightItem = highlightProduct(selectedObj, 4, items.W, items.H, items.D, items.Z);
                                g_intersected.push(selectedObj);
                            }

                            module.push(modules.Module);
                            shelf.push(shelfs.Shelf);
                            item_info.push(items);
                            desc.push(items.Desc);
                            horiz_facing.push(items.BHoriz);
                            loc_id.push(items.LocID);
                            item_exists.push('Y');
                            // module = modules.Module;
                            // shelf = shelfs.Shelf;
                            // item_info = items;
                            // desc = items.Desc;
                            // horiz_facing = items.BHoriz;
                            // loc_id = items.LocID;

                            // item_exists = 'Y';
                        }
                        j++;
                    }
                }
            }
            i++;
        }
        k++;
    }
    return [item_exists, module, shelf, desc, item_info, horiz_facing, loc_id];
}
function getImageClob(p_objInfoRegionID, p_floorPlanRegioinID, p_openFloorRegionID, p_store, p_pog_index, p_hightlightProduct, p_CusPogCode, p_statusbarFontSize, p_temp_pog) {
    try {
        logDebug("function : getImageClob ", "S");
        apex.server.process(
            "GET_SVG_CLOB", {
            x01: p_store,
            x02: g_pog_list[0].FPVersion
        }, {
            dataType: "json",
            success: function (data) {
                if (data.result == "success") {
                    openInlineDialog(p_openFloorRegionID, 150, 150);
                    var xmlDoc = $.parseXML(data.response),
                        $xml = $(xmlDoc),
                        $svg = $xml.find("svg");
                    $(p_floorPlanRegioinID + " svg").remove();
                    $(p_floorPlanRegioinID)
                        .append($svg)
                        .ready(function () {
                            activateZoomInOut(p_floorPlanRegioinID);
                            $('svg title').text('');
                            Hide_paths()
                            var lpogCnt = 0;
                            for (const pogs of g_pog_json) {
                                var location_list = g_pog_list
                                    .map(function (item) {
                                        return item.LocationID.split(",");
                                    })
                                    .flat();
                                /* ASA-1516 #15 End */

                                var [item_exists, module, shelf, desc, item_info, horiz_facing, loc_id] = get_pog_info(lpogCnt, p_hightlightProduct, 'N'); //ASA-1303
                                set_store_info(p_objInfoRegionID, p_store, location_list, g_pog_json[lpogCnt].POGCode, shelf, module, g_pog_json[lpogCnt].Version, horiz_facing, p_CusPogCode, p_hightlightProduct, desc, p_statusbarFontSize, loc_id);
                                document.querySelectorAll('path').forEach(path => {

                                    if (path.getAttribute('Location_ID') !== null) {

                                        h = 0;
                                        for (const obj of location_list) {
                                            if ((path.getAttribute('Location_ID')).toUpperCase() == location_list[h]) {
                                                add_highlight(path.getAttribute('Location_ID'), g_pog_json[lpogCnt].POGCode, module, p_CusPogCode); //ASA-1303
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
                                            add_highlight(path.getAttribute('Location_ID'), g_pog_json[lpogCnt].POGCode, module, p_CusPogCode); //ASA-1303
                                        }
                                        h++;
                                    }
                                })

                                lpogCnt++;
                            }

                            if (g_enableItemLocHighlight == "Y") {
                                markItemLocation();
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

async function get_pog(p_ItemCode, p_ItemtoSet, p_defaultDays, p_pogTypeSeq, p_prevBtn, p_nextBtn) {
    try {
        logDebug("function : get_pog ", "S");
        g_pog_json = [];
        var temp_pog = [];
        apex.server.process(
            "GET_POG_LIST", {
            x01: p_ItemCode,
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
                        g_itemChanged = 'N';
                        removeLoadingIndicator(regionloadWait);
                        raise_error(details[1]);
                    } else {
                        $(p_prevBtn).css('display', 'none');
                        $(p_nextBtn).css('display', 'none');
                        g_pog_list = JSON.parse($.trim(pData));

                        for (const pogs of g_pog_list) {
                            await get_json_data_json(pogs.PogCode, pogs.PogVersion, "N", "");
                            temp_pog.push(JSON.parse(JSON.stringify(g_pog_json_data[0])));
                            g_pog_json.push(JSON.parse(JSON.stringify(g_pog_json_data[0])));
                        }
                        getImageClob('#object_info', '#rg_floorplan_info', 'rg_open_floor_plan',
                            $v('P176_STORE'), 0, $v('P176_HIDDEN_ITEM'), $v('P176_CUSTOM_POG_CODE_STATUS_BAR_WIT'),
                            $v('P176_POG_WIT_STATUS_BAR_FONTSIZE'), temp_pog);
                        $('#rg_open_floor_plan.ui-dialog-content').dialog('option', 'width', $(window).width());
                        $('#rg_open_floor_plan.ui-dialog-content').dialog('option', 'height', $(window).height());

                        logDebug("function : get_pog ", "E");
                    }
                } else {
                    removeLoadingIndicator(regionloadWait);
                }
            },
        });

    } catch (err) {
        error_handling(err);
    }
}

async function itemValidate(p_ItemCode, p_search_type, p_ItemtoSet, p_skipConfirm, p_openPOG, p_openFloorPath, p_openFloorplanPath, p_pog_code) {
    logDebug("function : itemValidate ", "S");
    addLoadingIndicator(); // Add loading indicator at the start

    if (p_ItemCode == '') {
        $('#rg_item_detail').hide();
        removeLoadingIndicator(); // Remove loading indicator if no item code is provided
    } else {
        try {
            var p = apex.server.process(
                "ITEM_VALIDATE", {
                x01: p_ItemCode,
                x02: p_search_type,
                x03: p_skipConfirm,
                pageItems: p_ItemtoSet
            }, {
                dataType: "json"
            });

            p.done(async function (pData) {
                async function doSomething() {
                    if ($.trim(pData) != "" && p_skipConfirm != 'Y') {
                        $s('P176_HIDDEN_ITEM', pData.items);
                    }

                    if ($.trim(pData) != "" && pData.error_message != 'no_data_found') {
                        if (pData.confirm_ind == 'Y') {
                            confirm(
                                get_message(pData.error_message),
                                get_message("SHCT_YES"),
                                get_message("SHCT_NO"),
                                function () {
                                    if (nvl(pData.items) != 0 && p_ItemCode.includes(",")) {
                                        g_whereIsItItem = pData.items;
                                        itemValidate($v('P176_HIDDEN_ITEM'), p_search_type, 'P176_STORE', 'Y', p_openPOG, p_openFloorPath, p_openFloorplanPath, p_pog_code);
                                    } else {
                                        if (nvl(g_whereIsItItem) == 0) {
                                            apex.navigation.redirect("f?p=" + $v("pFlowId") + ":27:" + $v("pInstance") + "::::AI_DYHT_ITEM:" + $v("P176_HIDDEN_ITEM"));
                                        } else {
                                            apex.navigation.redirect("f?p=" + $v("pFlowId") + ":27:" + $v("pInstance") + "::::AI_DYHT_ITEM:" + g_whereIsItItem);
                                        }
                                    }
                                }
                            );
                        } else {
                            removeLoadingIndicator(); // Remove loading indicator before raising error
                            raise_error(pData.error_message);
                        }
                    } else {
                        if (p_openPOG == 'Y') {
                            get_pog_search(p_pog_code, $v('P176_HIDDEN_ITEM'), 'N', 'P176_HIDDEN_ITEM', $v('P176_DEFAULT_DAYS'), $v('P176_POG_TYPE_SEQ'), '#prev_btn', '#next_btn', $v("P176_VDATE"), $v("P176_POG_DEFAULT_COLOR"), $v("P176_MODULE_DEFAULT_COLOR"), $v("P176_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P176_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P176_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P176_BASKET_WALL_THICK")), parseFloat($v("P176_CHEST_WALL_THICK")), $v("P176_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P176_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P176_POGCR_TEXT_DEFAULT_SIZE")), $v("P176_POG_TEXTBOX_DEFAULT_COLOR"), $v("P176_SHELF_DEFAULT_COLOR"), '#ffffff', 'N', '', 'N', $v("P176_ITEM_DFT_COLOR"), $v("P176_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P176_MERCH_STYLE"), $v("P176_POGCR_LOAD_IMG_FROM"), $v("P176_BU_ID"), $v("P176_POGCR_ITEM_NUM_LBL_COLOR"), $v("P176_POGCR_DISPLAY_ITEM_INFO"), $v("P176_POGCR_ITEM_NUM_LABEL_POS"), $v("P176_NOTCH_HEAD"), $v('P176_POGCR_DFT_ITEM_DESC'), $v('P176_POGCR_DFLT_LIVE_IMAGES'), $v('P176_POGCR_DFT_NOTCH_LABEL'), $v('P176_POGCR_DFT_FIXEL_LABEL'), $v('P176_POGCR_SHOW_DFLT_ITEM_LOC'), 'N', $v('P176_POGCR_STORE_ASSIST_STATUS_LIST'), '#object_info', '.numbertext', $v('P176_POGCR_SHOW_TEXT_BOX'), '#LIVE_IMAGE', $v('P176_POGCR_DFT_BASKET_FILL'), $v('P176_POGCR_DFT_BASKET_SPREAD'), $v('P176_POGCR_IMG_MAX_WIDTH'), $v('P176_POGCR_IMG_MAX_HEIGHT'), $v('P176_IMAGE_COMPRESS_RATIO'), $v('P176_POGCR_AUTO_CORRECT_POG'), $v('P176_POG_WIT_STATUS_BAR_FONTSIZE'), $v('P176_CUSTOM_POG_CODE_STATUS_BAR_WIT'), 0);
                            openInlineDialog('rg_planograms', 150, 150);
                        } else if (p_openFloorPath == 'Y') {
                            get_pog($v('P176_HIDDEN_ITEM'), 'P176_STORE', $v('P176_DEFAULT_DAYS'), $v('P176_POG_TYPE_SEQ'), '#prev_btn', '#next_btn');
                        } else if (p_openFloorplanPath == 'Y') {
                            if (p_search_type == 'A') {
                                $('#rg_svg').hide();
                                $('#id_previous_location').hide();
                                $('#id_next_location').hide();
                                $('#id_rotate').hide();
                                $('#id_set_location').hide();
                                apex.jQuery('#rg_item_detail_heading').text(get_message('ITEM_DETAIL'));
                                $('#item-detail-card-region').show();
                                $('#rg_buttons_cntr').show();
                                apex.region('item-detail-card-region').refresh();
                                $('#rg_item_detail').show();
                            } else {
                                apex.jQuery('#rg_item_detail_heading').text(get_message('SHOW_MY_WAY'));
                                $('#item-detail-card-region').hide();
                                $('#rg_buttons_cntr').hide();
                                $('#id_previous_location').show();
                                $('#id_next_location').show();
                                $('#id_rotate').show();
                                $('#id_set_location').show();
                                $('#rg_svg').show();
                            }
                            get_item_location();
                        } else {
                            searchProduct(p_search_type);
                        }
                        removeLoadingIndicator(); // Remove loading indicator after process completion
                        logDebug("function : itemValidate", "E");
                    }
                }
                await doSomething();
            });

        } catch (err) {
            removeLoadingIndicator(); // Ensure loading indicator is removed on error
            error_handling(err);
        }
    }
}


//ASA-1654 To open POG after validation on page items.
function openPOGDialog(p_pog_code) {
    if ($v('P176_HIDDEN_ITEM') == '' && $v('P176_SEARCH_TYPE') == 'A') {
        alert(get_message('SELECT_ATLEAST_ONE_REC'));

    } else {
        if ($v('P176_SEARCH_TYPE') == 'A') {
            itemValidate($v('P176_HIDDEN_ITEM'), 'S', 'P176_STORE', 'N', 'Y', 'N', 'N', p_pog_code);
        } else {
            get_pog_search(p_pog_code, $v('P176_HIDDEN_ITEM'), 'N', 'P176_HIDDEN_ITEM', $v('P176_DEFAULT_DAYS'), $v('P176_POG_TYPE_SEQ'), '#prev_btn', '#next_btn', $v("P176_VDATE"), $v("P176_POG_DEFAULT_COLOR"), $v("P176_MODULE_DEFAULT_COLOR"), $v("P176_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P176_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P176_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P176_BASKET_WALL_THICK")), parseFloat($v("P176_CHEST_WALL_THICK")), $v("P176_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P176_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P176_POGCR_TEXT_DEFAULT_SIZE")), $v("P176_POG_TEXTBOX_DEFAULT_COLOR"), $v("P176_SHELF_DEFAULT_COLOR"), '#ffffff', 'N', '', 'N', $v("P176_ITEM_DFT_COLOR"), $v("P176_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P176_MERCH_STYLE"), $v("P176_POGCR_LOAD_IMG_FROM"), $v("P176_BU_ID"), $v("P176_POGCR_ITEM_NUM_LBL_COLOR"), $v("P176_POGCR_DISPLAY_ITEM_INFO"), $v("P176_POGCR_ITEM_NUM_LABEL_POS"), $v("P176_NOTCH_HEAD"), $v('P176_POGCR_DFT_ITEM_DESC'), $v('P176_POGCR_DFLT_LIVE_IMAGES'), $v('P176_POGCR_DFT_NOTCH_LABEL'), $v('P176_POGCR_DFT_FIXEL_LABEL'), $v('P176_POGCR_SHOW_DFLT_ITEM_LOC'), 'N', $v('P176_POGCR_STORE_ASSIST_STATUS_LIST'), '#object_info', '.numbertext', $v('P176_POGCR_SHOW_TEXT_BOX'), '#LIVE_IMAGE', $v('P176_POGCR_DFT_BASKET_FILL'), $v('P176_POGCR_DFT_BASKET_SPREAD'), $v('P176_POGCR_IMG_MAX_WIDTH'), $v('P176_POGCR_IMG_MAX_HEIGHT'), $v('P176_IMAGE_COMPRESS_RATIO'), $v('P176_POGCR_AUTO_CORRECT_POG'), $v('P176_POG_WIT_STATUS_BAR_FONTSIZE'), $v('P176_CUSTOM_POG_CODE_STATUS_BAR_WIT'), 0);
            openInlineDialog('rg_planograms', 150, 150);
        }
    }
}

function get_item_location() {
    try {
        apex.server.process(
            //ASA-1654 Added x01,x02,x03 to send values when AJAX process starts.
            "SET_ITEM_LOCATION", {
            x01: $v('P176_HIDDEN_ITEM'),
            x02: $v('P176_FP_VERSION'),
            x03: $v('P176_FROM_LOCATION_ID')
        }, {
            dataType: "json",
            success: function (pData) {
                //ASA-1654 set the values returned by JSON.
                if ($.trim(pData.result) == 'fail') {
                    raise_error(pData.error);
                } else {
                    //ASA-1654 show alert if location = NL
                    if ($.trim(pData.alert_user) != "") {
                        alert(pData.alert_user);
                    }
                    $s('P176_FROM_LOCATION_ID', pData.from_location_id);
                    $s('P176_LOCATION_IDS', pData.location_ids);
                    $s('P176_POG_LOCATION_IDS', pData.pog_location_ids);
                    $s('P176_SMW_KIOSK_CNFG_YN', pData.smw_kiosk_cnfg_yn);
                    $s('P176_SMW_KIOSK_CNFG_LOC', pData.smw_kiosk_cnfg_loc);
                    $('#rg_item_detail').show();
                    if (pData.smw_kiosk_cnfg_yn == 'Y' || pData.smw_kiosk_cnfg_loc !== '') {
                        smw_kiosk_cnfg(pData.smw_kiosk_cnfg_loc, pData.location_ids, pData.pog_location_ids);
                    } else {
                        openInlineDialog('reg_set_location', 30, 30);
                    }

                }
            },
            loadingIndicatorPosition: "page",
        });
    } catch (err) {
        a
        error_handling(err);
    }
}


function get_svg_footer(p_location) {
    try {
        apex.server.process(
            "SET_SVG_FOOTER", {
            x01: $v('P176_HIDDEN_ITEM'),
            x02: $v('P176_FP_VERSION'),
            x03: p_location
        }, {
            dataType: "json",
            success: function (pData) {
                if ($.trim(pData.result) == 'fail') {
                    raise_error(pData.error);
                } else {
                    if ($.trim(pData.alert_user) != "") {
                        alert(pData.alert_user);
                    }
                    document.getElementById('rg_footer').innerHTML = pData.footer;
                }
            },
            loadingIndicatorPosition: "page",
        });
    } catch (err) {
        error_handling(err);
    }
}
