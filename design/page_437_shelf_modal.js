var l_shelf_details = []; //ASA-1471 issue 15



function hide_show_page_items(p_object_type) {
    try {
        $('#P437_TEXT_FONT_STYLE_CONTAINER, #P437_TEXT_FONT_SIZE_CONTAINER, #P437_TEXT_BOLD_CONTAINER').hide();   //ASA-1669
        if (p_object_type == 'SHELF') {
            $('#P437_HEIGHT_CONTAINER,#P437_LEFT_OVERHANG_CONTAINER,#P437_RIGHT_OVERHANG_CONTAINER,#P437_HORIZ_SPACING_CONTAINER,#P437_GRILL_HEIGHT_CONTAINER,#P437_SPACER_THICKNESS_CONTAINER,#P437_HORIZ_GAP_CONTAINER,#P437_SPREAD_PRODUCTS_CONTAINER,#P437_COMBINE_CONTAINER,#P437_ALLOW_AUTO_CRUSH_CONTAINER,#P437_MAX_MERCH_CONTAINER,#P437_SHELF_SLOPE_CONTAINER,#P437_ROTATION_CONTAINER').show();

            $('#P437_BASE_HEIGHT_CONTAINER,#P437_WALL_THICKNESS_CONTAINER,#P437_UPPER_OVERHANG_CONTAINER,#P437_WALL_HEIGHT_CONTAINER,#P437_SNAP_TO_SHELF_CONTAINER,#P437_BASKET_FILL_CONTAINER,#P437_SPREAD_PRODUCT_BASKET_CONTAINER,#P437_LOWER_OVERHANG_CONTAINER,#P437_HORIZ_START_CONTAINER,#P437_VERT_START_CONTAINER,#P437_VERT_SPACING_CONTAINER,#P437_DEPTH_SLOT_START_CONTAINER,#P437_DEPTH_SLOT_SPACING_CONTAINER,#P437_CHEST_HORZ_GAP_CONTAINER,#P437_DEPTH_GAP_CONTAINER,#P437_ROD_SPREAD_PRODUCTS_CONTAINER,#P437_FRONT_OVERHANG_CONTAINER,#P437_BACK_OVERHANG_CONTAINER,#P437_SHELF_OVERLAP_CONTAINER,#P437_AUTO_PLACING_CONTAINER,#P437_MANUAL_CRUSH_CONTAINER').hide();
            $('#divider').show();
            $('#shelf_image').show();
            $('#pegboard_image').hide();
            $('#basket_image').hide();
            $('#rod_image').hide();
            $('#hanging_bar_image').hide();
            $('#chest_image').hide();
            $('#pallet_image').hide();
            $('#shelf_divider').show(); //ASA-1265
            $('#P437_AUTO_FILL_PEG_CONTAINER').hide(); //ASA-1109
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('SHELF_LABEL'));
        } else if (p_object_type == 'PEGBOARD') {
            $('#P437_HEIGHT_CONTAINER').show();
            $('#P437_SNAP_TO_SHELF_CONTAINER').hide();
            $('#P437_BASKET_FILL_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCT_BASKET_CONTAINER').hide();
            $('#P437_GRILL_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_HEIGHT_CONTAINER').hide();
            $('#P437_BASE_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_THICKNESS_CONTAINER').hide();
            $('#P437_SPACER_THICKNESS_CONTAINER').hide();
            $('#P437_HORIZ_GAP_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_COMBINE_CONTAINER').hide();
            $('#P437_UPPER_OVERHANG_CONTAINER').show();
            $('#P437_LOWER_OVERHANG_CONTAINER').show();
            $('#P437_HORIZ_START_CONTAINER').show();
            $('#P437_VERT_START_CONTAINER').show();
            $('#P437_VERT_SPACING_CONTAINER').show();
            $('#P437_HORIZ_SPACING_CONTAINER').show();
            $('#P437_LEFT_OVERHANG_CONTAINER').show();
            $('#P437_RIGHT_OVERHANG_CONTAINER').show();
            $('#P437_ALLOW_AUTO_CRUSH_CONTAINER').hide();
            $('#P437_CHEST_HORZ_GAP_CONTAINER').hide();
            $('P437_MANUAL_CRUSH_CONTAINER').hide(); //ASA-1300
            $('#P437_DEPTH_GAP_CONTAINER').hide();
            $('#P437_ROD_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_MAX_MERCH_CONTAINER').show();
            $('#P437_FRONT_OVERHANG_CONTAINER').hide();
            $('#P437_BACK_OVERHANG_CONTAINER').hide();
            $('#P437_SHELF_OVERLAP_CONTAINER').show();
            $('#P437_SHELF_SLOPE_CONTAINER').show();
            $('#P437_ROTATION_CONTAINER').show();
            $('#P437_AUTO_PLACING_CONTAINER').show();
            $('#divider').hide();
            $('#shelf_image').hide();
            $('#basket_image').hide();
            $('#pegboard_image').show();
            $('#hanging_bar_image').hide();
            $('#chest_image').hide();
            $('#rod_image').hide();
            $('#pallet_image').hide();
            $('#shelf_divider').hide(); //ASA-1265
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('PEGBOARD_LABEL'));
            $('#P437_AUTO_FILL_PEG_CONTAINER').show(); //ASA-1109
        } else if (p_object_type == 'HANGINGBAR') {
            $('P437_MANUAL_CRUSH_CONTAINER').hide(); //ASA-1300
            $('#P437_HEIGHT_CONTAINER').show();
            $('#P437_SNAP_TO_SHELF_CONTAINER').hide();
            $('#P437_BASKET_FILL_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCT_BASKET_CONTAINER').hide();
            $('#P437_GRILL_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_HEIGHT_CONTAINER').hide();
            $('#P437_BASE_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_THICKNESS_CONTAINER').hide();
            $('#P437_SPACER_THICKNESS_CONTAINER').hide();
            $('#P437_HORIZ_GAP_CONTAINER').show();
            $('#P437_SPREAD_PRODUCTS_CONTAINER').show();
            $('#P437_COMBINE_CONTAINER').show();
            $('#P437_UPPER_OVERHANG_CONTAINER').hide();
            $('#P437_LOWER_OVERHANG_CONTAINER').hide();
            $('#P437_LEFT_OVERHANG_CONTAINER').show();
            $('#P437_RIGHT_OVERHANG_CONTAINER').show();
            $('#P437_ALLOW_AUTO_CRUSH_CONTAINER').show(); //ASA-1079
            $('#P437_HORIZ_START_CONTAINER').hide();
            $('#P437_HORIZ_SPACING_CONTAINER').hide();
            $('#P437_VERT_START_CONTAINER').hide();
            $('#P437_VERT_SPACING_CONTAINER').hide();
            $('#P437_CHEST_HORZ_GAP_CONTAINER').hide();
            $('#P437_DEPTH_GAP_CONTAINER').hide();
            $('#P437_ROD_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_MAX_MERCH_CONTAINER').show();
            $('#P437_FRONT_OVERHANG_CONTAINER').hide();
            $('#P437_BACK_OVERHANG_CONTAINER').hide();
            $('#P437_SHELF_OVERLAP_CONTAINER').hide();
            $('#P437_SHELF_SLOPE_CONTAINER').hide();
            $('#P437_ROTATION_CONTAINER').hide();
            $('#P437_AUTO_PLACING_CONTAINER').hide();
            $('#divider').hide();
            $('#shelf_image').hide();
            $('#pegboard_image').hide();
            $('#basket_image').hide();
            $('#hanging_bar_image').show();
            $('#chest_image').hide();
            $('#rod_image').hide();
            $('#pallet_image').hide();
            $('#shelf_divider').hide(); //ASA-1265
            $('#P437_AUTO_FILL_PEG_CONTAINER').hide(); //ASA-1109
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('HANGINGBAR_LABEL'));
        } else if (p_object_type == 'BASKET') {
            $('P437_MANUAL_CRUSH_CONTAINER').hide(); //ASA-1300
            $('#P437_GRILL_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_HEIGHT_CONTAINER').show();
            $('#P437_SNAP_TO_SHELF_CONTAINER').show();
            $('#P437_BASKET_FILL_CONTAINER').show();
            $('#P437_SPREAD_PRODUCT_BASKET_CONTAINER').show();
            $('#P437_HEIGHT_CONTAINER').hide();
            $('#P437_BASE_HEIGHT_CONTAINER').show();
            $('#P437_WALL_THICKNESS_CONTAINER').show();
            $('#P437_SPACER_THICKNESS_CONTAINER').hide();
            $('#P437_HORIZ_GAP_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_COMBINE_CONTAINER').hide();
            $('#P437_LEFT_OVERHANG_CONTAINER').hide();
            $('#P437_RIGHT_OVERHANG_CONTAINER').hide();
            $('#P437_UPPER_OVERHANG_CONTAINER').hide();
            $('#P437_LOWER_OVERHANG_CONTAINER').hide();
            $('#P437_ALLOW_AUTO_CRUSH_CONTAINER').hide();
            $('#P437_HORIZ_START_CONTAINER').hide();
            $('#P437_HORIZ_SPACING_CONTAINER').hide();
            $('#P437_VERT_START_CONTAINER').hide();
            $('#P437_VERT_SPACING_CONTAINER').hide();
            $('#P437_CHEST_HORZ_GAP_CONTAINER').hide();
            $('#P437_DEPTH_GAP_CONTAINER').hide();
            $('#P437_ROD_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_MAX_MERCH_CONTAINER').show();
            $('#P437_FRONT_OVERHANG_CONTAINER').hide();
            $('#P437_BACK_OVERHANG_CONTAINER').hide();
            $('#P437_SHELF_OVERLAP_CONTAINER').hide();
            $('#P437_SHELF_SLOPE_CONTAINER').hide();
            $('#P437_ROTATION_CONTAINER').hide();
            $('#P437_AUTO_PLACING_CONTAINER').hide();
            $('#P437_SNAP_TO_SHELF').addClass('apex_disabled');
            $('#divider').hide();
            $('#shelf_image').hide();
            $('#pegboard_image').hide();
            $('#hanging_bar_image').hide();
            $('#basket_image').show();
            $('#chest_image').hide();
            $('#rod_image').hide();
            $('#pallet_image').hide();
            $('#shelf_divider').hide(); //ASA-1265
            $('#P437_AUTO_FILL_PEG_CONTAINER').hide(); //ASA-1109
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('BASKET_LABEL'));
        } else if (p_object_type == 'CHEST') {
            $('P437_MANUAL_CRUSH_CONTAINER').show(); //ASA-1300
            $('#P437_GRILL_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_HEIGHT_CONTAINER').show();
            $('#P437_SNAP_TO_SHELF_CONTAINER').hide();
            $('#P437_BASKET_FILL_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCT_BASKET_CONTAINER').hide();
            $('#P437_HEIGHT_CONTAINER').hide();
            $('#P437_BASE_HEIGHT_CONTAINER').show();
            $('#P437_WALL_THICKNESS_CONTAINER').show();
            $('#P437_SPACER_THICKNESS_CONTAINER').hide();
            $('#P437_HORIZ_GAP_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_COMBINE_CONTAINER').hide();
            $('#P437_LEFT_OVERHANG_CONTAINER').hide();
            $('#P437_RIGHT_OVERHANG_CONTAINER').hide();
            $('#P437_UPPER_OVERHANG_CONTAINER').hide();
            $('#P437_LOWER_OVERHANG_CONTAINER').hide();
            $('#P437_HORIZ_START_CONTAINER').hide();
            $('#P437_HORIZ_SPACING_CONTAINER').hide();
            $('#P437_VERT_START_CONTAINER').hide();
            $('#P437_VERT_SPACING_CONTAINER').hide();
            $('#P437_DEPTH_SLOT_START_CONTAINER').show();
            $('#P437_DEPTH_SLOT_SPACING_CONTAINER').show();
            $('#P437_CHEST_HORZ_GAP_CONTAINER').show();
            $('#P437_DEPTH_GAP_CONTAINER').hide();
            $('#P437_ROD_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_MAX_MERCH_CONTAINER').show();
            $('#P437_FRONT_OVERHANG_CONTAINER').hide();
            $('#P437_BACK_OVERHANG_CONTAINER').hide();
            $('#P437_SHELF_OVERLAP_CONTAINER').hide();
            $('#P437_SHELF_SLOPE_CONTAINER').hide();
            $('#P437_ROTATION_CONTAINER').hide();
            //$('#P437_AUTO_PLACING_CONTAINER').hide();ASA-1300
            $('#divider').show();
            $('#shelf_image').hide();
            $('#pegboard_image').hide();
            $('#hanging_bar_image').hide();
            $('#basket_image').hide();
            $('#rod_image').hide();
            $('#chest_image').show();
            $('#pallet_image').hide();
            $('#shelf_divider').hide(); //ASA-1265
            $('#P437_AUTO_FILL_PEG_CONTAINER').hide(); //ASA-1109
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('CHEST_LABEL'));
        } else if (p_object_type == 'ROD') {
            $('P437_MANUAL_CRUSH_CONTAINER').hide(); //ASA-1300
            $('#P437_GRILL_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_HEIGHT_CONTAINER').hide();
            $('#P437_SNAP_TO_SHELF_CONTAINER').hide();
            $('#P437_BASKET_FILL_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCT_BASKET_CONTAINER').hide();
            $('#P437_HEIGHT_CONTAINER').show();
            $('#P437_BASE_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_THICKNESS_CONTAINER').hide();
            $('#P437_SPACER_THICKNESS_CONTAINER').hide();
            $('#P437_HORIZ_GAP_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_COMBINE_CONTAINER').hide();
            $('#P437_LEFT_OVERHANG_CONTAINER').hide();
            $('#P437_RIGHT_OVERHANG_CONTAINER').hide();
            $('#P437_UPPER_OVERHANG_CONTAINER').hide();
            $('#P437_LOWER_OVERHANG_CONTAINER').hide();
            $('#P437_ALLOW_AUTO_CRUSH_CONTAINER').hide();
            $('#P437_HORIZ_START_CONTAINER').hide();
            $('#P437_HORIZ_SPACING_CONTAINER').hide();
            $('#P437_VERT_START_CONTAINER').hide();
            $('#P437_VERT_SPACING_CONTAINER').hide();
            $('#P437_CHEST_HORZ_GAP_CONTAINER').hide();
            $('#P437_DEPTH_GAP_CONTAINER').show();
            $('#P437_ROD_SPREAD_PRODUCTS_CONTAINER').show();
            $('#P437_MAX_MERCH_CONTAINER').hide();
            $('#P437_FRONT_OVERHANG_CONTAINER').hide();
            $('#P437_BACK_OVERHANG_CONTAINER').hide();
            $('#P437_SHELF_OVERLAP_CONTAINER').hide();
            $('#P437_SHELF_SLOPE_CONTAINER').hide();
            $('#P437_ROTATION_CONTAINER').hide();
            $('#P437_AUTO_PLACING_CONTAINER').hide();
            $('#divider').hide();
            $('#shelf_image').hide();
            $('#pegboard_image').hide();
            $('#hanging_bar_image').hide();
            $('#basket_image').hide();
            $('#rod_image').show();
            $('#chest_image').hide();
            $('#pallet_image').hide();
            $('#shelf_divider').hide(); //ASA-1265
            $('#P437_AUTO_FILL_PEG_CONTAINER').hide(); //ASA-1109
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('ROD_LABEL'));
        } else if (p_object_type == 'PALLET') {
            $('P437_MANUAL_CRUSH_CONTAINER').hide(); //ASA-1300
            $('#P437_GRILL_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_HEIGHT_CONTAINER').hide();
            $('#P437_SNAP_TO_SHELF_CONTAINER').hide();
            $('#P437_BASKET_FILL_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCT_BASKET_CONTAINER').hide();
            $('#P437_HEIGHT_CONTAINER').show();
            $('#P437_BASE_HEIGHT_CONTAINER').hide();
            $('#P437_WALL_THICKNESS_CONTAINER').hide();
            $('#P437_SPACER_THICKNESS_CONTAINER').hide();
            $('#P437_HORIZ_GAP_CONTAINER').hide();
            $('#P437_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_COMBINE_CONTAINER').hide();
            $('#P437_LEFT_OVERHANG_CONTAINER').show();
            $('#P437_RIGHT_OVERHANG_CONTAINER').show();
            $('#P437_UPPER_OVERHANG_CONTAINER').hide();
            $('#P437_LOWER_OVERHANG_CONTAINER').hide();
            $('#P437_ALLOW_AUTO_CRUSH_CONTAINER').hide();
            $('#P437_HORIZ_START_CONTAINER').hide();
            $('#P437_HORIZ_SPACING_CONTAINER').hide();
            $('#P437_VERT_START_CONTAINER').hide();
            $('#P437_VERT_SPACING_CONTAINER').hide();
            $('#P437_CHEST_HORZ_GAP_CONTAINER').show();
            $('#P437_DEPTH_GAP_CONTAINER').hide();
            $('#P437_ROD_SPREAD_PRODUCTS_CONTAINER').hide();
            $('#P437_MAX_MERCH_CONTAINER').show();
            $('#P437_FRONT_OVERHANG_CONTAINER').show();
            $('#P437_BACK_OVERHANG_CONTAINER').show();
            $('#P437_DEPTH_SLOT_START_CONTAINER').show();
            $('#P437_DEPTH_SLOT_SPACING_CONTAINER').show();
            $('#P437_SHELF_OVERLAP_CONTAINER').hide();
            $('#P437_SHELF_SLOPE_CONTAINER').hide();
            $('#P437_ROTATION_CONTAINER').hide();
            $('#P437_AUTO_PLACING_CONTAINER').hide();
            $('#divider').show();
            $('#shelf_image').hide();
            $('#pegboard_image').hide();
            $('#hanging_bar_image').hide();
            $('#basket_image').hide();
            $('#chest_image').hide();
            $('#rod_image').hide();
            $('#pallet_image').show();
            $('#shelf_divider').hide(); //ASA-1265
            $('#P437_AUTO_FILL_PEG_CONTAINER').hide(); //ASA-1109
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message('PALLET_LABEL'));
        }else if (p_object_type == "TEXTBOX"){  
            $('#P437_TEXT_FONT_STYLE_CONTAINER, #P437_TEXT_FONT_SIZE_CONTAINER, #P437_TEXT_BOLD_CONTAINER').show();
        }//ASA-1669

        if ((ShelfDetails[0].g_multiselect == 'Y' || ShelfDetails[0].g_ctrl_select == 'Y') && ShelfDetails[0].delete_details.length > 0) {
            // $('#shelf_divider').hide(); //ASA-1265 // Commented against ASA-1422
            $('#P437_MANUAL_CRUSH_CONTAINER').show(); //ASA-1300
        }
    } catch (err) {
        error_handling(err);
    }
}
function set_item_onload() {
    try {       
        var itemOnShelf = false; //ASA-1410
        if ((ShelfDetails[0].g_multiselect == 'Y' || ShelfDetails[0].g_ctrl_select == 'Y') && ShelfDetails[0].delete_details.length > 0) {
            $s('P437_ID', 'Mixed');
            $s('P437_DESCRIPTION', 'Mixed');
            $s('P437_GRILL_HEIGHT', 0);
            $s('P437_HORIZ_SPACING', 0);
            $s('P437_SPACER_THICKNESS', 0);
            $s('P437_HORIZ_GAP', 0);
            $s('P437_HORIZ_SLOT_START', 0);
            $s('P437_HORIZ_SLOT_SPACING', 0);

            /* $s('P437_COMBINE', 0);
            $s('P437_HEIGHT', 0);
            $s('P437_DEPTH', 0);
            $s('P437_WIDTH', 0);
            $s('P437_ROTATION', 0);
            $s('P437_SHELF_SLOPE', 0);
            $s('P437_MAX_MERCH', '');
            $s('P437_ALLOW_AUTO_CRUSH', '');
            $s('P437_SPREAD_PRODUCTS', '');
            $s('P437_LEFT_OVERHANG', '');
            $s('P437_RIGHT_OVERHANG', '');
            $s('P437_COLOR', '#3D393D');*/
            //ASA-1272
            $('#P437_ID, #P437_DESCRIPTION, #P437_GRILL_HEIGHT, #P437_HORIZ_SPACING, #P437_SPACER_THICKNESS, #P437_HORIZ_GAP,#P437_HORIZ_SLOT_START, #P437_HORIZ_SLOT_SPACING').addClass('apex_disabled'); //#P437_HEIGHT, #P437_DEPTH, #P437_WIDTH, #P437_ROTATION, #P437_SHELF_SLOPE,

            /*  $s('P437_DIV_HEIGHT', 0); //ASA-1422
            $s('P437_DIV_WIDTH', 0); //ASA-1422
            $s('P437_PLACE_START_DIV', 'N'); //ASA-1422
            $s('P437_PLACE_END_DIV', 'N'); //ASA-1422
            $s('P437_PLACE_DIV_BTW_FACING', 'N'); //ASA-1422
            // $s('P437_DIV_START_X', 0); //ASA-1422//Task_27734
            // $s('P437_DIV_SPACE_X', 0); //ASA-1422//Task_27734
            $s('P437_DIV_FILL_COLOR', '#3D393D'); //ASA-1422*/
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'MaxMerch', 'P437_MAX_MERCH'); //ASA-1471 S
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'W', 'P437_WIDTH');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'H', 'P437_HEIGHT');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'D', 'P437_DEPTH');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'AllowAutoCrush', 'P437_ALLOW_AUTO_CRUSH');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'SpreadItem', 'P437_SPREAD_PRODUCTS');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'Combine', 'P437_COMBINE');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'Color', 'P437_COLOR');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'DivHeight', 'P437_DIV_HEIGHT');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'DivWidth', 'P437_DIV_WIDTH');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'DivPst', 'P437_PLACE_START_DIV');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'DivPed', 'P437_PLACE_END_DIV');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'DivPbtwFace', 'P437_PLACE_DIV_BTW_FACING');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'NoDivIDShow', 'P437_NO_DIV_ID_DISP');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'DivFillCol', 'P437_DIV_FILL_COLOR');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'Slope', 'P437_SHELF_SLOPE');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'Rotation', 'P437_ROTATION');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'Slope', 'P437_SHELF_SLOPE');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'Rotation', 'P437_ROTATION');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'LOverhang', 'P437_LEFT_OVERHANG');
            setIconForInconsistentTag(ShelfDetails[0].delete_details, 'ROverhang', 'P437_RIGHT_OVERHANG'); //ASA-1471 E

            $('#P437_HORIZ_SPACING_CONTAINER').removeClass('is-required');
            hide_show_page_items('SHELF');
            $('#DELETE_SHELF').hide();

            if(JsonContainsAll(ShelfDetails[0].delete_details,{"Object":"SHELF", "ObjType":"TEXTBOX"})){
                hide_show_page_items('TEXTBOX');
                setIconForInconsistentTag(ShelfDetails[0].delete_details, 'FStyle', 'P437_TEXT_FONT_STYLE');
                setIconForInconsistentTag(ShelfDetails[0].delete_details, 'FSize', 'P437_TEXT_FONT_SIZE');
                setIconForInconsistentTag(ShelfDetails[0].delete_details, 'FBold', 'P437_TEXT_BOLD');
            }   //ASA-1669
            apex.item("P437_MAX_MERCH").setFocus();

        } else {
            $s('P437_ID', ShelfDetails[0].Shelf);
            $s('P437_DESCRIPTION', '');
            $s('P437_MAX_MERCH', 0);
            $s('P437_GRILL_HEIGHT', 0);
            $s('P437_LEFT_OVERHANG', 0);
            $s('P437_RIGHT_OVERHANG', 0);
            $s('P437_SPACER_THICKNESS', 0);
            $s('P437_HORIZ_GAP', 0);
            $s('P437_SPREAD_PRODUCTS', 'L');
            $s('P437_COMBINE', 'N');
            $s('P437_ALLOW_AUTO_CRUSH', 'N');
            $s('P437_ROTATION', 0);
            $s('P437_COLOR', '#3D393D');
            $s('P437_HORIZ_SLOT_START', 0);
            $s('P437_HORIZ_SLOT_SPACING', 0);
            $s('P437_HORIZ_START', 0);
            $s('P437_HORIZ_SPACING', 0);
            $s('P437_UPPER_OVERHANG', 0);
            $s('P437_LOWER_OVERHANG', 0);
            $s('P437_VERT_START', 0);
            $s('P437_VERT_SPACING', 0);
            $s('P437_DEPTH_SLOT_START', 0);
            $s('P437_DEPTH_SLOT_SPACING', 0);
            $s('P437_DESCRIPTION', '');
            if (ShelfDetails[0].object_type == 'SHELF' || ShelfDetails[0].object_type == 'HANGINGBAR') {  //ASA-1816 
               $s('P437_HEIGHT', $v('P437_POGCR_DEFAULT_SHELF_HEIGHT'));
            } else {
               $s('P437_HEIGHT', 0);
            }            
            $s('P437_CHEST_HORZ_GAP', 0);
            $s('P437_DEPTH_GAP', 0);
            $s('P437_ROD_SPREAD_PRODUCTS', 'L');
            $s('P437_FRONT_OVERHANG', 0);
            $s('P437_BACK_OVERHANG', 0);
            $s('P437_DIVIDER_FIXED', 'N');
            $s('P437_SLOT_DIVIDER', 'N');
            $s('P437_AREA', '');
            $s('P437_WIDTH', 0);
            $s('P437_DEPTH', 0);
            $s('P437_WALL_HEIGHT', 0);
            $s('P437_BASE_HEIGHT', 0);
            $s('P437_WALL_THICKNESS', 0);
            $s('P437_SHELF_SLOPE', 0);
            $s('P437_DIV_HEIGHT', 0); //ASA-1265
            $s('P437_DIV_WIDTH', 0); //ASA-1265
            $s('P437_PLACE_START_DIV', 'N'); //ASA-1265
            $s('P437_PLACE_END_DIV', 'N'); //ASA-1265
            $s('P437_PLACE_DIV_BTW_FACING', 'N'); //ASA-1265
            //$s('P437_DIV_START_X', 0); //ASA-1265//Task_27734
            //$s('P437_DIV_SPACE_X', 0); //ASA-1265//Task_27734
            $s('P437_DIV_FILL_COLOR', '#3D393D'); //ASA-1265
            $s('P437_MANUAL_CRUSH', (ShelfDetails[0].ManualCrush)); //ASA-1300
            if (ShelfDetails[0].shelf_index !== -1 && ShelfDetails[0].shelf_index !== '') {
                var ItemAutoPlacing = ShelfDetails[0].ShelfInfo.AutoPlacing;
                var AutoFillPeg = ShelfDetails[0].ShelfInfo.AutoFillPeg;
                var l_default = ShelfDetails[0].dividerchecked;
                $s('P437_MANUAL_CRUSH', (ShelfDetails[0].ShelfInfo.ManualCrush)); //ASA-1300
                $s('P437_OBJECT_TYPE', ShelfDetails[0].ShelfInfo.ObjType);
                $s('P437_DESCRIPTION', ShelfDetails[0].ShelfInfo.Desc);
                $s('P437_MAX_MERCH', (ShelfDetails[0].ShelfInfo.MaxMerch * 100).toFixed(2));
                $s('P437_GRILL_HEIGHT', (ShelfDetails[0].ShelfInfo.GrillH * 100).toFixed(2));
                $s('P437_LEFT_OVERHANG', (ShelfDetails[0].ShelfInfo.LOverhang * 100).toFixed(2));
                $s('P437_RIGHT_OVERHANG', (ShelfDetails[0].ShelfInfo.ROverhang * 100).toFixed(2));
                $s('P437_SPACER_THICKNESS', (ShelfDetails[0].ShelfInfo.SpacerThick * 100).toFixed(2));
                $s('P437_SPREAD_PRODUCTS', ShelfDetails[0].ShelfInfo.SpreadItem);
                $s('P437_COMBINE', ShelfDetails[0].ShelfInfo.Combine);
                $s('P437_ALLOW_AUTO_CRUSH', ShelfDetails[0].ShelfInfo.AllowAutoCrush);
                $s('P437_SHELF_OVERLAP', ShelfDetails[0].ShelfInfo.AllowOverLap);
                $s('P437_UPPER_OVERHANG', (ShelfDetails[0].ShelfInfo.UOverHang * 100).toFixed(2));
                $s('P437_LOWER_OVERHANG', (ShelfDetails[0].ShelfInfo.LoOverHang * 100).toFixed(2));
                $s('P437_HORIZ_START', (ShelfDetails[0].ShelfInfo.HorizStart * 100).toFixed(2));
                $s('P437_HORIZ_SPACING', (ShelfDetails[0].ShelfInfo.HorizSpacing * 100).toFixed(2));
                $s('P437_VERT_START', (ShelfDetails[0].ShelfInfo.VertiStart * 100).toFixed(2));
                $s('P437_VERT_SPACING', (ShelfDetails[0].ShelfInfo.VertiSpacing * 100).toFixed(2));
                $s('P437_HEIGHT', (ShelfDetails[0].ShelfInfo.H * 100).toFixed(2));
                $s('P437_WIDTH', (ShelfDetails[0].ShelfInfo.W * 100).toFixed(2));
                $s('P437_DEPTH', (ShelfDetails[0].ShelfInfo.D * 100).toFixed(2));
                $s('P437_ROTATION', ShelfDetails[0].ShelfInfo.Rotation);
                $s('P437_SHELF_SLOPE', ShelfDetails[0].ShelfInfo.Slope);
                $s('P437_COLOR', ShelfDetails[0].ShelfInfo.Color);
                $s('P437_HORIZ_SLOT_START', (ShelfDetails[0].ShelfInfo.HorizSlotStart * 100).toFixed(2));
                $s('P437_HORIZ_SLOT_SPACING', (ShelfDetails[0].ShelfInfo.HorizSlotSpacing * 100).toFixed(2));
                $s('P437_BASKET_FILL', ShelfDetails[0].ShelfInfo.BsktFill);
                $s('P437_SPREAD_PRODUCT_BASKET', ShelfDetails[0].ShelfInfo.BsktSpreadProduct);
                $s('P437_SNAP_TO_SHELF', ShelfDetails[0].ShelfInfo.SnapTo);
                $s('P437_WALL_HEIGHT', (ShelfDetails[0].ShelfInfo.BsktWallH * 100).toFixed(2));
                $s('P437_BASE_HEIGHT', (ShelfDetails[0].ShelfInfo.BsktBaseH * 100).toFixed(2));
                $s('P437_WALL_THICKNESS', (ShelfDetails[0].ShelfInfo.BsktWallThickness * 100).toFixed(2));
                $s('P437_DEPTH_SLOT_START', (ShelfDetails[0].ShelfInfo.DSlotStart * 100).toFixed(2));
                $s('P437_DEPTH_SLOT_SPACING', (ShelfDetails[0].ShelfInfo.DSlotSpacing * 100).toFixed(2));
                $s('P437_CHEST_HORZ_GAP', (ShelfDetails[0].ShelfInfo.HorizGap * 100).toFixed(2));
                $s('P437_HORIZ_GAP', (ShelfDetails[0].ShelfInfo.HorizGap * 100).toFixed(2));
                $s('P437_ROD_SPREAD_PRODUCTS', ShelfDetails[0].ShelfInfo.SpreadItem);
                $s('P437_FRONT_OVERHANG', (ShelfDetails[0].ShelfInfo.FrontOverHang * 100).toFixed(2));
                $s('P437_BACK_OVERHANG', (ShelfDetails[0].ShelfInfo.BackOverHang * 100).toFixed(2));
                if (typeof ShelfDetails[0].ShelfInfo.DivHeight !== 'undefined' && ShelfDetails[0].ShelfInfo.DivHeight !== "") {
                    $s('P437_DIV_HEIGHT', (ShelfDetails[0].ShelfInfo.DivHeight * 100).toFixed(2));
                } else {
                    $s('P437_DIV_HEIGHT', 0);
                }; //ASA-1265
                if (typeof ShelfDetails[0].ShelfInfo.DivWidth !== 'undefined' && ShelfDetails[0].ShelfInfo.DivWidth !== "") {
                    $s('P437_DIV_WIDTH', (ShelfDetails[0].ShelfInfo.DivWidth * 100).toFixed(2));
                } else {
                    $s('P437_DIV_WIDTH', 0);
                }; //ASA-1265

                if (typeof ShelfDetails[0].ShelfInfo.DivPst !== 'undefined' && ShelfDetails[0].ShelfInfo.DivPst !== "") {
                    $s('P437_PLACE_START_DIV', ShelfDetails[0].ShelfInfo.DivPst);
                } else {
                    if (l_default !== "N" && l_default !== "") {
                        if (l_default.split(",")[0] == "PSD") {
                            $s("P437_PLACE_START_DIV", 'Y');
                        } else {
                            $s("P437_PLACE_START_DIV", 'N');
                        }
                    } else {
                        $s("P437_PLACE_START_DIV", 'N');
                    }
                }; //ASA-1265
                if (typeof ShelfDetails[0].ShelfInfo.DivPed !== 'undefined' && ShelfDetails[0].ShelfInfo.DivPed !== "") {
                    $s('P437_PLACE_END_DIV', ShelfDetails[0].ShelfInfo.DivPed);
                } else {
                    if (l_default !== "N" && l_default !== "") {
                        if (l_default.split(",")[1] == "PED") {
                            $s("P437_PLACE_END_DIV", 'Y');
                        } else {
                            $s("P437_PLACE_END_DIV", 'N');
                        }
                    } else {
                        $s("P437_PLACE_END_DIV", 'N');
                    }
                }; //ASA-1265
                if (typeof ShelfDetails[0].ShelfInfo.DivPbtwFace !== 'undefined' && ShelfDetails[0].ShelfInfo.DivPbtwFace !== "") {
                    $s('P437_PLACE_DIV_BTW_FACING', ShelfDetails[0].ShelfInfo.DivPbtwFace);
                } else {
                    if (l_default !== "N" && l_default !== "") {
                        if (l_default.split(",")[2] == "PDBF") {
                            $s("P437_PLACE_DIV_BTW_FACING", 'Y');
                        } else {
                            $s("P437_PLACE_DIV_BTW_FACING", 'N');
                        }
                    } else {
                        $s("P437_PLACE_DIV_BTW_FACING", 'N');
                    }
                }; //ASA-1265
                if (typeof ShelfDetails[0].ShelfInfo.NoDivIDShow !== 'undefined' && ShelfDetails[0].ShelfInfo.NoDivIDShow !== "") { //ASA-1406
                    $s('P437_NO_DIV_ID_DISP', ShelfDetails[0].ShelfInfo.NoDivIDShow);
                } else {
                    if (l_default !== "N" && l_default !== "") {
                        if (l_default.split(",")[3] == "Y") {
                            $s("P437_NO_DIV_ID_DISP", 'Y');
                        } else {
                            $s("P437_NO_DIV_ID_DISP", 'N');
                        }
                    } else {
                        $s("P437_NO_DIV_ID_DISP", 'N');
                    }
                }; //ASA-1406
                /*if (typeof ShelfDetails[0].ShelfInfo.DivStX !== 'undefined' && ShelfDetails[0].ShelfInfo.DivStX !== "") {
                $s('P437_DIV_START_X', (ShelfDetails[0].ShelfInfo.DivStX * 100).toFixed(2));
                } else {
                $s('P437_DIV_START_X', 0);
                }; //ASA-1265
                if (typeof ShelfDetails[0].ShelfInfo.DivSpaceX !== 'undefined' && ShelfDetails[0].ShelfInfo.DivSpaceX !== "") {
                $s('P437_DIV_SPACE_X', (ShelfDetails[0].ShelfInfo.DivSpaceX * 100).toFixed(2));
                } else {
                $s('P437_DIV_SPACE_X', 0);
                }; *///ASA-1265//Task_27734
                // if (typeof ShelfDetails[0].ShelfInfo.DivFillCol !== 'undefined' && ShelfDetails[0].ShelfInfo.DivFillCol !== "") {
                if (nvl(ShelfDetails[0].ShelfInfo.DivFillCol) !== 0) { //Regression Issue 9  Task_27322
                    $s('P437_DIV_FILL_COLOR', ShelfDetails[0].ShelfInfo.DivFillCol);
                } else {
                    $s('P437_DIV_FILL_COLOR', "#3D393D");
                }; //ASA-1265
                $('#P437_COMBINE').removeClass('apex_disabled');
                $('#P437_HEIGHT').removeClass('apex_disabled');
                $('#P437_DEPTH').removeClass('apex_disabled');
                $('#P437_WIDTH').removeClass('apex_disabled');
                $('#P437_ID').removeClass('apex_disabled');
                $('#P437_DESCRIPTION').removeClass('apex_disabled');
                $('#P437_GRILL_HEIGHT').removeClass('apex_disabled');
                $('#P437_HORIZ_SPACING').removeClass('apex_disabled');
                $('#P437_SPACER_THICKNESS').removeClass('apex_disabled');
                $('#P437_HORIZ_GAP').removeClass('apex_disabled');
                $('#P437_ROTATION').removeClass('apex_disabled');
                $('#P437_SHELF_SLOPE').removeClass('apex_disabled');
                $('#P437_HORIZ_SLOT_START').removeClass('apex_disabled');
                $('#P437_HORIZ_SLOT_SPACING').removeClass('apex_disabled');
                if (typeof ItemAutoPlacing !== 'undefined') {
                    $s('P437_AUTO_PLACING', ShelfDetails[0].ShelfInfo.AutoPlacing);
                };
                //ASA-1109
                if (typeof AutoFillPeg !== 'undefined' && AutoFillPeg !== "") {
                    $s('P437_AUTO_FILL_PEG', ShelfDetails[0].ShelfInfo.AutoFillPeg);
                } else {
                    $s('P437_AUTO_FILL_PEG', "N");
                };
            }
            $s('P437_OBJECT_TYPE', ShelfDetails[0].object_type);
            if (ShelfDetails[0].object_type == 'SHELF') {
                $('#P437_HORIZ_SPACING_CONTAINER').removeClass('is-required');
                hide_show_page_items('SHELF');
            } else if (ShelfDetails[0].object_type == 'PEGBOARD') {
                $('#P437_HORIZ_SPACING_CONTAINER').addClass('is-required');
                hide_show_page_items('PEGBOARD');
            } else if (ShelfDetails[0].object_type == 'HANGINGBAR') {
                hide_show_page_items('HANGINGBAR');
            } else if (ShelfDetails[0].object_type == 'BASKET') {
                hide_show_page_items('BASKET');
            } else if (ShelfDetails[0].object_type == 'CHEST') {
                hide_show_page_items('CHEST');
            } else if (ShelfDetails[0].object_type == 'ROD') {
                hide_show_page_items('ROD');
            } else if (ShelfDetails[0].object_type == 'PALLET') {
                hide_show_page_items('PALLET');
            }
            if (ShelfDetails[0].shelf_index !== -1) {
                if (ShelfDetails[0].duplicate_fixel == 'N') {
                    $s('P437_ID', ShelfDetails[0].ShelfInfo.Shelf);
                    $s('P437_SHELF_EDIT_IND', 'Y');
                    $('#DELETE_SHELF').css('display', 'inline');
                } else {
                    $s('P437_ID', ShelfDetails[0].Module + (ShelfDetails[0].ShelfLen + 1));
                    $s('P437_SHELF_EDIT_IND', 'N');
                }
            } else {
                $('#DELETE_SHELF').css('display', 'none');
            }
            if (ShelfDetails[0].POGLen > 0 && ShelfDetails[0].shelf_index == -1) {
                var shelf_id = ShelfDetails[0].Module + (ShelfDetails[0].ShelfLen + 1);
                $s('P437_ID', shelf_id);
                if (ShelfDetails[0].object_type !== 'ROD')
                    $s('P437_WIDTH', (ShelfDetails[0].ModW * 100).toFixed(2));

                if (ShelfDetails[0].object_type == 'PEGBOARD' && ShelfDetails[0].object_type !== 'DIVIDER')
                    $s('P437_DEPTH', 1);
                else
                    $s('P437_DEPTH', (ShelfDetails[0].ModD * 100).toFixed(2));
            }

            apex.item("P437_DESCRIPTION").setFocus();
        }

        //ASA-1507 #2 Start
        $('body').on('keydown',function (event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                $('#CREATE_SHELF').click();
            }
        });
        //ASA-1507 #2 End

    } catch (err) {
        error_handling(err);
    }
}

function create_shelf() {
    var ShelfInfo = {};   
    if ((ShelfDetails[0].g_multiselect == 'Y' || ShelfDetails[0].g_ctrl_select == 'Y') && ShelfDetails[0].delete_details.length > 0) {
        if ($v("P437_CHANE_IND") == "Y") { //ASA-1398 issue 2
            ShelfInfo["MaxMerch"] = parseFloat($v('P437_MAX_MERCH'));
            ShelfInfo["ShelfEdit"] = "Y";
        } else {
            ShelfInfo["ShelfEdit"] = "N";
            ShelfInfo["MaxMerch"] = $v('P437_MAX_MERCH') !== "" ? parseFloat($v('P437_MAX_MERCH')) : 0; //ASA-1471 issue 6

        }
        ShelfInfo["LOverhang"] = parseFloat($v('P437_LEFT_OVERHANG'));
        ShelfInfo["ROverhang"] = parseFloat($v('P437_RIGHT_OVERHANG'));
        ShelfInfo["AllowAutoCrush"] = $v('P437_ALLOW_AUTO_CRUSH');
        ShelfInfo["SpreadItem"] = $v('P437_SPREAD_PRODUCTS');
        ShelfInfo["Color"] = $v('P437_COLOR');
        //ShelfInfo["Combine"] = $v('P437_COMBINE') == '' ? 'N' : $v('P437_COMBINE'); //ASA-1272 ,ASA-1595 Issue 2
        ShelfInfo["Combine"] = $v('P437_COMBINE') == '' ? 'S' : $v('P437_COMBINE'); //ASA-1595 Issue 2
        ShelfInfo["H"] = parseFloat($v('P437_HEIGHT')); //ASA-1272
        ShelfInfo["W"] = parseFloat($v('P437_WIDTH')); //ASA-1272
        ShelfInfo["D"] = parseFloat($v('P437_DEPTH')); //ASA-1272
        ShelfInfo["Slope"] = parseFloat($v('P437_SHELF_SLOPE')); //ASA-1272
        ShelfInfo["Rotation"] = parseFloat($v('P437_ROTATION')); //ASA-1272
        ShelfInfo["ManualCrush"] = $v('P437_MANUAL_CRUSH'); //ASA-1300
        ShelfInfo["FStyle"] = $v('P437_TEXT_FONT_STYLE'); //ASA-1669
        ShelfInfo["FSize"] = $v('P437_TEXT_FONT_SIZE'); //ASA-1669
        ShelfInfo["FBold"] = $v('P437_TEXT_BOLD');     //ASA-1669
        /*Start ASA-1422*/
        if (ShelfInfo["NoDivIDShow"] !== $v('P437_NO_DIV_ID_DISP') || $v('P437_DIV_HEIGHT') / 100 !== ShelfInfo["DivHeight"] || $v('P437_DIV_WIDTH') / 100 !== ShelfInfo["DivWidth"] || ShelfInfo["DivPst"] !== $v('P437_PLACE_START_DIV') || ShelfInfo["DivPed"] !== $v('P437_PLACE_END_DIV') || ShelfInfo["DivPbtwFace"] !== $v('P437_PLACE_DIV_BTW_FACING') || ShelfInfo["DivFillCol"] !== $v('P437_DIV_FILL_COLOR')) { //Task_27734
            ShelfInfo["DivCreated"] = "Y";
        } else {
            ShelfInfo["DivCreated"] = "N";
        }
        ShelfInfo["DivHeight"] = $v('P437_DIV_HEIGHT');
        ShelfInfo["DivWidth"] = $v('P437_DIV_WIDTH');
        ShelfInfo["DivPst"] = $v('P437_PLACE_START_DIV');
        ShelfInfo["DivPed"] = $v('P437_PLACE_END_DIV');
        ShelfInfo["DivPbtwFace"] = $v('P437_PLACE_DIV_BTW_FACING');
        ShelfInfo["DivStX"] = 0; //$v('P437_DIV_START_X');//Task_27734
        ShelfInfo["DivSpaceX"] = 0; //$v('P437_DIV_SPACE_X');//Task_27734
        ShelfInfo["DivFillCol"] = $v('P437_DIV_FILL_COLOR');
        ShelfInfo["NoDivIDShow"] = $v('P437_NO_DIV_ID_DISP');
        //ASA-1471 issue 15 S
        ShelfInfo["ColorChng"] = l_shelf_details.ColorChng;
        ShelfInfo["Height"] = l_shelf_details.Height;
        ShelfInfo["Width"] = l_shelf_details.Width;
        ShelfInfo["Depth"] = l_shelf_details.Depth;
        ShelfInfo["Rotation"] = l_shelf_details.Rotation;
        ShelfInfo["Slope"] = l_shelf_details.Slope;
        ShelfInfo["DivHChng"] = l_shelf_details.DivHChng;
        ShelfInfo["DivWChng"] = l_shelf_details.DivWChng;
        ShelfInfo["DivPSChng"] = l_shelf_details.DivPSChng;
        ShelfInfo["DivPEChng"] = l_shelf_details.DivPEChng;
        ShelfInfo["DivPDBFChng"] = l_shelf_details.DivPDBFChng;
        ShelfInfo["DivIDChng"] = l_shelf_details.DivIDChng;
        ShelfInfo["DivFCChng"] = l_shelf_details.DivFCChng;
        ShelfInfo["LoverhungChng"] = l_shelf_details.LoverhungChng;
        ShelfInfo["RoverhungChng"] = l_shelf_details.RoverhungChng;
        ShelfInfo["SpreadPrdct"] = l_shelf_details.SpreadPrdct;
        ShelfInfo["FStyleChng"] = l_shelf_details.FStyleChng; //ASA-1669
        ShelfInfo["FSizeChng"] = l_shelf_details.FSizeChng; //ASA-1669
        ShelfInfo["FBoldChng"] = l_shelf_details.FBoldChng;     //ASA-1669

        l_shelf_details = [];
        //ASA-1471 issue 15 E
        /*End ASA-1422*/
        l_shelf_details.push(ShelfInfo);
        sessionStorage.setItem('shelf_details', JSON.stringify(l_shelf_details));
        apex.submit('SAVE');
    } else {
        l_shelf_details = [];
        var ShelfID = $v('P437_ID');
        var shelfY = 0;
        var l_shelf_max_merch;
        var added_value,
            rotation_check = 'N',
            validate_passed = 'N',
            old_shelfInfo,
            item_depth = 0,
            wall_height_check = 'N',
            total_items_width = 0,
            index = -1,
            shelf_ind = -1,
            max_items_depth = [],
            item_height_arr = [],
            divCheck = 'N',
            duplicate_ind = 'N';
        var OldObjID = -1;
        var newShelfIndex = -1;
        try {
            //ASA-1964.2 Start
            if (sessionStorage.getItem('pog_json') !== null) {
                var pog_details = JSON.parse(sessionStorage.getItem('pog_json'));
                var module_index = sessionStorage.getItem('current_module_index');
                var shelf_index = sessionStorage.getItem('current_shelf_index');
                const ModuleInfo = pog_details.ModuleInfo || [];
                const newShelfName = (ShelfID || "").toUpperCase().trim();

                for (let modIndex = 0; modIndex < ModuleInfo.length; modIndex++) {
                    const ShelfInfo = ModuleInfo[modIndex].ShelfInfo || [];
                    for (let shelfIndex = 0; shelfIndex < ShelfInfo.length; shelfIndex++) {
                        const shelfName = (ShelfInfo[shelfIndex].Shelf || "").toUpperCase().trim();
                        if (modIndex == module_index && shelfIndex == shelf_index) {
                            continue;
                        }
                        if (newShelfName === shelfName && !(modIndex == module_index && shelfIndex == shelf_index))
                        {
                            duplicate_ind = "Y";
                            break;
                        }
                    }
                    if (duplicate_ind === "Y") break;
                }
            }
            
            // if (typeof ShelfDetails[0].ShlfNames !== 'undefined' && ShelfDetails[0].ShlfNames.length > 0) {
            //     for (const shlfnames of ShelfDetails[0].ShlfNames) {
            //         if (ShelfID.toUpperCase().trim() === shlfnames.toUpperCase().trim()) {
            //             duplicate_ind = 'Y';
            //         }
            //     }
            // }
            //ASA-1964.2 End
            if ($v('P437_OBJECT_TYPE') == 'BASKET' || $v('P437_OBJECT_TYPE') == 'CHEST')
                wall_height_check = 'Y';

            if ($v('P437_MAX_MERCH') != null)
                l_shelf_max_merch = parseFloat($v('P437_MAX_MERCH')) / 100;
            else
                l_shelf_max_merch = 0;

            if (ShelfDetails[0].edited_ind == 'Y') {
                ShelfInfo = ShelfDetails[0].ShelfInfo;
                old_shelfInfo = JSON.parse(JSON.stringify(ShelfDetails[0].ShelfInfo));
                OldObjID = ShelfDetails[0].ShelfInfo.SObjID;
                var shelf_top = parseFloat(((ShelfDetails[0].ShelfInfo.Y + (ShelfDetails[0].ShelfInfo.H / 2)).toFixed(3)));
                if (ShelfDetails[0].ShelfInfo.ItemInfo.length > 0 && $v('P437_OBJECT_TYPE') !== 'ROD') {
                    $.each(ShelfDetails[0].ShelfInfo.ItemInfo, function (i, items) {
                        if (items.Item !== "DIVIDER") { //ASA-2049 Issue1 condition added
                            if ($v('P437_ALLOW_AUTO_CRUSH') == "N") { //ASA-1386 ISSUE 3 -S
                                total_items_width += items.RW;
                            } else {
                                total_items_width += items.W;
                            } //ASA-1386 ISSUE 3 E
                            max_items_depth.push(items.D);
                            item_height_arr.push(items.H);
                        }
                    });
                    index = max_items_depth.findIndex(function (number) {
                        return number > l_shelf_max_merch;
                    });

                    var height_index = item_height_arr.findIndex(function (number) {
                        return number > l_shelf_max_merch;
                    });

                    if ($v('P437_OBJECT_TYPE') == 'CHEST' || $v('P437_OBJECT_TYPE') == 'PALLET') {
                        var horiz_gap = parseFloat($v('P437_CHEST_HORZ_GAP')) / 100;
                    } else {
                        var horiz_gap = parseFloat($v('P437_HORIZ_GAP')) / 100;
                    }
                    total_items_width = total_items_width + (horiz_gap * (ShelfDetails[0].ShelfInfo.ItemInfo.length - 1));
                } else if (ShelfDetails[0].ShelfInfo.ItemInfo.length > 0 && $v('P437_OBJECT_TYPE') == 'ROD') {
                    $.each(ShelfDetails[0].ShelfInfo.ItemInfo, function (i, items) {
                        item_depth += items.D;
                    });
                    item_depth = item_depth + ((parseFloat($v('P437_DEPTH_GAP')) / 100) * (ShelfDetails[0].ShelfInfo.ItemInfo.length - 1));
                }
                if (parseFloat($v('P437_ROTATION')) !== 0) {
                    var shelf_start = ShelfDetails[0].ShelfInfo.X - (parseFloat($v('P437_WIDTH')) / 2);
                    var module_start = ShelfDetails[0].ModX - (ShelfDetails[0].ModW / 2);
                    var shelf_end = ShelfDetails[0].ShelfInfo.X + (parseFloat($v('P437_WIDTH')) / 2);
                    var module_end = ShelfDetails[0].ModX + (ShelfDetails[0].ModW / 2);
                    var shelf_top = ShelfDetails[0].ShelfInfo.Y + (parseFloat($v('P437_HEIGHT')) / 2);
                    var shelf_bottom = ShelfDetails[0].ShelfInfo.Y - (parseFloat($v('P437_HEIGHT')) / 2);

                    if ((shelf_start >= module_start || shelf_end <= module_end || (ShelfDetails[0].ShelfInfo.X > module_start && ShelfDetails[0].ShelfInfo.X < module_end)) && shelf_top < ShelfDetails[0].ModH && shelf_bottom > 0) {
                        rotation_check = 'Y';
                    }
                }
                if (typeof ShelfDetails[0].ShelfInfo.ItemInfo !== undefined && ShelfDetails[0].ShelfInfo.ItemInfo !== "" && $v('P437_OBJECT_TYPE') == 'SHELF' && ShelfDetails[0].g_overhung_shelf_active == 'N') { //ASA-1265
                    if (total_items_width > $v('P437_WIDTH') / 100 && parseFloat($v('P437_DIV_WIDTH')) > 0) { //ASA-1383 found a issue when always divider check fires even not creating.
                        divCheck = 'Y';
                    } 
                    //ASA-1927 Issue-3
                     else if (parseFloat($v('P437_MAX_MERCH')) > 0 && parseFloat($v('P437_DIV_HEIGHT')) > parseFloat($v('P437_MAX_MERCH')) && ShelfDetails[0].g_overhung_shelf_active == 'N') {
                        divCheck = 'Y';
                    }
                }

            }
            if (ShelfDetails[0].duplicating == 'Y' && ShelfDetails[0].item_edit_flag == 'Y') {
                $s('P437_ID', 'C' + ShelfDetails[0].ShelfLen);
                $s('P437_HEIGHT', 2);
                $s('P437_WIDTH', ShelfDetails[0].ModW * 100);
                $s('P437_DEPTH', 100);
                ShelfInfo["creationType"] = 'A';
            };

            if (duplicate_ind == 'Y') {
                alert(get_message('COMPONENT_UNIQUE_ID'));
            } else if ($v('P437_HEIGHT') == '' && wall_height_check == 'N') {
                alert(get_message('ENTER_MANDATORY_FIELDS'));
            } else if ($v('P437_WIDTH') == '' || $v('P437_DEPTH') == '' || $v('P437_ID') == '' || $v('P437_COLOR') == '') {
                alert(get_message('ENTER_MANDATORY_FIELDS'));
            } else if (($v('P437_WALL_HEIGHT') == '' || $v('P437_BASE_HEIGHT') == '' || $v('P437_WALL_THICKNESS') == '') && wall_height_check == 'Y') {
                alert(get_message('ENTER_MANDATORY_FIELDS'));
            } else if ($v('P437_HEIGHT') == 0 && wall_height_check == 'N') {
                alert(get_message('HEIGHT_GRT_THAN_ZERO'))
            } else if ($v('P437_WALL_HEIGHT') == 0 && wall_height_check == 'Y') {
                alert(get_message('WALL_HGT_GRT_ZERO'))
            } else if ($v('P437_BASE_HEIGHT') == 0 && wall_height_check == 'Y') {
                alert(get_message('BASE_HGT_GRT_ZERO'))
            } else if ($v('P437_WALL_THICKNESS') == 0 && wall_height_check == 'Y') {
                alert(get_message('WALL_THICK_GRT_ZERO'))
            } else if ($v('P437_WIDTH') == 0) {
                alert(get_message('WIDTH_GRT_THAN_ZERO'))
            } else if ($v('P437_ROTATION') !== '' && (parseFloat($v('P437_ROTATION')) > 359 || parseFloat($v('P437_ROTATION')) < 0)) {
                alert(get_message('ROTATION_BTW_RANGE'))
            } else if ($v('P437_DEPTH') == 0) {
                alert(get_message('DEPTH_GRT_THAN_ZERO'))
            } else if ($v('P437_OBJECT_TYPE') == 'PEGBOARD' && ($v('P437_VERT_SPACING') == 0 || $v('P437_HORIZ_SPACING') == 0)) {
                alert(get_message('PEG_SPACING_GRT_ZERO'))
            } else if (ShelfDetails[0].g_overhung_shelf_active == 'N' && $v('P437_COMBINE') == 'N' && total_items_width > (parseFloat($v('P437_WIDTH')) / 100) && ShelfDetails[0].ShelfInfo.ItemInfo.length > 0 && $v('P437_OBJECT_TYPE') !== 'ROD' && $v('P437_ALLOW_AUTO_CRUSH') == 'N' && $v('P437_OBJECT_TYPE') !== 'PEGBOARD' && !(g_overhung_shelf_active == "Y" && ($v('P437_OBJECT_TYPE') == 'SHELF' || $v('P437_OBJECT_TYPE') == 'HANGINGBAR'))) {
                alert(get_message('LOST_FROM_SHELF_ERR_HORIZ', ShelfDetails[0].ShelfInfo.Shelf));
            } else if (index !== -1 && $v('P437_OBJECT_TYPE') == 'HANGINGBAR' && l_shelf_max_merch > 0 && g_overhung_shelf_active !== "Y") {
                alert(get_message('LOST_FROM_SHELF_ERR_DEPTH', ShelfDetails[0].ShelfInfo.Shelf));
            } else if (item_depth > parseFloat($v('P437_DEPTH')) / 100 && $v('P437_OBJECT_TYPE') == 'ROD' && ShelfDetails[0].ShelfInfo.ItemInfo.length > 0) {
                alert(get_message('LOST_FROM_SHELF_ERR_DEPTH', ShelfDetails[0].ShelfInfo.Shelf));
            } else if (rotation_check == 'Y') {
                alert(get_message('LOST_FROM_SHELF_ROTATION_ERR', ShelfDetails[0].ShelfInfo.Shelf, ShelfDetails[0].POGCode + ShelfDetails[0].Module));
            } else if (divCheck == 'Y') {
                alert(get_message('NOT_AVAIL_SPACE_DIVIDERS')); //ASA-1265
            } else {
                console.log('success');
                ShelfInfo["Shelf"] = $v('P437_ID');
                ShelfInfo["Desc"] = $v('P437_DESCRIPTION');
                ShelfInfo["MaxMerch"] = $v('P437_MAX_MERCH');
                ShelfInfo["GrillH"] = $v('P437_GRILL_HEIGHT');
                ShelfInfo["AllowAutoCrush"] = $v('P437_ALLOW_AUTO_CRUSH');
                ShelfInfo["AllowOverLap"] = $v('P437_SHELF_OVERLAP');
                if (ShelfDetails[0].object_type == 'CHEST' || ShelfDetails[0].object_type == 'PALLET')
                    ShelfInfo["HorizGap"] = $v('P437_CHEST_HORZ_GAP');
                else
                    ShelfInfo["HorizGap"] = $v('P437_HORIZ_GAP');

                if (ShelfDetails[0].object_type == 'ROD')
                    ShelfInfo["SpreadItem"] = $v('P437_ROD_SPREAD_PRODUCTS');
                else
                    ShelfInfo["SpreadItem"] = $v('P437_SPREAD_PRODUCTS');

                ShelfInfo["H"] = $v('P437_HEIGHT');

                if ($v('P437_HORIZ_START') == 0) {
                    ShelfInfo["HorizStart"] = $v('P437_HORIZ_SPACING');
                } else {
                    ShelfInfo["HorizStart"] = $v('P437_HORIZ_START');
                }

                if ($v('P437_VERT_START') == 0) {
                    ShelfInfo["VertiStart"] = $v('P437_VERT_SPACING');
                } else {
                    ShelfInfo["VertiStart"] = $v('P437_VERT_START');
                }
                ShelfInfo["ManualCrush"] = $v('P437_MANUAL_CRUSH'); //ASA-1300
                ShelfInfo["BsktBaseH"] = $v('P437_BASE_HEIGHT');
                ShelfInfo["VertiSpacing"] = $v('P437_VERT_SPACING');
                ShelfInfo["HorizSpacing"] = $v('P437_HORIZ_SPACING');
                ShelfInfo["InputText"] = '';
                ShelfInfo["WrapText"] = '';
                ShelfInfo["ReduceToFit"] = '';
                ShelfInfo["SlotDivider"] = '';
                ShelfInfo["SlotOrientation"] = '';
                ShelfInfo["DividerFixed"] = 'N';
                ShelfInfo["LObjID"] = -1;
                ShelfInfo["NotchLabelObjID"] = -1;
                ShelfInfo["FStyle"] = 'Arial';
                ShelfInfo["ChestHorz"] = $v('P437_CHEST_HORZ_GAP');
                ShelfInfo["DGap"] = $v('P437_DEPTH_GAP');
                ShelfInfo["AutoPlacing"] = $v('P437_AUTO_PLACING');
                ShelfInfo["AutoFillPeg"] = $v('P437_AUTO_FILL_PEG'); //ASA-1109
                ShelfInfo["LOverhang"] = $v('P437_LEFT_OVERHANG');
                ShelfInfo["ROverhang"] = $v('P437_RIGHT_OVERHANG');
                ShelfInfo["UOverHang"] = $v('P437_UPPER_OVERHANG');
                ShelfInfo["FrontOverHang"] = $v('P437_FRONT_OVERHANG');
                ShelfInfo["LoOverHang"] = $v('P437_LOWER_OVERHANG');
                ShelfInfo["BackOverHang"] = $v('P437_BACK_OVERHANG');
                ShelfInfo["SpacerThick"] = $v('P437_SPACER_THICKNESS');
                ShelfInfo["Combine"] = $v('P437_COMBINE');
                ShelfInfo["BsktFill"] = $v('P437_BASKET_FILL');
                ShelfInfo["BsktSpreadProduct"] = $v('P437_SPREAD_PRODUCT_BASKET');
                ShelfInfo["SnapTo"] = $v('P437_SNAP_TO_SHELF');
                ShelfInfo["BsktWallH"] = $v('P437_WALL_HEIGHT');
                ShelfInfo["W"] = $v('P437_WIDTH');
                ShelfInfo["D"] = $v('P437_DEPTH');
                ShelfInfo["LiveImage"] = '';
                ShelfInfo["BsktWallThickness"] = $v('P437_WALL_THICKNESS');
                ShelfInfo["Rotation"] = $v('P437_ROTATION');
                ShelfInfo["Slope"] = $v('P437_SHELF_SLOPE');
                ShelfInfo["HorizSlotStart"] = $v('P437_HORIZ_SLOT_START');
                ShelfInfo["HorizSlotSpacing"] = $v('P437_HORIZ_SLOT_SPACING');
                ShelfInfo["DSlotStart"] = $v('P437_DEPTH_SLOT_START');
                ShelfInfo["DSlotSpacing"] = $v('P437_DEPTH_SLOT_SPACING');
                ShelfInfo["ObjType"] = $v('P437_OBJECT_TYPE');
                if (ShelfInfo["NoDivIDShow"] !== $v('P437_NO_DIV_ID_DISP') || $v('P437_DIV_HEIGHT') / 100 !== ShelfInfo["DivHeight"] || $v('P437_DIV_WIDTH') / 100 !== ShelfInfo["DivWidth"] || ShelfInfo["DivPst"] !== $v('P437_PLACE_START_DIV') || ShelfInfo["DivPed"] !== $v('P437_PLACE_END_DIV') || ShelfInfo["DivPbtwFace"] !== $v('P437_PLACE_DIV_BTW_FACING') || ShelfInfo["DivFillCol"] !== $v('P437_DIV_FILL_COLOR')) { //Task_27734
                    ShelfInfo["DivCreated"] = "Y";
                } else {
                    ShelfInfo["DivCreated"] = "N";
                }
                ShelfInfo["DivHeight"] = $v('P437_DIV_HEIGHT'); //ASA-1265
                ShelfInfo["DivWidth"] = $v('P437_DIV_WIDTH'); //ASA-1265
                ShelfInfo["DivPst"] = $v('P437_PLACE_START_DIV'); //ASA-1265
                ShelfInfo["DivPed"] = $v('P437_PLACE_END_DIV'); //ASA-1265
                ShelfInfo["DivPbtwFace"] = $v('P437_PLACE_DIV_BTW_FACING'); //ASA-1265
                ShelfInfo["DivStX"] = $v('P437_DIV_START_X'); //ASA-1265
                ShelfInfo["DivSpaceX"] = $v('P437_DIV_SPACE_X'); //ASA-1265
                ShelfInfo["DivFillCol"] = $v('P437_DIV_FILL_COLOR'); //ASA-1265
                ShelfInfo["NoDivIDShow"] = $v('P437_NO_DIV_ID_DISP'); //ASA-1406
                ShelfInfo["Color"] = $v('P437_COLOR');
                ShelfInfo["FBold"] = '';
                ShelfInfo["TextImg"] = '';
                ShelfInfo["TextImgName"] = '';
                ShelfInfo["TextImgMime"] = '';
                ShelfInfo["OldObjID"] = OldObjID;
                // ShelfInfo["AvlSpace"] = ShelfInfo["W"] + ShelfInfo["LOverhang"] + ShelfInfo["ROverhang"]; //ASA-2049
                ShelfInfo["AvlSpace"] = wpdSetFixed((Number(ShelfInfo["W"]) || 0) + (Number(ShelfInfo["LOverhang"]) || 0) + (Number(ShelfInfo["ROverhang"]) || 0));
                l_shelf_details.push(ShelfInfo);
                sessionStorage.setItem('shelf_details', JSON.stringify(l_shelf_details));
                ["pog_json", "current_shelf_index", "current_module_index"].forEach(sessionStorage.removeItem.bind(sessionStorage)); //ASA-1964.2
                apex.submit('SAVE');
            }
        } catch (err) {
            error_handling(err);
        }
    }

}
//ASA-1471 S
function checkValueConsistency(pArray, pKey, pValue) {
    if (pArray.length === 0)
        return false;
    var shelfArray = pArray.filter(pArray => pArray.Object == 'SHELF')
    var firstValue = nvl(shelfArray[0][pKey]);
    firstValue = isNaN(firstValue) ? firstValue.toUpperCase() : firstValue;
    for (item of shelfArray) {
        //ASA-1471 issue 9 S
        if (item.Item !== "DIVIDER") {
            var itemValue = nvl(item[pKey]);
            itemValue = isNaN(itemValue) ? itemValue.toUpperCase() : itemValue;
            if (!(firstValue == itemValue && ((itemValue == pValue && nvl(pValue) !== 0) || nvl(pValue) == 0))) {
                return false;
            }
        }
        //ASA-1471 issue 9 E
    }
    return true;
}
function setIconForInconsistentTag(pArray, p_json_tag, p_page_item, p_null_value = "") {
    if (!checkValueConsistency(pArray, p_json_tag)) {
        $('#' + p_page_item + '_CONTAINER').addClass('apex-item-wrapper--has-icon');
        $('#' + p_page_item).addClass('apex-item-has-icon');
        //ASA-1471 issue 15 S
        if (p_page_item == 'P437_PLACE_START_DIV' || p_page_item == 'P437_PLACE_END_DIV' || p_page_item == 'P437_PLACE_DIV_BTW_FACING' || p_page_item == 'P437_NO_DIV_ID_DISP') {
            $('#' + p_page_item + '_LABEL').after('<span class="fa fa-exclamation-triangle-o" aria-hidden="true"></span>');
        } else {
            $('#' + p_page_item).after('<span class="apex-item-icon fa fa-exclamation-triangle-o" aria-hidden="true"></span>');
        }
        //ASA-1471 issue 15 E
        //ASA-1471 issue 17 S
        if (p_json_tag == "DivWidth") {
            l_shelf_details.DivWChng = "N";
        } else if (p_json_tag == "DivHeight") {
            l_shelf_details.DivHChng = "N";
        }
        $s(p_page_item, p_null_value);

        //ASA-1471 issue 17 E
    } else {
        var shelfArray = pArray.filter(pArray => pArray.Object == 'SHELF')
        var firstValue = shelfArray[0][p_json_tag];
        if ((p_page_item == 'P437_WIDTH' || p_page_item == 'P437_HEIGHT' || p_page_item == 'P437_DEPTH' || p_page_item == 'P437_DIV_HEIGHT' || p_page_item == 'P437_DIV_WIDTH' || p_page_item == 'P437_MAX_MERCH' || p_page_item == 'P437_LEFT_OVERHANG' || p_page_item == 'P437_RIGHT_OVERHANG')) { //ASA-1471 issue 3 //ASA-1471 issue 8
            firstValue = (firstValue * 100).toFixed(2);
        }
        $s(p_page_item, firstValue);
    }
}
//ASA-1471 E
