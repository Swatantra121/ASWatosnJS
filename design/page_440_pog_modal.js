var l_poginfo = [];
var oldBnrTxt;
var g_templ_info_success = get_message('POGCR_SAVE_MSG');
var g_innerDimension = [];
var g_fixtureW, g_fixtureH, g_fixtureD;

l_poginfo = sessionStorage.getItem("openpogjson") !== null ? JSON.parse(sessionStorage.getItem("openpogjson")) : [];
if (sessionStorage.getItem("openpogjson") !== null) {
    apex.item('P440_MULTI_EDIT').setValue(l_poginfo[0].MultiEdit);
}

sessionStorage.removeItem("openpogjson");
sessionStorage.removeItem("fixtureDimension");//ASA-1694
sessionStorage.removeItem("isPOGTemplate");//ASA-1694

//ASA-1694
function calculateFixtureDimensions(pFixtureCount = -1) {
    try {
        var fixtureCodes = ':' + $v('P440_FIXTURE_CODE_TML') + ':';
        var fixtureCodesCount = $v('P440_FIXTURE_CODE_TML').split(':').length;
        var [widthBuffer, heightBuffer, depthBuffer] = $v('P440_POGCR_POG_FIXR_THRESHOLD').split(":").map(Number);
        apex.server.process(
            "GET_DIMENSION_JSON", {
            x01: fixtureCodes,
            x02: fixtureCodesCount,
            x03: widthBuffer,
            x04: heightBuffer,
            x05: depthBuffer
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) !== "") {
                    g_innerDimension = JSON.parse($.trim(pData));
                    if(pFixtureCount !== -1){
                        for (var i = 1; i < pFixtureCount; i++) {
                            g_innerDimension.push(g_innerDimension[0]);
                        }
                    }
                    g_fixtureW = g_innerDimension.reduce((f, dim) => f + dim.InnerWidth, 0);
                    g_fixtureH = g_innerDimension.reduce((max, dim) => Math.max(max, dim.InnerHeight), -Infinity);
                    g_fixtureD = g_innerDimension.reduce((max, dim) => Math.max(max, dim.InnerDepth), -Infinity);
                    g_fixtureW = g_fixtureW/10;  //ASA-1694 #8
                    g_fixtureH = g_fixtureH/10;  //ASA-1694 #8
                    g_fixtureD = g_fixtureD/10;  //ASA-1694 #8
                    apex.item('P440_POG_WIDTH').setValue(g_fixtureW);
                    apex.item('P440_POG_BASE_WIDTH').setValue(g_fixtureW);
                    apex.item('P440_POG_HEIGHT').setValue(g_fixtureH);
                    apex.item('P440_POG_DEPTH').setValue(g_fixtureD);
                    apex.item('P440_POG_SEGMENT_WIDTH').setValue(parseFloat((g_fixtureW/g_innerDimension.length).toFixed(2)));       //ASA-1694 #11
                }
            }
        });
    } catch (err) {
        error_handling(err);
    }
}


function setFields() {
    try {
        if ($v('P440_FLEX_TEXT_1_REQ') == 'Y') {
            $('#P440_COL_FLEX_TEXT_1_CONTAINER').addClass('is-required');
        }
        if ($v('P440_FLEX_TEXT_2_REQ') == 'Y') {
            $('#P440_COL_FLEX_TEXT_2_CONTAINER').addClass('is-required');
        }
        if ($v('P440_FLEX_TEXT_3_REQ') == 'Y') {
            $('#P440_COL_FLEX_TEXT_3_CONTAINER').addClass('is-required');
        }
        if ($v('P440_FLEX_TEXT_4_REQ') == 'Y') {
            $('#P440_COL_FLEX_TEXT_4_CONTAINER').addClass('is-required');
        }

        if (l_poginfo.length == 0) {
            $("#SR_BASIC_INFO_tab a").trigger("click");
            $('#DELETE_POG').css('display', 'none');
            $s('P440_POG_CODE', '');
            $s('P440_POG_VERSION', '');
            $s('P440_POG_NAME', '');
            $s('P440_POG_TYPE', '');
            $s('P440_POG_HEIGHT', 0);
            $s('P440_POG_SEGMENT_WIDTH', 0);
            $s('P440_POG_WIDTH', 0);
            $s('P440_POG_DEPTH', 0);
            $s('P440_BACK_DEPTH', 1);
            $s('P440_TRAFFIC_FLOW', 'LR');
            $s('P440_POG_BASE_HEIGHT', 0);
            $s('P440_POG_BASE_WIDTH', 0);
            $s('P440_POG_BASE_DEPTH', 0);
            $s('P440_POG_NOTCH_WIDTH', 0);
            $s('P440_POG_NOTCH_START', 0);
            $s('P440_POG_NOTCH_SPACING', 0);
            $s('P440_POG_COLOR', '#A69FA6');
            $s('P440_HORZ_START', 0);
            $s('P440_HORZ_SPACING', 0);
            $s('P440_POG_VERT_START', 0);
            $s('P440_POG_VERT_SPACING', 0);
            document.getElementById("P440_ALLOW_OVER_Y").removeAttribute("checked");
            $('#P440_ALLOW_OVER_N').attr("checked", "checked");
            $s('P440_SPECIAL_TYPE', '');
            $s('P440_SPECIAL_TYPE_DESC', '');
            $s('P440_DISPLAY_METERAGE', '');
            $s('P440_RPT_METERAGE', '');
            if ($v('P440_POG_EFFECTIVE_START_DATE_UPD') === 'Y' && $v('P440_POG_EFF_START_DATE_UPDATE') === 'Y') {  //garit
                let newDate = moment($v('P440_VDATE'), 'YYYYMMDD')
                    .add(1, 'day')
                    .format(get_js_date_format());
                    apex.item('P440_EFF_START_DATE').setValue(newDate);
                } else {
                    $s('P440_EFF_START_DATE', moment($v('P440_VDATE'), 'YYYYMMDD').format(get_js_date_format()));
                }            
            $s('P440_BRAND_GROUP_ID', '');
            $s('P440_REMARKS', '');
            $s('P440_STORE_SEGMENT', '');
            $s('P440_STORE_SEGMENT_TML', '');//ASA-1694
            $s('P440_DESC_7', '');
            $s('P440_POG_DIVISION', '');
            $s('P440_FIXTURE_GENERATION', '');
            $s('P440_FIXTURE_GENERATION_TML', '');//ASA-1694
            $s('P440_FIXTURE_COUNT_TML', '');//ASA-1694
            $s('P440_COL_FLEX_LOV_1', '');
            $s('P440_COL_FLEX_LOV_2', '');
            $s('P440_COL_FLEX_LOV_3', '');
            $s('P440_COL_FLEX_LOV_4', '');
            $s('P440_COL_FLEX_LOV_5', '');
            $s('P440_COL_FLEX_LOV_6', '');
            $s('P440_PROMOTION_START_DATE', ''); // ASA-1202
            $s('P440_PROMOTION_END_DATE', ''); // ASA-1202
            $s('P440_PROMOTION_NAME', ''); // ASA-1202
            $s('P440_PDF_TEMPLATE', ''); // ASA-1876
            $s('P440_FIXTURE_GROUP', ''); // ASA-1990 Req 3
            $s('P440_STORE_FORMAT', ''); // ASA-1990 Req 3
            $s('P440_COMPARE_POG_VERSION', ''); //ASA-2009
        

        } else {
            if ($v('P440_MULTI_EDIT') == 'Y') {
                //disable filds
                $('#CUSTOM_COLOR_POG').css('display', 'none');
                $('#P440_POG_CODE').addClass('apex_disabled');
                $('#P440_POG_VERSION').addClass('apex_disabled');
                $('#P440_POG_NAME').addClass('apex_disabled');
                $('#P440_POG_TYPE').addClass('apex_disabled');
                $('#P440_POG_WIDTH').addClass('apex_disabled');
                $('#P440_POG_DEPTH').addClass('apex_disabled');
                $('#P440_BACK_DEPTH').addClass('apex_disabled');
                $('#P440_POG_SEGMENT_WIDTH').addClass('apex_disabled');
                $('#P440_TRAFFIC_FLOW').addClass('apex_disabled');
                $('#P440_POG_BASE_HEIGHT').addClass('apex_disabled');
                $('#P440_POG_BASE_WIDTH').addClass('apex_disabled');
                $('#P440_POG_BASE_DEPTH').addClass('apex_disabled');
                $('#P440_POG_NOTCH_WIDTH').addClass('apex_disabled');
                $('#P440_POG_NOTCH_START').addClass('apex_disabled');
                $('#P440_POG_NOTCH_SPACING').addClass('apex_disabled');
                $('#P440_POG_COLOR_CONTAINER').addClass('apex_disabled');
                $('#P440_HORZ_START').addClass('apex_disabled');
                $('#P440_HORZ_SPACING').addClass('apex_disabled');
                $('#P440_POG_VERT_START').addClass('apex_disabled');
                $('#P440_POG_VERT_SPACING').addClass('apex_disabled');
                $('#P440_ALLOW_OVER').addClass('apex_disabled');
                $('#P440_SPECIAL_TYPE').addClass('apex_disabled');
                $('#P440_SPECIAL_TYPE_DESC').addClass('apex_disabled');
                $('#P440_DISPLAY_METERAGE').addClass('apex_disabled');
                $('#P440_RPT_METERAGE').addClass('apex_disabled');
                $('#P440_EFF_START_DATE').addClass('apex_disabled');
                $('#P440_BRAND_GROUP_ID').addClass('apex_disabled');
                $('#P440_REMARKS').addClass('apex_disabled');
                $('#P440_STORE_SEGMENT').addClass('apex_disabled');
                $('#P440_STORE_SEGMENT_TML').addClass('apex_disabled');//ASA-1694
                $('#P440_DESC_7').addClass('apex_disabled');
                $('#P440_AREA').addClass('apex_disabled');
                $('#P440_PLN_DEPT').addClass('apex_disabled');
                $('#P440_POG_HEIGHT').addClass('apex_disabled');
                $('#P440_POG_SUBDEPT').addClass('apex_disabled');
                $('#P440_POG_DEPT').addClass('apex_disabled');
                $('#P440_POG_DIVISION').addClass('apex_disabled');
                $('#P440_FIXTURE_GENERATION').addClass('apex_disabled');
                $('#P440_FIXTURE_FAMILY_CONTAINER').addClass('apex_disabled');
                $('#P440_FIXTURE_TYPE_CONTAINER').addClass('apex_disabled');
                $('#P440_FIXTURE_CODE_CONTAINER').addClass('apex_disabled');//ASA-1694
                $('#P440_FIXTURE_FAMILY_CONTAINER_TML').addClass('apex_disabled');//ASA-169
                $('#P440_FIXTURE_TYPE_CONTAINER_TML').addClass('apex_disabled');//ASA-169
                $('#P440_FIXTURE_CODE_CONTAINER_TML').addClass('apex_disabled');//ASA-1694
                $('#P440_FIXTURE_COUNT_TML_CONTAINER').addClass('apex_disabled');//ASA-1694
                $('#P440_EFF_START_DATE').addClass('apex_disabled');
                $('#P440_PROMOTION_START_DATE').addClass('apex_disabled'); // ASA-1202
                $('#P440_PROMOTION_END_DATE').addClass('apex_disabled'); // ASA-1202
                $('#P440_PROMOTION_NAME').addClass('apex_disabled'); // ASA-1202    
                $('#P440_PDF_TEMPLATE').addClass('apex_disabled'); // ASA-1876  
                $('#P440_FIXTURE_GROUP').addClass('apex_disabled'); // ASA-1990 Req 3   
                $('#P440_STORE_FORMAT').addClass('apex_disabled'); // ASA-1990 Req 3    
                $('#P440_COMPARE_POG_VERSION').addClass('apex_disabled'); //ASA-2009   


                //set value
                apex.item('P440_POG_CODE').setValue('');
                apex.item('P440_POG_VERSION').setValue('');
                apex.item('P440_POG_NAME').setValue('Mixed');
                apex.item('P440_POG_TYPE').setValue('Mixed');
                apex.item('P440_POG_WIDTH').setValue(0);
                apex.item('P440_POG_DEPTH').setValue(0);
                apex.item('P440_BACK_DEPTH').setValue(0);
                apex.item('P440_POG_SEGMENT_WIDTH').setValue(0);
                apex.item('P440_TRAFFIC_FLOW').setValue('');
                apex.item('P440_POG_BASE_HEIGHT').setValue(0);
                apex.item('P440_POG_BASE_WIDTH').setValue(0);
                apex.item('P440_POG_BASE_DEPTH').setValue(0);
                apex.item('P440_POG_NOTCH_WIDTH').setValue(0);
                apex.item('P440_POG_NOTCH_START').setValue(0);
                apex.item('P440_POG_NOTCH_SPACING').setValue(0);
                apex.item('P440_POG_COLOR').setValue('');
                apex.item('P440_HORZ_START').setValue('');
                apex.item('P440_HORZ_SPACING').setValue('');
                apex.item('P440_POG_VERT_START').setValue('');
                apex.item('P440_POG_VERT_SPACING').setValue('');
                document.getElementById("P440_ALLOW_OVER_Y").removeAttribute("checked");
                $('#P440_ALLOW_OVER_N').attr("checked", "checked");
                apex.item('P440_SPECIAL_TYPE').setValue('');
                apex.item('P440_SPECIAL_TYPE_DESC').setValue('');
                apex.item('P440_DISPLAY_METERAGE').setValue('');
                apex.item('P440_RPT_METERAGE').setValue('');
                apex.item('P440_EFF_START_DATE').setValue('');
                apex.item('P440_BRAND_GROUP_ID').setValue('');
                apex.item('P440_REMARKS').setValue('');
                apex.item('P440_STORE_SEGMENT').setValue('');
                apex.item('P440_STORE_SEGMENT_TML').setValue('');//ASA-1694
                apex.item('P440_DESC_7').setValue('');
                apex.item('P440_AREA').setValue('');
                apex.item('P440_PLN_DEPT').setValue('');
                apex.item('P440_POG_HEIGHT').setValue(0);
                apex.item('P440_POG_SUBDEPT').setValue('');
                apex.item('P440_POG_DEPT').setValue('');
                apex.item('P440_POG_DIVISION').setValue('');
                apex.item('P440_FIXTURE_GENERATION').setValue('');
                apex.item('P440_FIXTURE_FAMILY').setValue('');
                apex.item('P440_FIXTURE_TYPE').setValue('');
                apex.item('P440_FIXTURE_CODE').setValue('');//ASA-1694
                apex.item('P440_FIXTURE_GENERATION_TML').setValue('');//ASA-1694
                apex.item('P440_FIXTURE_FAMILY_TML').setValue('');//ASA-1694
                apex.item('P440_FIXTURE_TYPE_TML').setValue('');//ASA-1694
                apex.item('P440_FIXTURE_CODE_TML').setValue('');//ASA-1694
                apex.item('P440_FIXTURE_COUNT_TML').setValue('');//ASA-1694
                apex.item('P440_PROMOTION_START_DATE').setValue(''); // ASA-1202
                apex.item('P440_PROMOTION_END_DATE').setValue(''); // ASA-1202
                apex.item('P440_PROMOTION_NAME').setValue(''); // ASA-1202
                apex.item('P440_PDF_TEMPLATE').setValue(''); // ASA-1876
                apex.item('P440_FIXTURE_GROUP').setValue(''); // ASA-1990 Req 3
                apex.item('P440_STORE_FORMAT').setValue('');  // ASA-1990 Req 3
                apex.item('P440_COMPARE_POG_VERSION').setValue(''); //ASA-2009
              

            } else {
                $('#CUSTOM_COLOR_POG').css('display', 'block');
                apex.item('P440_POG_CODE').setValue(l_poginfo[0].POGCode);
                apex.item('P440_POG_VERSION').setValue(l_poginfo[0].Version);
                apex.item('P440_POG_NAME').setValue(l_poginfo[0].Name);
                apex.item('P440_POG_TYPE').setValue(l_poginfo[0].Type);
                apex.item('P440_POG_WIDTH').setValue(l_poginfo[0].PogWidth);
                apex.item('P440_POG_DEPTH').setValue(l_poginfo[0].PogDepth);
                apex.item('P440_BACK_DEPTH').setValue(l_poginfo[0].BackDepth);
                apex.item('P440_POG_SEGMENT_WIDTH').setValue(l_poginfo[0].PogSegmentWidth);
                apex.item('P440_TRAFFIC_FLOW').setValue(l_poginfo[0].TrafficFlow);
                apex.item('P440_POG_BASE_HEIGHT').setValue(l_poginfo[0].BaseH);
                apex.item('P440_POG_BASE_WIDTH').setValue(l_poginfo[0].BaseW);
                apex.item('P440_POG_BASE_DEPTH').setValue(l_poginfo[0].BaseD);
                apex.item('P440_POG_NOTCH_WIDTH').setValue(l_poginfo[0].NotchW);
                apex.item('P440_POG_NOTCH_START').setValue(l_poginfo[0].NotchStart);
                apex.item('P440_POG_NOTCH_SPACING').setValue(l_poginfo[0].NotchSpacing);
                apex.item('P440_POG_COLOR').setValue(l_poginfo[0].Color);
                apex.item('P440_HORZ_START').setValue(l_poginfo[0].HorzStart);
                apex.item('P440_HORZ_SPACING').setValue(l_poginfo[0].HorzSpacing);
                apex.item('P440_POG_VERT_START').setValue(l_poginfo[0].VertStart);
                apex.item('P440_POG_VERT_SPACING').setValue(l_poginfo[0].VertSpacing);
                if (l_poginfo[0].AllowOverlap == 'Y') {
                    document.getElementById("P440_ALLOW_OVER_N").removeAttribute("checked");
                    $('#P440_ALLOW_OVER_Y').attr("checked", "checked");
                } else {
                    document.getElementById("P440_ALLOW_OVER_Y").removeAttribute("checked");
                    $('#P440_ALLOW_OVER_N').attr("checked", "checked");
                }
                $.event.trigger("set_overlap");
                apex.item('P440_SPECIAL_TYPE').setValue(l_poginfo[0].SpecialType);
                apex.item('P440_SPECIAL_TYPE_DESC').setValue(l_poginfo[0].SpecialTypeDesc);
                apex.item('P440_DISPLAY_METERAGE').setValue(l_poginfo[0].DisplayMeterage);
                apex.item('P440_RPT_METERAGE').setValue(l_poginfo[0].RPTMeterage);
                //now using standard format of date RRRRMMDD. so need to convert it to app date.
                if ($v('P440_POG_EFFECTIVE_START_DATE_UPD') === 'Y' &&
                    $v('P440_POG_EFF_START_DATE_UPDATE') === 'Y') {        //ASA-Issue 1983 Issue 9         
                    let vdate      = moment($v('P440_VDATE'), 'YYYYMMDD');
                    let effDate    = moment(l_poginfo[0].EffStartDate, 'YYYYMMDD');                
                    let newDate;
                
                    if (effDate.isAfter(vdate)) {
                        newDate = effDate.format(get_js_date_format());
                    } else {
                        newDate = vdate.add(1, 'day').format(get_js_date_format());
                    }                
                    apex.item('P440_EFF_START_DATE').setValue(newDate);                
                } else {
                    apex.item('P440_EFF_START_DATE')
                        .setValue(moment(l_poginfo[0].EffStartDate, 'YYYYMMDD').format(get_js_date_format()));
                }
                apex.item('P440_BRAND_GROUP_ID').setValue(l_poginfo[0].BrandGroupID);
                apex.item('P440_REMARKS').setValue(l_poginfo[0].Remarks);
                if ($v('P440_NEW_TEMPLATE') == "Y") {//ASA-1694
                    apex.item('P440_STORE_SEGMENT_TML').setValue(l_poginfo[0].StoreSegment);
                } else {
                    apex.item('P440_STORE_SEGMENT').setValue(l_poginfo[0].StoreSegment);
                }
                apex.item('P440_DESC_7').setValue(l_poginfo[0].Desc7);
                apex.item('P440_AREA').setValue(l_poginfo[0].Area);
                apex.item('P440_PLN_DEPT').setValue(l_poginfo[0].PLNDept);
                apex.item('P440_POG_HEIGHT').setValue(l_poginfo[0].PogHeight);

                if ($v('P440_NEW_TEMPLATE') == "Y") {//ASA-1694
                    apex.item('P440_FIXTURE_GENERATION_TML').setValue(l_poginfo[0].FixtureGeneration);
                    if (typeof l_poginfo[0].FixtureFamily !== 'undefined') {
                        apex.item('P440_FIXTURE_FAMILY_TML').setValue(l_poginfo[0].FixtureFamily);
                        $('#P440_FIXTURE_FAMILY_TML').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                    if (typeof l_poginfo[0].FixtureType !== 'undefined' && l_poginfo[0].FixtureType !== null) {
                        apex.item('P440_FIXTURE_TYPE_TML').setValue(l_poginfo[0].FixtureType + '-' + l_poginfo[0].FixtureTypeDesc);
                        $('#P440_FIXTURE_TYPE_TML').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                    if (typeof l_poginfo[0].FixtureType !== 'undefined' && l_poginfo[0].FixtureType !== null) {
                        apex.item('P440_FIXTURE_CODE_TML').setValue(l_poginfo[0].FixtureCodes);
                        $('#P440_FIXTURE_CODE_TML').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                    if (typeof l_poginfo[0].FixtureCount !== 'undefined' && l_poginfo[0].FixtureCount !== null) {
                        apex.item('P440_FIXTURE_COUNT_TML').setValue(l_poginfo[0].FixtureCount);
                        $('#P440_FIXTURE_COUNT_TML').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                } else {
                    apex.item('P440_FIXTURE_GENERATION').setValue(l_poginfo[0].FixtureGeneration);
                    if (typeof l_poginfo[0].FixtureFamily !== 'undefined') {
                        apex.item('P440_FIXTURE_FAMILY').setValue(l_poginfo[0].FixtureFamily);
                        // $('#P440_FIXTURE_FAMILY').val(l_poginfo[0].FixtureFamily); //ASA-1694
                        $('#P440_FIXTURE_FAMILY').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                    if (typeof l_poginfo[0].FixtureType !== 'undefined' && l_poginfo[0].FixtureType !== null) {
                        apex.item('P440_FIXTURE_TYPE').setValue(l_poginfo[0].FixtureType + '-' + l_poginfo[0].FixtureTypeDesc);
                        // $('#P440_FIXTURE_TYPE').val(l_poginfo[0].FixtureType + '-' + l_poginfo[0].FixtureTypeDesc); //ASA-1694
                        $('#P440_FIXTURE_TYPE').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                    //ASA-1694
                    if (typeof l_poginfo[0].FixtureType !== 'undefined' && l_poginfo[0].FixtureType !== null) {
                        apex.item('P440_FIXTURE_CODE').setValue(l_poginfo[0].FixtureCodes);
                        // $('#P440_FIXTURE_CODE').val(l_poginfo[0].FixtureCodes);
                        $('#P440_FIXTURE_CODE').closest(".t-Form-fieldContainer--floatingLabel").addClass('is_active js-show-label');
                    }
                }

                apex.item('P440_COL_FLEX_TEXT_1').setValue(l_poginfo[0].Flex_Text_1);
                apex.item('P440_COL_FLEX_TEXT_2').setValue(l_poginfo[0].Flex_Text_2);
                apex.item('P440_COL_FLEX_TEXT_3').setValue(l_poginfo[0].Flex_Text_3);
                apex.item('P440_COL_FLEX_TEXT_4').setValue(l_poginfo[0].Flex_Text_4);
                apex.item('P440_COL_FLEX_LOV_1').setValue(l_poginfo[0].Flex_Lov_1);
                apex.item('P440_COL_FLEX_LOV_2').setValue(l_poginfo[0].Flex_Lov_2);
                apex.item('P440_COL_FLEX_LOV_3').setValue(l_poginfo[0].Flex_Lov_3);
                apex.item('P440_COL_FLEX_LOV_4').setValue(l_poginfo[0].Flex_Lov_4);
                apex.item('P440_COL_FLEX_LOV_5').setValue(l_poginfo[0].Flex_Lov_5);
                apex.item('P440_COL_FLEX_LOV_6').setValue(l_poginfo[0].Flex_Lov_6);
                apex.item('P440_CATEGORY').setValue(l_poginfo[0].Category);
                apex.item('P440_SUB_CATEOGORY').setValue(l_poginfo[0].SubCategory);
                if (l_poginfo[0].PromStartDt !== '' && l_poginfo[0].PromStartDt !== null && typeof l_poginfo[0].PromStartDt !== 'undefined') {//ASA-1350 date fix 
                    apex.item('P440_PROMOTION_START_DATE').setValue(moment(l_poginfo[0].PromStartDt, 'YYYYMMDD').format(get_js_date_format())); // ASA-1202
                }
                if (l_poginfo[0].PromEndDt !== '' && l_poginfo[0].PromEndDt !== null && typeof l_poginfo[0].PromEndDt !== 'undefined') {//ASA-1350 date fix //ASA-1929 Issue 18
                    apex.item('P440_PROMOTION_END_DATE').setValue(moment(l_poginfo[0].PromEndDt, 'YYYYMMDD').format(get_js_date_format())); // ASA-1202
                }
                apex.item('P440_PROMOTION_NAME').setValue(l_poginfo[0].PromName); // ASA-1202
                apex.item('P440_PDF_TEMPLATE').setValue(l_poginfo[0].PDFTemplateName); // ASA-1876
               apex.item('P440_COMPARE_POG_VERSION').setValue(l_poginfo[0].ComparePogVersion);//ASA-2009
                apex.item('P440_FIXTURE_GROUP').setValue(l_poginfo[0].Flex_Text_15); // ASA-1990 Req 3
                apex.item('P440_STORE_FORMAT').setValue(l_poginfo[0].StoreFormat);  // ASA-1990 Req 3
                //Start ASA-2009
            //    if (typeof l_poginfo[0].ComparePogVersion !== 'undefined' && l_poginfo[0].ComparePogVersion !== null) {
                  
            //         apex.item('P440_COMPARE_POG_VERSION').setValue(l_poginfo[0].ComparePogVersion);

            //     } else {
            //         apex.item('P440_COMPARE_POG_VERSION').setValue(''); // Set to empty if not exists
                   

            //      }
                //End ASA-2009

                //ASA-1531
                if ($v('P440_PDF_TEMPLATE_INFO_MNG') == 'Y') {
                    apex.item('P440_POG_CODES').setValue(l_poginfo[0].pog_codes);
                    apex.item('P440_BNR_TXT_ID').setValue(l_poginfo[0].Flex_Text_11);
                    apex.item('P440_BNR_IMG_ID').setValue(l_poginfo[0].Flex_Text_12);
                    apex.item('P440_INS_IMG_ID').setValue(l_poginfo[0].Flex_Text_13);
                    if (typeof l_poginfo[0].Flex_Text_11 !== 'undefined' && l_poginfo[0].Flex_Text_11 !== '') {
                        apex.server.process(
                            "GET_BANNER_TEXT", {
                            x01: l_poginfo[0].Flex_Text_11
                        }, {
                            dataType: "text",
                            success: function (pData) {
                                apex.item('P440_BNR_TXT').setValue(pData);
                                oldBnrTxt = $v('P440_BNR_TXT');
                            },
                        });
                    }
                    $s('P440_BNR_TXT_UPD_IND', 'N');
                    apex.region('banner_img').refresh();
                    apex.region('instruction_img').refresh();
                }
            }
        };

        //ASA-1507 #2 Start
        apex.item("P440_POG_NAME").setFocus();
        $('body').on('keydown', function (event) {
            if (event.keyCode == 13) {
                if (!($(event.target).parents('#P440_BNR_TXT_CONTAINER').length > 0 || $(event.target).parents('#banner_img').length > 0
                    || $(event.target).parents('#instruction_img').length > 0 || $(event.target).attr('id') == 'banner_img_sort_widget_search_field'
                    || $(event.target).attr('id') == 'instruction_img_sort_widget_search_field')) {
                    event.preventDefault();
                    $('#CREATE_POG').click();
                }
            }
        });
        //ASA-1507 #2 End

        //ASA-1694 Issue 3
        if ($v('P440_NEW_TEMPLATE') == "Y") {
            $("#P440_POG_CODE_CONTAINER .t-Form-itemRequired-marker, #P440_POG_DIVISION_CONTAINER .t-Form-itemRequired-marker, #P440_POG_DEPT_CONTAINER .t-Form-itemRequired-marker, #P440_POG_SUBDEPT_CONTAINER .t-Form-itemRequired-marker, #P440_POG_TYPE_CONTAINER .t-Form-itemRequired-marker").remove();
            $("#P440_POG_NAME_CONTAINER").parent().hide();
        }
    } catch (err) {
        error_handling(err);
    }
}

function updateFields() {
    try {
        var pogModalJson = [];
        var pogModalFields = {};
        pogModalFields['POGCode'] = $v('P440_POG_CODE');
        pogModalFields['Name'] = $v('P440_POG_NAME');
        pogModalFields['Type'] = $v('P440_POG_TYPE');
        pogModalFields['PogHeight'] = $v('P440_POG_HEIGHT');
        pogModalFields['PogSegmentWidth'] = $v('P440_POG_SEGMENT_WIDTH');
        pogModalFields['PogWidth'] = $v('P440_POG_WIDTH');
        pogModalFields['BackDepth'] = $v('P440_BACK_DEPTH');
        pogModalFields['PogDepth'] = $v('P440_POG_DEPTH');
        pogModalFields['TrafficFlow'] = $v('P440_TRAFFIC_FLOW');
        pogModalFields['BaseH'] = $v('P440_POG_BASE_HEIGHT');
        pogModalFields['BaseW'] = $v('P440_POG_BASE_WIDTH');
        pogModalFields['BaseD'] = $v('P440_POG_BASE_DEPTH');
        pogModalFields['NotchW'] = $v('P440_POG_NOTCH_WIDTH');
        pogModalFields['NotchStart'] = $v('P440_POG_NOTCH_START');
        pogModalFields['NotchSpacing'] = $v('P440_POG_NOTCH_SPACING');
        pogModalFields['Color'] = $v('P440_POG_COLOR');
        pogModalFields['HorzStart'] = $v('P440_HORZ_START');
        pogModalFields['HorzSpacing'] = $v('P440_HORZ_SPACING');
        pogModalFields['VertStart'] = $v('P440_POG_VERT_START');
        pogModalFields['VertSpacing'] = $v('P440_POG_VERT_SPACING');
        console.log('setting allowoverlap', $v('P440_ALLOW_OVER'));
        pogModalFields['AllowOverlap'] = $v('P440_ALLOW_OVER');
        pogModalFields['SpecialType'] = $v('P440_SPECIAL_TYPE');
        pogModalFields['SpecialTypeDesc'] = $v('P440_SPECIAL_TYPE_DESC');
        pogModalFields['DisplayMeterage'] = $v('P440_DISPLAY_METERAGE');
        console.log('display meterate', $v('P440_DISPLAY_METERAGE'));
        pogModalFields['RPTMeterage'] = $v('P440_RPT_METERAGE');
        if ($v('P440_EFF_START_DATE') !== '') {//ASA-1350 date fix
            pogModalFields['EffStartDate'] = moment($v('P440_EFF_START_DATE'), get_js_date_format()).format('YYYYMMDD');//$v('P440_EFF_START_DATE');
        } else {
            pogModalFields['EffStartDate'] = '';
        }
        pogModalFields['BrandGroupID'] = $v('P440_BRAND_GROUP_ID');
        pogModalFields['Remarks'] = $v('P440_REMARKS');
        pogModalFields['StoreSegment'] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_STORE_SEGMENT_TML') : $v('P440_STORE_SEGMENT');//ASA-1694
        pogModalFields['Desc7'] = $v('P440_DESC_7');
        pogModalFields['Flex_Text_1'] = $v('P440_COL_FLEX_TEXT_1');
        pogModalFields['Flex_Text_2'] = $v('P440_COL_FLEX_TEXT_2');
        pogModalFields['Flex_Text_3'] = $v('P440_COL_FLEX_TEXT_3');
        pogModalFields['Flex_Text_4'] = $v('P440_COL_FLEX_TEXT_4');
        pogModalFields['Area'] = $v('P440_AREA');
        pogModalFields['PLNDept'] = $v('P440_PLN_DEPT');
        pogModalFields['Division'] = $v('P440_POG_DIVISION');
        pogModalFields['SubDept'] = $v('P440_POG_SUBDEPT');
        pogModalFields['Dept'] = $v('P440_POG_DEPT');
        pogModalFields['FixtureFamily'] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_FIXTURE_FAMILY_TML') : $v('P440_FIXTURE_FAMILY');//ASA-1694
        pogModalFields["FixtureFamilyHidden"] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_FIXTURE_FAMILY_TML') : $v('P440_FIXTURE_FAMILY');//ASA-1694
        pogModalFields['FixtureType'] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_FIXTURE_TYPE_TML') : $v('P440_FIXTURE_TYPE');//ASA-1694
        pogModalFields['FixtureCodes'] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_FIXTURE_CODE_TML') : $v('P440_FIXTURE_CODE');//ASA-1694
        pogModalFields['FixtureCount'] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_FIXTURE_COUNT_TML') : "";//ASA-1694
        if (($v('P440_NEW_TEMPLATE') !== "Y" && $('#P440_FIXTURE_TYPE').val()) || ($v('P440_NEW_TEMPLATE') == "Y" && $('#P440_FIXTURE_TYPE_TML').val())) {
            pogModalFields["FixtureTypeDesc"] = $v('P440_NEW_TEMPLATE') == "Y" ? $('#P440_FIXTURE_TYPE_TML').val().toString().split("-")[1].trim() : $('#P440_FIXTURE_TYPE').val().toString().split("-")[1].trim();
        } else {
            pogModalFields["FixtureTypeDesc"] = '';
        }
        pogModalFields['FixtureGeneration'] = $v('P440_NEW_TEMPLATE') == "Y" ? $v('P440_FIXTURE_GENERATION_TML') : $v('P440_FIXTURE_GENERATION');
        pogModalFields['Flex_Lov_1'] = $v('P440_COL_FLEX_LOV_1');
        pogModalFields['Flex_Lov_2'] = $v('P440_COL_FLEX_LOV_2');
        pogModalFields['Flex_Lov_3'] = $v('P440_COL_FLEX_LOV_3');
        pogModalFields['Flex_Lov_4'] = $v('P440_COL_FLEX_LOV_4');
        pogModalFields['Flex_Lov_5'] = $v('P440_COL_FLEX_LOV_5');
        pogModalFields['Flex_Lov_6'] = $v('P440_COL_FLEX_LOV_6');
        if (g_fileUploadFlag == 'Y') {
            pogModalFields['fileUPloadedFlag'] = 'Y';
        } else {
            pogModalFields['fileUPloadedFlag'] = 'N';
        }
        pogModalFields['POGCode'] = $v('P440_POG_CODE');
        console.log('P440_CATEGORY', $v('P440_CATEGORY'), $v('P440_SUB_CATEGORY'));
        pogModalFields['Category'] = $v('P440_CATEGORY');
        pogModalFields['SubCategory'] = $v('P440_SUB_CATEGORY');
        if ($v('P440_PROMOTION_START_DATE') !== '') {//ASA-1350 date fix
            pogModalFields['PromStartDt'] = moment($v('P440_PROMOTION_START_DATE'), get_js_date_format()).format('YYYYMMDD');//$v('P440_PROMOTION_START_DATE');
        } else {
            pogModalFields['PromStartDt'] = '';
        }
        if ($v('P440_PROMOTION_END_DATE') !== '') {//ASA-1350 date fix
            pogModalFields['PromEndDt'] = moment($v('P440_PROMOTION_END_DATE'), get_js_date_format()).format('YYYYMMDD');//$v('P440_PROMOTION_END_DATE');
        } else {
            pogModalFields['PromEndDt'] = '';
        }
        //pogModalFields['PromStartDt'] = $v('P440_PROMOTION_START_DATE'); //ASA-1202//ASA-1350 date fix
        //pogModalFields['PromEndDt'] = $v('P440_PROMOTION_END_DATE'); //ASA-1202//ASA-1350 date fix
        pogModalFields['PromName'] = $v('P440_PROMOTION_NAME'); //ASA-1202
        pogModalFields['PDFTemplateName'] = $v('P440_PDF_TEMPLATE'); //ASA-1876
        pogModalFields['Flex_Text_15'] = $v('P440_FIXTURE_GROUP');  // ASA-1990 Req 3
        pogModalFields['StoreFormat'] = $v('P440_STORE_FORMAT');    // ASA-1990 Req 3
        pogModalFields['ComparePogVersion'] = $v('P440_COMPARE_POG_VERSION');  //ASA-2009
        pogModalFields["pog_recreate"] = $v('P440_POG_RECREATE');//ASA-1250
    


        if ($v("P440_MULTI_EDIT") == "Y") {
            pogModalFields['MultiEdit'] = "Y";
        } else {
            pogModalFields['MultiEdit'] = "N";
        }

        //ASA-1531 Issue 11
        if ($v('P440_PDF_TEMPLATE_INFO_MNG') == 'Y') {
            // var bnrImgId = '', insImgId = '';
            // var grid = apex.region("banner_img").widget().interactiveGrid("getViews", "grid");
            // var selectedRecords = grid.view$.grid("getSelectedRecords");
            // if (selectedRecords.length > 0) {
            //     bnrImgId = parseInt(grid.model.getValue(selectedRecords[0], "KEY_ID"));
            // }

            // var grid = apex.region("instruction_img").widget().interactiveGrid("getViews", "grid");
            // var selectedRecords = grid.view$.grid("getSelectedRecords");
            // if (selectedRecords.length > 0) {
            //     insImgId = parseInt(grid.model.getValue(selectedRecords[0], "KEY_ID"));
            // }
            var bnrImgId = [], insImgId = [];

            $(".banner_img_chkbx:checked").each(function () {
                bnrImgId.push($(this).attr("key-id"));
            });
            $(".ins_img_chkbx:checked").each(function () {
                insImgId.push($(this).attr("key-id"));
            });

            pogModalFields["Flex_Text_11"] = $v('P440_BNR_TXT_ID');
            pogModalFields["Flex_Text_12"] = bnrImgId[0];
            pogModalFields["Flex_Text_13"] = insImgId[0];
        }
        pogModalJson.push(pogModalFields);
        //ASA-1694
        if ($v('P440_NEW_TEMPLATE') == "Y") {
            sessionStorage.setItem("isPOGTemplate", "Y");
        } else {
            sessionStorage.setItem("isPOGTemplate", "N");
        }
        var fixtureCount = nvl($v('P440_FIXTURE_COUNT_TML'));
        if (g_innerDimension.length == 1) {
            for (var i = 1; i < fixtureCount; i++) {
                g_innerDimension.push(g_innerDimension[0]);
            }
        }
        sessionStorage.setItem("fixtureDimension", JSON.stringify(g_innerDimension));

        sessionStorage.setItem("openpogjson", JSON.stringify(pogModalJson));


        apex.submit('CREATE_POG');
    } catch (err) {
        error_handling(err);
    }

};
function validatePogFields() {
    try {
        var edited = $v('P440_POG_EDIT_IND');
        var edit_base = 'N',
            pog_recreate = 'N',
            edited_pogcode;
        if (typeof l_poginfo !== 'undefined' && l_poginfo.length > 0) {
            edited_pogcode = l_poginfo[0].POGCode;
            edited = "Y";
            if (l_poginfo[0].BaseWidth !== (parseFloat($v('P440_POG_BASE_WIDTH')) / 100) || l_poginfo[0].BaseH !== (parseFloat($v('P440_POG_BASE_HEIGHT')) / 100)) {
                edit_base = 'Y'
            }
        } else {
            l_poginfo = [];
            edited = "N";
        }

        apex.server.process
            (
                'POG_CODE_DUP_CHECK', {
                x01: $v('P440_POG_CODE')
            }, {
                dataType: 'text',
                async: true,
                success: function (pData) {
                    if ($.trim(pData) != '') {
                        // if (($.trim(pData) == 'Y' && edited == 'N') || (edited == 'Y' && $.trim(pData) == 'Y' && edited_pogcode !== undefined && edited_pogcode !== $v('P440_POG_CODE'))) { //ASA-1465
                        if (($.trim(pData) == 'Y' && edited == 'N' && $v('P440_POGCR_SAVE_DUP_POG_ID') == 'N') || (edited == 'Y' && $.trim(pData) == 'Y' && edited_pogcode !== undefined && edited_pogcode !== $v('P440_POG_CODE') && $v('P440_POGCR_SAVE_DUP_POG_ID') == 'N')) { //ASA-1465 
                            alert(get_message('POG_CODE_DUP_CHECK'));
                        } else {
                            if (($.trim(pData) == 'Y' && edited == 'N' && $v('P440_POGCR_SAVE_DUP_POG_ID') == 'Y') || (edited == 'Y' && $.trim(pData) == 'Y' && edited_pogcode !== undefined && edited_pogcode !== $v('P440_POG_CODE') && $v('P440_POGCR_SAVE_DUP_POG_ID') == 'Y')) { //ASA-1465
                                // alert(get_message('POG_CODE_DUP_CHECK')); //ASA-1465

                                //Task_29818 - Start
                                // ax_message.set({   //ASA-1465 Issue 1 S
                                //     labels: {
                                //         ok: get_message("SHCT_YES"),
                                //         cancel: get_message("SHCT_NO"),
                                //     }
                                // });

                                // ax_message.set({
                                //     buttonReverse: true
                                // });
                                // ax_message.confirm(get_message('POGCR_SAVE_ON_DUP_POGID'), function (e) {
                                //     if (e) {
                                //         if (parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 > parseFloat($v('P440_POG_WIDTH')) / 100) {
                                //             alert(get_message('SEGMENT_WIDTH_GREATER'));
                                //         } else if ($v('P440_POG_CODE').length > parseInt($v('P440_MAX_POG_CODE_LENGTH'))) {
                                //             alert(get_message('MAX_POG_CODE_LENGTH', $v('P440_MAX_POG_CODE_LENGTH')));
                                //         } else if ($v('P440_POG_CODE') == '' || $v('P440_POG_DIVISION') == '' || $v('P440_POG_DEPT') == '' || $v('P440_POG_TYPE') == '' || $v('P440_POG_WIDTH') == '' || $v('P440_POG_HEIGHT') == '' || $v('P440_POG_DEPTH') == '' || $v('P440_BACK_DEPTH') == ''
                                //             || $v('P440_POG_SEGMENT_WIDTH') == '' || $v('P440_POG_SUBDEPT') == '' || $v('P440_POG_CODE') == '' || $v('P440_POG_COLOR') == '') {
                                //             alert(get_message('ENTER_MANDATORY_FIELDS'));
                                //         } else if (parseFloat($v('P440_HORZ_START')) / 100 >= (parseFloat($v('P440_POG_WIDTH')) / 100) - ((parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100) * 2)) {
                                //             alert(get_message('HORZ_START_LESS_THAN_WIDTH'));
                                //         } else if (parseFloat($v('P440_POG_VERT_START')) / 100 > (parseFloat($v('P440_POG_HEIGHT')) / 100)) {
                                //             alert(get_message('VERT_START_LESS_THAN_HEIGHT'));
                                //         } else if ($v('P440_POG_HEIGHT') == 0) {
                                //             alert(get_message('HEIGHT_GRT_THAN_ZERO'))
                                //         } else if ($v('P440_POG_WIDTH') == 0) {
                                //             alert(get_message('WIDTH_GRT_THAN_ZERO'))
                                //         } else if ($v('P440_POG_DEPTH') == 0) {
                                //             alert(get_message('DEPTH_GRT_THAN_ZERO'))
                                //         } else if ($v('P440_BACK_DEPTH') == 0) {
                                //             alert(get_message('BACK_DEPTH_GRT_THAN_ZERO'))
                                //         } else if ($v('P440_BACK_DEPTH') < 1) {
                                //             alert(get_message('BACK_DEPTH_NOT_LESS_THAN_ONE'))
                                //         } else if ($v('P440_EFF_START_DATE') !== '' && new Date($v('P440_EFF_START_DATE')).getTime() < new Date($.trim(get_global_ind_values('AI_APPLICATION_DATE'))).getTime()) {
                                //             alert(get_message('EFF_DATE_LESS_THAN_VDATE'));
                                //         } else if (parseFloat($v('P440_POG_SEGMENT_WIDTH')) == 0) {
                                //             alert(get_message('SEGMENT_WIDTH_GRT_ZERO'));
                                //         } else if (parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100 > 0 && parseFloat($v('P440_POG_NOTCH_SPACING')) == 0) {
                                //             alert(get_message('NOTCH_SPACE_NEEDED'));
                                //         } else if (parseFloat($v('P440_POG_BASE_HEIGHT')) > 0 && parseFloat($v('P440_POG_BASE_WIDTH')) == 0) {
                                //             alert(get_message('BASE_WDT_GRT_ZERO'));
                                //         } else if (parseFloat($v('P440_POG_BASE_WIDTH')) > 0 && parseFloat($v('P440_POG_BASE_HEIGHT')) == 0) {
                                //             alert(get_message('BASE_HGT_GRT_ZERO'));
                                //         } else if ((parseFloat($v('P440_POG_BASE_WIDTH')) > 0 || parseFloat($v('P440_POG_BASE_HEIGHT')) > 0) && parseFloat($v('P440_POG_BASE_DEPTH')) == 0) {
                                //             alert(get_message('BASE_DEPT_GRT_ZERO'));
                                //         } else if (parseFloat($v('P440_POG_BASE_HEIGHT')) > 0 && parseFloat($v('P440_POG_BASE_HEIGHT')) > parseFloat($v('P440_POG_HEIGHT'))) {
                                //             alert(get_message('BASE_HGT_GRT_POG_HGT'));
                                //         } else if (($v('P440_FLEX_TEXT_1') !== '' && $v('P440_FLEX_TEXT_1_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_1') == '') || ($v('P440_FLEX_TEXT_2') !== '' && $v('P440_FLEX_TEXT_2_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_2') == '') || ($v('P440_FLEX_TEXT_3') !== '' && $v('P440_FLEX_TEXT_3_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_3') == '') || ($v('P440_FLEX_TEXT_4') !== '' && $v('P440_FLEX_TEXT_4_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_4') == '')) {
                                //             alert(get_message('ENTER_MANDATORY_FIELDS'));
                                //         } else if (parseFloat($v('P440_POG_HEIGHT')) / 100 < l_poginfo['PogHeight'] || parseFloat($v('P440_POG_WIDTH')) / 100 < l_poginfo['PogWidth'] || parseFloat($v('P440_POG_DEPTH')) / 100 < l_poginfo['PogDepth'] || parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 < l_poginfo['PogSegmentWidth']) {
                                //             alert('Decreasing dimensions are not allowed');
                                //         } else {
                                //             if (edited == 'Y') {
                                //                 if ((parseFloat(l_poginfo[0].W) / 100 !== parseFloat($v('P440_POG_WIDTH')) / 100 || parseFloat(l_poginfo[0].H) / 100 !== parseFloat($v('P440_POG_HEIGHT')) / 100 || parseFloat(l_poginfo[0].SegmentW) / 100 !== parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 || (l_poginfo[0].Color).toUpperCase() !== ($v('P440_POG_COLOR')).toUpperCase() || parseFloat(l_poginfo[0].NotchW) / 100 !== parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100 || parseFloat(l_poginfo[0].NotchStart) / 100 !== parseFloat($v('P440_POG_NOTCH_START')) / 100 || parseFloat(l_poginfo[0].NotchSpacing) / 100 !== parseFloat($v('P440_POG_NOTCH_SPACING')) / 100 || parseFloat(l_poginfo[0].HorzStart) / 100 !== parseFloat($v('P440_HORZ_START')) / 100 || parseFloat(l_poginfo[0].HorzSpacing) / 100 !== parseFloat($v('P440_HORZ_SPACING')) / 100 || parseFloat(l_poginfo[0].VertStart) / 100 !== parseFloat($v('P440_POG_VERT_START')) / 100 || parseFloat(l_poginfo[0].VertSpacing) / 100 !== parseFloat($v('P440_POG_VERT_SPACING')) / 100)) {
                                //                     pog_recreate = 'Y';
                                //                     if (typeof l_poginfo[0] !== "undefined") {
                                //                         l_poginfo[0].pog_recreate = 'Y';
                                //                     } //ASA-1250
                                //                     apex.item('P440_POG_RECREATE').setValue("Y");
                                //                 } else {
                                //                     if (typeof l_poginfo[0] !== "undefined") {
                                //                         l_poginfo[0].pog_recreate = 'N';
                                //                     } //ASA-1250
                                //                 }
                                //                 if (l_poginfo[0].SubDept !== $v('P440_POG_SUBDEPT')) {
                                //                     $.each(l_poginfo[0].ModuleInfo, function (i, Module) {
                                //                         if (Module.ParentModule == null || Module.ParentModule == 'undefined') {
                                //                             l_poginfo[0].ModuleInfo[i].SubDept = $v('P440_POG_SUBDEPT');
                                //                         }
                                //                     });

                                //                 }
                                //             } else {
                                //                 pog_recreate = 'Y';
                                //                 if (typeof l_poginfo[0] !== "undefined") {
                                //                     l_poginfo[0].pog_recreate = 'Y';
                                //                 } //ASA-1250
                                //                 apex.item('P440_POG_RECREATE').setValue("Y");
                                //             }
                                //             updateFields();
                                //         }

                                //     }
                                // });

                                confirm(
                                    get_message('POGCR_SAVE_ON_DUP_POGID'),
                                    get_message("SHCT_YES"),
                                    get_message("SHCT_NO"),
                                    function () {
                                        if (parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 > parseFloat($v('P440_POG_WIDTH')) / 100) {
                                            alert(get_message('SEGMENT_WIDTH_GREATER'));
                                        } else if ($v('P440_POG_CODE').length > parseInt($v('P440_MAX_POG_CODE_LENGTH'))) {
                                            alert(get_message('MAX_POG_CODE_LENGTH', $v('P440_MAX_POG_CODE_LENGTH')));
                                        } else if (($v('P440_NEW_TEMPLATE') !== "Y") && ($v('P440_POG_CODE') == '' || $v('P440_POG_DIVISION') == '' || $v('P440_POG_DEPT') == '' || $v('P440_POG_TYPE') == '' || $v('P440_POG_WIDTH') == '' || $v('P440_POG_HEIGHT') == '' || $v('P440_POG_DEPTH') == '' || $v('P440_BACK_DEPTH') == ''
                                            || $v('P440_POG_SEGMENT_WIDTH') == '' || $v('P440_POG_SUBDEPT') == '' || $v('P440_POG_CODE') == '' || $v('P440_POG_COLOR') == '')) {
                                            //ASA-1694 Issue 3, added $v('P440_NEW_TEMPLATE') !== "Y" in elseif
                                            alert(get_message('ENTER_MANDATORY_FIELDS'));
                                        } else if (parseFloat($v('P440_HORZ_START')) / 100 >= (parseFloat($v('P440_POG_WIDTH')) / 100) - ((parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100) * 2)) {
                                            alert(get_message('HORZ_START_LESS_THAN_WIDTH'));
                                        } else if (parseFloat($v('P440_POG_VERT_START')) / 100 > (parseFloat($v('P440_POG_HEIGHT')) / 100)) {
                                            alert(get_message('VERT_START_LESS_THAN_HEIGHT'));
                                        } else if ($v('P440_POG_HEIGHT') == 0) {
                                            alert(get_message('HEIGHT_GRT_THAN_ZERO'))
                                        } else if ($v('P440_POG_WIDTH') == 0) {
                                            alert(get_message('WIDTH_GRT_THAN_ZERO'))
                                        } else if ($v('P440_POG_DEPTH') == 0) {
                                            alert(get_message('DEPTH_GRT_THAN_ZERO'))
                                        } else if ($v('P440_BACK_DEPTH') == 0) {
                                            alert(get_message('BACK_DEPTH_GRT_THAN_ZERO'))
                                        } else if ($v('P440_BACK_DEPTH') < 1) {
                                            alert(get_message('BACK_DEPTH_NOT_LESS_THAN_ONE'))
                                        } 
                                        // else if ($v('P440_EFF_START_DATE') !== '' && new Date($v('P440_EFF_START_DATE')).getTime() < new Date($.trim(get_global_ind_values('AI_APPLICATION_DATE'))).getTime()) {
                                        //     alert(get_message('EFF_DATE_LESS_THAN_VDATE'));
                                        // } ASA-1953
                                        else if ($v('P25_POG_EFFECTIVE_START_DATE_UPD') === 'Y' && $v('P440_EFF_START_DATE') !== '' && new Date($v('P440_EFF_START_DATE')).getTime() < new Date($.trim(get_global_ind_values('AI_APPLICATION_DATE'))).getTime()) {
                                            alert(get_message('EFF_DATE_LESS_THAN_VDATE'));
                                        } 
                                        else if (parseFloat($v('P440_POG_SEGMENT_WIDTH')) == 0) {
                                            alert(get_message('SEGMENT_WIDTH_GRT_ZERO'));
                                        } else if (parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100 > 0 && parseFloat($v('P440_POG_NOTCH_SPACING')) == 0) {
                                            alert(get_message('NOTCH_SPACE_NEEDED'));
                                        } else if (parseFloat($v('P440_POG_BASE_HEIGHT')) > 0 && parseFloat($v('P440_POG_BASE_WIDTH')) == 0) {
                                            alert(get_message('BASE_WDT_GRT_ZERO'));
                                        } else if (parseFloat($v('P440_POG_BASE_WIDTH')) > 0 && parseFloat($v('P440_POG_BASE_HEIGHT')) == 0) {
                                            alert(get_message('BASE_HGT_GRT_ZERO'));
                                        } else if ((parseFloat($v('P440_POG_BASE_WIDTH')) > 0 || parseFloat($v('P440_POG_BASE_HEIGHT')) > 0) && parseFloat($v('P440_POG_BASE_DEPTH')) == 0) {
                                            alert(get_message('BASE_DEPT_GRT_ZERO'));
                                        } else if (parseFloat($v('P440_POG_BASE_HEIGHT')) > 0 && parseFloat($v('P440_POG_BASE_HEIGHT')) > parseFloat($v('P440_POG_HEIGHT'))) {
                                            alert(get_message('BASE_HGT_GRT_POG_HGT'));
                                        } else if (($v('P440_FLEX_TEXT_1') !== '' && $v('P440_FLEX_TEXT_1_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_1') == '') || ($v('P440_FLEX_TEXT_2') !== '' && $v('P440_FLEX_TEXT_2_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_2') == '') || ($v('P440_FLEX_TEXT_3') !== '' && $v('P440_FLEX_TEXT_3_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_3') == '') || ($v('P440_FLEX_TEXT_4') !== '' && $v('P440_FLEX_TEXT_4_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_4') == '')) {
                                            alert(get_message('ENTER_MANDATORY_FIELDS'));
                                        } else if (parseFloat($v('P440_POG_HEIGHT')) / 100 < l_poginfo['PogHeight'] || parseFloat($v('P440_POG_WIDTH')) / 100 < l_poginfo['PogWidth'] || parseFloat($v('P440_POG_DEPTH')) / 100 < l_poginfo['PogDepth'] || parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 < l_poginfo['PogSegmentWidth']) {
                                            alert(get_message('POGCR_DECR_DIMN_NOTALLOW'));
                                        } else if (g_innerDimension.length > 0 && $v('P440_NEW_TEMPLATE') == "Y" && (parseFloat($v('P440_POG_HEIGHT')) > g_fixtureH || parseFloat($v('P440_POG_WIDTH')) > g_fixtureW || parseFloat($v('P440_POG_DEPTH')) > g_fixtureD)) {
                                            alert(get_message('FIXTURE_DIMN_WARNING')); //ASA-1694
                                        } else {
                                            if (edited == 'Y') {
                                                if ((parseFloat(l_poginfo[0].W) / 100 !== parseFloat($v('P440_POG_WIDTH')) / 100 || parseFloat(l_poginfo[0].H) / 100 !== parseFloat($v('P440_POG_HEIGHT')) / 100 || parseFloat(l_poginfo[0].SegmentW) / 100 !== parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 || (l_poginfo[0].Color).toUpperCase() !== ($v('P440_POG_COLOR')).toUpperCase() || parseFloat(l_poginfo[0].NotchW) / 100 !== parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100 || parseFloat(l_poginfo[0].NotchStart) / 100 !== parseFloat($v('P440_POG_NOTCH_START')) / 100 || parseFloat(l_poginfo[0].NotchSpacing) / 100 !== parseFloat($v('P440_POG_NOTCH_SPACING')) / 100 || parseFloat(l_poginfo[0].HorzStart) / 100 !== parseFloat($v('P440_HORZ_START')) / 100 || parseFloat(l_poginfo[0].HorzSpacing) / 100 !== parseFloat($v('P440_HORZ_SPACING')) / 100 || parseFloat(l_poginfo[0].VertStart) / 100 !== parseFloat($v('P440_POG_VERT_START')) / 100 || parseFloat(l_poginfo[0].VertSpacing) / 100 !== parseFloat($v('P440_POG_VERT_SPACING')) / 100)) {
                                                    pog_recreate = 'Y';
                                                    if (typeof l_poginfo[0] !== "undefined") {
                                                        l_poginfo[0].pog_recreate = 'Y';
                                                    } //ASA-1250
                                                    apex.item('P440_POG_RECREATE').setValue("Y");
                                                } else {
                                                    if (typeof l_poginfo[0] !== "undefined") {
                                                        l_poginfo[0].pog_recreate = 'N';
                                                    } //ASA-1250
                                                }
                                                if (l_poginfo[0].SubDept !== $v('P440_POG_SUBDEPT')) {
                                                    $.each(l_poginfo[0].ModuleInfo, function (i, Module) {
                                                        if (Module.ParentModule == null || Module.ParentModule == 'undefined') {
                                                            l_poginfo[0].ModuleInfo[i].SubDept = $v('P440_POG_SUBDEPT');
                                                        }
                                                    });

                                                }
                                            } else {
                                                pog_recreate = 'Y';
                                                if (typeof l_poginfo[0] !== "undefined") {
                                                    l_poginfo[0].pog_recreate = 'Y';
                                                } //ASA-1250
                                                apex.item('P440_POG_RECREATE').setValue("Y");
                                            }
                                            updateFields();
                                        }
                                    }
                                );
                                //Task_29818 - End


                            } else {
                                if (parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 > parseFloat($v('P440_POG_WIDTH')) / 100) {
                                    alert(get_message('SEGMENT_WIDTH_GREATER'));
                                } else if ($v('P440_POG_CODE').length > parseInt($v('P440_MAX_POG_CODE_LENGTH'))) {
                                    alert(get_message('MAX_POG_CODE_LENGTH', $v('P440_MAX_POG_CODE_LENGTH')));
                                } else if (($v('P440_NEW_TEMPLATE') !== "Y") && ($v('P440_POG_CODE') == '' || $v('P440_POG_DIVISION') == '' || $v('P440_POG_DEPT') == '' || $v('P440_POG_TYPE') == '' || $v('P440_POG_WIDTH') == '' || $v('P440_POG_HEIGHT') == '' || $v('P440_POG_DEPTH') == '' || $v('P440_BACK_DEPTH') == ''
                                    || $v('P440_POG_SEGMENT_WIDTH') == '' || $v('P440_POG_SUBDEPT') == '' || $v('P440_POG_CODE') == '' || $v('P440_POG_COLOR') == '')) {
                                    //ASA-1694 Issue 3, added $v('P440_NEW_TEMPLATE') !== "Y" in elseif
                                    alert(get_message('ENTER_MANDATORY_FIELDS'));
                                } else if (parseFloat($v('P440_HORZ_START')) / 100 >= (parseFloat($v('P440_POG_WIDTH')) / 100) - ((parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100) * 2)) {
                                    alert(get_message('HORZ_START_LESS_THAN_WIDTH'));
                                } else if (parseFloat($v('P440_POG_VERT_START')) / 100 > (parseFloat($v('P440_POG_HEIGHT')) / 100)) {
                                    alert(get_message('VERT_START_LESS_THAN_HEIGHT'));
                                } else if ($v('P440_POG_HEIGHT') == 0) {
                                    alert(get_message('HEIGHT_GRT_THAN_ZERO'))
                                } else if ($v('P440_POG_WIDTH') == 0) {
                                    alert(get_message('WIDTH_GRT_THAN_ZERO'))
                                } else if ($v('P440_POG_DEPTH') == 0) {
                                    alert(get_message('DEPTH_GRT_THAN_ZERO'))
                                } else if ($v('P440_BACK_DEPTH') == 0) {
                                    alert(get_message('BACK_DEPTH_GRT_THAN_ZERO'))
                                } else if ($v('P440_BACK_DEPTH') < 1) {
                                    alert(get_message('BACK_DEPTH_NOT_LESS_THAN_ONE'))
                                } 
                                // else if ($v('P440_EFF_START_DATE') !== '' && new Date($v('P440_EFF_START_DATE')).getTime() < new Date($.trim(get_global_ind_values('AI_APPLICATION_DATE'))).getTime()) {
                                //     alert(get_message('EFF_DATE_LESS_THAN_VDATE'));
                                // } ASA-1953
                                else if ($v('P25_POG_EFFECTIVE_START_DATE_UPD') === 'Y' && $v('P440_EFF_START_DATE') !== '' && new Date($v('P440_EFF_START_DATE')).getTime() < new Date($.trim(get_global_ind_values('AI_APPLICATION_DATE'))).getTime()) {
                                    alert(get_message('EFF_DATE_LESS_THAN_VDATE'));
                                } 
                                else if (parseFloat($v('P440_POG_SEGMENT_WIDTH')) == 0) {
                                    alert(get_message('SEGMENT_WIDTH_GRT_ZERO'));
                                } else if (parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100 > 0 && parseFloat($v('P440_POG_NOTCH_SPACING')) == 0) {
                                    alert(get_message('NOTCH_SPACE_NEEDED'));
                                } else if (parseFloat($v('P440_POG_BASE_HEIGHT')) > 0 && parseFloat($v('P440_POG_BASE_WIDTH')) == 0) {
                                    alert(get_message('BASE_WDT_GRT_ZERO'));
                                } else if (parseFloat($v('P440_POG_BASE_WIDTH')) > 0 && parseFloat($v('P440_POG_BASE_HEIGHT')) == 0) {
                                    alert(get_message('BASE_HGT_GRT_ZERO'));
                                } else if ((parseFloat($v('P440_POG_BASE_WIDTH')) > 0 || parseFloat($v('P440_POG_BASE_HEIGHT')) > 0) && parseFloat($v('P440_POG_BASE_DEPTH')) == 0) {
                                    alert(get_message('BASE_DEPT_GRT_ZERO'));
                                } else if (parseFloat($v('P440_POG_BASE_HEIGHT')) > 0 && parseFloat($v('P440_POG_BASE_HEIGHT')) > parseFloat($v('P440_POG_HEIGHT'))) {
                                    alert(get_message('BASE_HGT_GRT_POG_HGT'));
                                } else if (($v('P440_FLEX_TEXT_1') !== '' && $v('P440_FLEX_TEXT_1_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_1') == '') || ($v('P440_FLEX_TEXT_2') !== '' && $v('P440_FLEX_TEXT_2_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_2') == '') || ($v('P440_FLEX_TEXT_3') !== '' && $v('P440_FLEX_TEXT_3_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_3') == '') || ($v('P440_FLEX_TEXT_4') !== '' && $v('P440_FLEX_TEXT_4_REQ') == 'Y' && $v('P440_COL_FLEX_TEXT_4') == '')) {
                                    alert(get_message('ENTER_MANDATORY_FIELDS'));
                                } else if (parseFloat($v('P440_POG_HEIGHT')) / 100 < l_poginfo['PogHeight'] || parseFloat($v('P440_POG_WIDTH')) / 100 < l_poginfo['PogWidth'] || parseFloat($v('P440_POG_DEPTH')) / 100 < l_poginfo['PogDepth'] || parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 < l_poginfo['PogSegmentWidth']) {
                                    alert('Decreasing dimensions are not allowed');
                                } else {
                                    if (edited == 'Y') {
                                        if ((parseFloat(l_poginfo[0].W) / 100 !== parseFloat($v('P440_POG_WIDTH')) / 100 || parseFloat(l_poginfo[0].H) / 100 !== parseFloat($v('P440_POG_HEIGHT')) / 100 || parseFloat(l_poginfo[0].SegmentW) / 100 !== parseFloat($v('P440_POG_SEGMENT_WIDTH')) / 100 || (l_poginfo[0].Color).toUpperCase() !== ($v('P440_POG_COLOR')).toUpperCase() || parseFloat(l_poginfo[0].NotchW) / 100 !== parseFloat($v('P440_POG_NOTCH_WIDTH')) / 100 || parseFloat(l_poginfo[0].NotchStart) / 100 !== parseFloat($v('P440_POG_NOTCH_START')) / 100 || parseFloat(l_poginfo[0].NotchSpacing) / 100 !== parseFloat($v('P440_POG_NOTCH_SPACING')) / 100 || parseFloat(l_poginfo[0].HorzStart) / 100 !== parseFloat($v('P440_HORZ_START')) / 100 || parseFloat(l_poginfo[0].HorzSpacing) / 100 !== parseFloat($v('P440_HORZ_SPACING')) / 100 || parseFloat(l_poginfo[0].VertStart) / 100 !== parseFloat($v('P440_POG_VERT_START')) / 100 || parseFloat(l_poginfo[0].VertSpacing) / 100 !== parseFloat($v('P440_POG_VERT_SPACING')) / 100)) {
                                            pog_recreate = 'Y';
                                            if (typeof l_poginfo[0] !== "undefined") {
                                                l_poginfo[0].pog_recreate = 'Y';
                                            } //ASA-1250
                                            apex.item('P440_POG_RECREATE').setValue("Y");
                                        } else {
                                            if (typeof l_poginfo[0] !== "undefined") {
                                                l_poginfo[0].pog_recreate = 'N';
                                            } //ASA-1250
                                        }
                                        if (l_poginfo[0].SubDept !== $v('P440_POG_SUBDEPT')) {
                                            $.each(l_poginfo[0].ModuleInfo, function (i, Module) {
                                                if (Module.ParentModule == null || Module.ParentModule == 'undefined') {
                                                    l_poginfo[0].ModuleInfo[i].SubDept = $v('P440_POG_SUBDEPT');
                                                }
                                            });

                                        }
                                    } else {
                                        pog_recreate = 'Y';
                                        if (typeof l_poginfo[0] !== "undefined") {
                                            l_poginfo[0].pog_recreate = 'Y';
                                        } //ASA-1250
                                        apex.item('P440_POG_RECREATE').setValue("Y");
                                    }
                                    updateFields();
                                };
                            }
                        }    //ASA-1465 Issue 1 E
                    }
                },
                loadingIndicatorPosition: 'page'
            });
    } catch (err) {
        error_handling(err);
    };
};

async function uploadFile(p_file_index) {
    logDebug('function : uploadFile; pFileIndex : ' + p_file_index, 'S');
    try {
        var fileInputElem = document.getElementById('P440_UPLOAD_PDF');
        var filename = document.getElementById('P440_UPLOAD_PDF').innerHTML
        var fileIndex = 0;
        var file = fileInputElem.files[fileIndex];
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
                            'UPLOAD_FILE', {
                            x01: file.name,
                            x02: file.type,
                            f01: f01Array
                        }, {
                            dataType: 'json',
                            success: function (data) {
                                if (data.result == 'success') {
                                    fileIndex++;

                                    if (fileIndex < fileInputElem.files.length) {
                                        uploadFile(fileIndex);
                                    } else {
                                        fileInputElem.value = '';
                                        $s('P440_FILE_NAME', file.name)
                                        upload_file_flag = 'Y';
                                        logDebug('function : uploadFile', 'E');
                                    }
                                } else {
                                    alert(get_message('INTERNAL_ERROR'));
                                }
                            },
                            loadingIndicatorPosition: 'page'
                        });
                    }
                }
            })(file);
            reader.readAsArrayBuffer(file);
        };
    } catch {
        error_handling(err);
    }
};

function validate_file_type(p_fileName) {
    logDebug('function : validate_file_type', 'S');
    var fname = p_fileName;
    var re = /(\.pdf|\.xlsx|\.zip)$/i;
    if (!re.exec(fname)) {
        alert(get_message('INVALID_FILE_TYPE', p_fileName));
        return false;
    } else {
        logDebug('function : validate_file_type', 'E');
        return true;
    };

}
