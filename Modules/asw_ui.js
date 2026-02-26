//asw_ui.js : This file will contain functions which is directly interacting with DOM or browser states.


//getting json from ajax the list of posible orientations of the item and its details.
async function load_orientation_json() {
    //task_26897 Regression 1
    logDebug("function : load_orientation_json");
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "LOAD_ORIENTATION_JSON",
            {},
            {
                dataType: "text",
                success: function (pData) {
                    g_orientation_json = JSON.parse(pData);
                    resolve(g_orientation_json);
                },
            }
        );
    });
}

//This below click event is used to show a custom drop down of colors.
//This will only work when click object has class t-Icon fa fa-eyedropper
window.addEventListener("click", function (event) {
    if (typeof $(event.path) !== "undefined") {
        logo_clicked = "N";
    }
    if (typeof $(event.target).attr("id") !== "undefined" && $(event.target).attr("class") !== "t-Icon fa fa-eyedropper") {
        if (!$(event.target).attr("id").startsWith("CUSTOM_COLOR")) {
            $("#co-color-list").slideUp("fast", function () {
                $("#co-color-list").css("display", "none");
                g_openChooseColor = false;
            });
        }
    } else if ($(event.target).attr("class") == "t-Icon fa fa-eyedropper") {
        $("#co-color-list").css("display", "block");
        g_openChooseColor = true;
    } else {
        $("#co-color-list").slideUp("fast", function () {
            $("#co-color-list").css("display", "none");
            g_openChooseColor = false;
        });
    }
});

function set_custom_color(p_page_item, p_set_item) {
    try {
        logDebug("function : set_custom_color ; ", "S");
        $.support.cors = true;
        const $button = $("#" + p_page_item);
        const $colorValue = $(".colorValue");
        const $colorDisplay = $(".colorDisplay");

        $($button).sbxColorChoice({
            selecionarCor: (color) => {
                $("#" + p_set_item).val(color);
                $("#" + p_set_item + "_CONTAINER .apex-item-color-picker-preview").css("background-color", color);
            },
            reseteCor: "#FFFFFF",
            event: event,
            setfocus: p_set_item,
        });
        logDebug("function : set_custom_color ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

//custom standard color picket.
$.fn.sbxColorChoice = function (params) {
    try {
        const { reseteCor, removePallet, event, setfocus, textResetColorButton, selecionarCor } = params;
        const $element = $("#co-color-list");
        //Function that close the component
        const closeChooseColor = (element) => {
            element.slideUp("fast", function () {
                element.css("display", "none");
                g_openChooseColor = false;
                apex.item(setfocus).setFocus();
            });
        };

        // Function that apply the color selected
        const chooseColor = (element, e) => {
            element.find("ul li").click(function () {
                const color = $(this).attr("data-color");
                closeChooseColor(element);
                selecionarCor(color, e);
            });
        };

        // Function that reset color
        const removePalletColor = () => {
            if (removePallet != "" && removePallet != undefined) {
                $("#co-color-list").find(removePallet).remove();
            }
        };

        // Function that add a custom text in reset color button
        const constumResetTextButton = (element) => {
            if (textResetColorButton) {
                element.find(".reset-color-button").html(textResetColorButton);
            }
        };

        // Function that create modal's effect
        const effectModal = (element) => {
            element.slideDown("fast", function () {
                element.focus();
            });
        };

        // Function that mark where the pallet will open
        const positionElement = (element, e) => {
            const $target = $(e.target);
            const $targetPosicao = $target.offset();
            const $targetHeight = $target.height();
            const $targetWdith = $target.width();
            const $screenHeight = $(window).height();
            const $screenWidth = $(window).width();
            const $elementHeight = $("#co-color-list").height();
            const $elementWidth = $("#co-color-list").width();

            let top, left;

            top = $targetPosicao.top - $targetHeight;
            var elementoPosicao = "co-color-list--bellow";

            left = $targetPosicao.left - $("#co-color-list").width() / 2;
            var elementoPosicao2 = "co-color-list--left";

            element.find("ul.color-reset li").attr("data-color", reseteCor);
            element
                .css({
                    top: top,
                    left: left,
                })
                .addClass([elementoPosicao, elementoPosicao2]);
        };
        positionElement($element, event);
        effectModal($element);
        chooseColor($element, event);
        removePalletColor();
        constumResetTextButton($element);
        g_openChooseColor = true;
    } catch (err) {
        error_handling(err);
    }
};

// get back the height and width of the text in pixels for creation of canvas.
function get_visible_text_dim(p_text, p_textHeight) {
    try {
        logDebug("function : get_visible_text_dim; text : " + p_text + "; textHeight : " + p_textHeight, "S");
        var ruler = document.getElementById("ruler");
        ruler.style.fontSize = p_textHeight + "px";
        ruler.innerHTML = p_text;
        width = ruler.offsetWidth + 10; //ASA-1677 issue 2 increased offset width.
        height = ruler.offsetHeight + 5;
        logDebug("function : get_visible_text_dim", "E");
        return [width, height];
    } catch (err) {
        logDebug("function : get_visible_text_dim", "E");
        error_handling(err);
    }
}

function clickInsideElement(p_event, p_className) {
    // logDebug('function : clickInsideElement', 'S');
    var el = p_event.srcElement || p_event.target;

    if (el.classList.contains(p_className)) {
        return el;
    } else {
        while ((el = el.parentNode)) {
            if (el.classList && el.classList.contains(p_className)) {
                return el;
            }
        }
    }
    return false;
}


async function get_images(p_module_index, p_shelf_index, p_item_arr, p_item_index_arr, p_pogcrImgMaxWidth, p_pogcrImgMaxHeight, p_pogcrImgCompressRation) {
    logDebug("function : get_images ; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
    try {
        var completed = "N";
        var i = 0;
        for (const items of p_item_arr) {
            var img_exists = "N";
            if (items.ImgExists == "Y") {
                var details = g_orientation_json[items.Orientation];
                var details_arr = details.split("###");
                var j = 0;
                for (const images_arr of g_ItemImages) {
                    // $.each(g_ItemImages, function (j, images_arr) {
                    if (items.Item == images_arr.Item && details_arr[0] == images_arr.Orientation && items.MerchStyle == images_arr.MerchStyle) {
                        img_exists = "Y";
                        break; //return false;
                    }
                    // });
                    j++;
                }
                if (img_exists == "N") {
                    ItemImageInfo = {};
                    ItemImageInfo["Item"] = items.Item;
                    ItemImageInfo["MIndex"] = p_module_index;
                    ItemImageInfo["SIndex"] = p_shelf_index;
                    ItemImageInfo["IIndex"] = i;
                    ItemImageInfo["Orientation"] = details_arr[0];
                    ItemImageInfo["ItemImage"] = null;
                    ItemImageInfo["MerchStyle"] = items.MerchStyle;
                    g_ItemImages.push(ItemImageInfo);
                    var return_val = await call_ajax(p_module_index, p_shelf_index, p_item_index_arr[i], details_arr[0], g_ItemImages.length - 1, items.Item, items.MerchStyle, p_pogcrImgMaxWidth, p_pogcrImgMaxHeight, p_pogcrImgCompressRation);
                }
            }
            i++;
        }
        logDebug("function : get_images", "E");
        return "success";
    } catch (err) {
        error_handling(err);
    }
}

function call_ajax(p_module_index, p_shelf_index, p_item_index, p_item_type, p_img_index, p_item_code, p_merch_style, p_pogcrImgMaxWidth, p_pogcrImgMaxHeight, p_pogcrImgCompressRation) {
    try {
        logDebug("function : call_ajax ; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; item_type : " + p_item_type + "; img_index : " + p_img_index + "; item_code : " + p_item_code, "S");
        return new Promise(function (resolve, reject) {
            var new_merch_style;
            if (p_merch_style == "0") {
                new_merch_style = "U";
            } else if (p_merch_style == "1") {
                new_merch_style = "T";
            } else if (p_merch_style == "2") {
                new_merch_style = "C";
            } else if (p_merch_style == "3") {
                new_merch_style = "D";
            }

            var p = apex.server.process(
                "ITEM_BASE64",
                {
                    x01: p_item_code,
                    x02: p_item_type,
                    x03: new_merch_style,
                },
                {
                    dataType: "html",
                }
            );
            // When the process is done, call functions
            p.done(function (data) {
                if ($.trim(data) !== "") {
                    var details;
                    async function doSomething(Imagedata) {
                        var image = new Image();
                        image.src = "data:image/jpeg;base64," + Imagedata;
                        image.onload = function () {
                            async function imageLoad(image) {
                                details = await resizeImage(image, p_pogcrImgMaxWidth, p_pogcrImgMaxHeight, p_pogcrImgCompressRation);
                                compress_image = details.split(",");
                                g_ItemImages[p_img_index].ItemImage = compress_image[1]; //$.trim(data);
                                logDebug("function : call_ajax", "E");
                                resolve("success");
                            }
                            imageLoad(image);
                        };
                    }
                    doSomething($.trim(data));
                } else {
                    if (p_img_index == 0) {
                        g_ItemImages.splice(p_img_index, p_img_index + 1);
                    } else {
                        g_ItemImages.splice(p_img_index, 1);
                    }
                    logDebug("function : call_ajax", "E");
                    resolve("success");
                }
            });
        });
    } catch (err) {
        error_handling(err);
    }
}

async function resizeImage(p_img, p_MaxWidth, p_MaxHeight, p_compress_ratio) {
    try {
        logDebug("function : resizeImage ; MaxWidth : " + p_MaxWidth + "; MaxHeight : " + p_MaxHeight, "S");
        var canvas = document.createElement("canvas");
        var width = p_img.width;
        var height = p_img.height;
        var max_width = p_MaxWidth;
        var max_height = p_MaxHeight;
        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > max_width) {
                //height *= max_width / width;
                height = Math.round((height *= max_width / width));
                width = max_width;
            }
        } else {
            if (height > max_height) {
                //width *= max_height / height;
                width = Math.round((width *= max_height / height));
                height = max_height;
            }
        }
        // resize the canvas and draw the image data into it
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(p_img, 0, 0, width, height);

        //preview.appendChild(canvas); // do the actual resized preview
        logDebug("function : resizeImage", "E");
        return canvas.toDataURL("image/jpeg", p_compress_ratio);
    } catch (err) {
        error_handling(err);
    }
}

function base64toBlob(p_base64Data, p_contentType) {
    logDebug("function : base64toBlob ; contentType : " + p_contentType, "E");
    p_contentType = p_contentType || "";
    var sliceSize = 1024;
    var byteCharacters = atob(p_base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    logDebug("function : base64toBlob", "E");
    return new Blob(byteArrays, {
        type: p_contentType,
    });
}


function send_to_db(p_pog_code, p_img_arr) {
    logDebug("function : send_to_db; pog_code : " + p_pog_code, "S");
    return new Promise(function (resolve, reject) {
        //var pClob = JSON.stringify(p_img_arr);
        var p = apex.server.process(
            "SAVE_MODULE_IMG",
            {
                x01: p_pog_code,
                p_clob_01: JSON.stringify(p_img_arr),
            },
            {
                dataType: "html",
            }
        );
        // When the process is done, call functions
        p.done(function (data) {
            logDebug("function : send_to_db", "E");
            resolve("success");
        });
    });
}

//ASA-1870, Moved from page_25_wpd_4.js to main.js and added pog code and version as a parameter
async function create_item_compare(p_pog_Code, p_pog_version) {
    var l_version = g_pog_json[g_pog_index].DraftVersion;  //ASA 2058
    $s('P25_DRAFT_VERSION', l_version);         //ASA 2058

    var v_x04 = (l_version === null || l_version === undefined || l_version === '') ? 'N' : 'Y'; //ASA 2058

    var p = apex.server.process(
        "CREATE_COMPARE_ITEM_COLL",
        {
            x01: p_pog_Code,
            x02: p_pog_version,
            x03: g_pdf_online_clck, //ASA-1531 ISSUE 16
            x04: v_x04,   //ASA 2058
        },
        {
            dataType: "html",
        }
    );
}

function validate_file_type(p_fileName) {
    try {
        logDebug("function : validate_file_type", "S");
        var fname = p_fileName;
        var re = /(\.pdf|\.xlsx|\.zip)$/i;
        if (!re.exec(fname)) {
            alert(get_message("INVALID_FILE_TYPE", p_fileName));
            return false;
        } else {
            logDebug("function : validate_file_type", "E");
            return true;
        }
    } catch (err) {
        error_handling(err);
    }
}

function get_json_data_json(p_pog_code, p_pog_version, p_pog_ind, p_pog_seq) {
    try {
        return new Promise(function (resolve, reject) {
            var p = apex.server.process(
                "GET_JSON_FROM_COLL",
                {
                    x01: p_pog_code,
                    x02: p_pog_version,
                    x03: p_pog_ind,
                    x04: p_pog_seq,
                },
                {
                    dataType: "html",
                }
            );
            // When the process is done, set the value to the page item
            p.done(function (data) {
                if ($.trim(data).indexOf("ERROR") == -1) {
                    g_pog_json_data = JSON.parse($.trim(data));
                    console.log("json", g_pog_json_data);
                    resolve("SUCESS");
                } else {
                    resolve($.trim(data));
                }
            });
        });
    } catch (err) {
        console.log("error 3", return_val);
        //error_handling(err);
    }
}

async function refresh_sales_data(p_weekselection, p_store, p_fontsize, p_detailitemlist, p_daysupplylabel, p_dialogclose, p_loadingind, p_showerror = "Y", p_pogCode, p_select_pog, p_SavetoColl = "N", p_pog_index = g_pog_index, p_bybass_alert = "N") { //ASA-1803 Added param p_bybass_alert
    //ASA-1360 issue 3
    logDebug("function : send_to_db; refresh_sales_data : ", "S");
    return new Promise(function (resolve, reject) {
        console.log("refresh sales ", p_weekselection, p_store, p_fontsize, p_detailitemlist, p_daysupplylabel, p_dialogclose, p_loadingind, p_showerror, "ACTUAL POG", p_pogCode, "SELECTED POG", p_select_pog, (p_SavetoColl = "N"), (p_pog_index = g_pog_index));
        var itemjson;
        if (p_loadingind == "Y") {
            addLoadingIndicator();
        }
        var p = apex.server.process(
            "SALES_REFRESH",
            {
                x01: p_pogCode, //Task-02_25977
                x02: p_store, //Task-02_25977
                x03: p_weekselection, //Task-02_25977
                x04: p_select_pog, //ASA-1360 issue 3
            },
            {
                dataType: "text",
            }
        );
        // When the process is done, call functions
        p.done(function (data) {
            //ASA - 1441 S
            if ($.trim(data) !== "") {
                console.log("refresh_sales_data", data);
                if ($v("P25_POGCR_SALES_INFO_REFRESH_DTL") == "Y") {
                    g_pog_json[p_pog_index].SalesRrshDtl = "Date: " + getDateTime();
                } else {
                    g_pog_json[p_pog_index].SalesRrshDtl = "Date: " + getDateTime() + " | Sales Week: " + p_weekselection + " | Store: " + p_store; //ASA - 1441
                } //ASA - 1441 E
                if (data.indexOf("Error:") >= 0 && p_bybass_alert == "N") { //ASA-1803
                    if (p_loadingind == "Y") {
                        removeLoadingIndicator(regionloadWait);
                    }
                    raise_error(data.substr(6));
                } else if (data.indexOf("Warn:") >= 0 && p_bybass_alert == "N") { //ASA-1803
                    if (p_loadingind == "Y") {
                        removeLoadingIndicator(regionloadWait);
                    }
                    alert(data.substr(5));
                    resolve("Warning" + data.substr(5));
                } else {
                    try {
                        var SalesJson = JSON.parse(data);
                        delete g_pog_json[p_pog_index]["SalesInfo"];
                        g_pog_json[p_pog_index].SalesInfo = SalesJson;
                    } catch {
                        if (p_loadingind == "Y") {
                            removeLoadingIndicator(regionloadWait);
                        }
                        if (p_showerror == "Y") {
                            raise_error(data);
                        } else {
                            resolve("success");
                        }
                    }

                    async function dosomething() {
                        if (p_daysupplylabel == "Y") {
                            await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", p_pog_index, "Y", "Y", p_fontsize, p_detailitemlist);
                        }
                        if (p_SavetoColl == "Y") {
                            var returnval = await save_pog_to_json([g_pog_json[p_pog_index]]);
                        }
                        if (p_loadingind == "Y") {
                            removeLoadingIndicator(regionloadWait);
                        }
                    }
                    dosomething();
                    if (p_dialogclose == "Y") {
                        apex.message.showPageSuccess(get_message("POGCR_SALES_REFRESH"));
                        closeInlineDialog("open_refresh_sales");
                    }
                    resolve("success");
                }
            }
        });
    });
}

function save_pog_to_json(p_pogjson) {
    logDebug("function : save_pog_to_json", "S");
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "ADD_JSON_TO_COLL",
            {
                x01: "I",
                p_clob_01: JSON.stringify(p_pogjson),
            },
            {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        logDebug("function : save_pog_to_json", "E");
                        resolve("SUCESS");
                    }
                },
                loadingIndicatorPosition: "page",
            }
        );
    });
}

function delete_items_coll() {
    logDebug("function : delete_items_coll", "S");
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "DELETE_ITEM_COLL",
            {
                x01: "I",
            },
            {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        logDebug("function : delete_items_coll", "E");
                        resolve("SUCESS");
                    }
                },
            }
        );
    });
}

function reset_zoom() {
    logDebug("function : reset_zoom", "S");
    try {
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            $(".top_icon").removeClass("active");
            $(".left_icon").removeClass("active");
            $("#maincanvas").css("cursor", "auto");
            $("#maincanvas1").css("cursor", "auto");
            g_manual_zoom_ind = "N";
            g_area_zoom_ind = "N";
            g_select_zoom_arr = [];
            if (g_all_pog_flag == "Y") {
                var z = 0;
            } else {
                var z = g_pog_index;
            }
            for (const pogJson of g_pog_json) {
                if (g_compare_pog_flag == "N" || (g_compare_pog_flag == "Y" && g_compare_view !== "CUTAWAY")) {
                    var details = get_min_max_xy(z);
                    var details_arr = details.split("###");
                    console.log("details_arr", details_arr, z);
                    set_camera_z(g_scene_objects[z].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, z);
                }

                render(z);
                if (g_all_pog_flag == "Y") {
                    z++;
                } else {
                    break;
                }
            }
            g_intersected = [];
            g_mselect_drag = "N"; //ASA-1692
            g_multiselect = "N"; //ASA-1692
        }
        logDebug("function : reset_zoom", "E");
    } catch (err) {
        error_handling(err);
    }
}

function reset_indicators() {
    if (g_show_fixel_label == "Y") {
        $(".fixel_label").addClass("fixel_label_active");
    } else {
        $(".fixel_label").removeClass("fixel_label_active");
    }
    if (g_show_item_color == "Y") {
        $(".item_color").addClass("item_label_active");
    } else {
        $(".item_color").removeClass("item_label_active");
    }
    if (g_show_item_label == "Y") {
        $(".item_label").addClass("item_label_active");
    } else {
        $(".item_label").removeClass("item_label_active");
    }
    //ASA-1182
    if (g_itemSubLabelInd == "N") {
        $(".item_sublabel").removeClass("item_sublabel_active");
        $("#item_sublbl_sub .items").removeClass("item_sublabel_active");
    } else {
        $(".item_sublabel").addClass("item_sublabel_active");
        $("#item_sublbl_sub ." + g_itemSubLabel).addClass("item_sublabel_active");
    }
    if (g_show_fixel_space == "Y") {
        $(".fixel_space").addClass("item_label_active");
    } else {
        $(".fixel_space").removeClass("item_label_active");
    }
    if (g_show_item_desc == "Y" && g_show_live_image == "N") {
        $(".item_desc").addClass("item_label_active");
    } else {
        $(".item_desc").removeClass("item_label_active");
    }
    if (g_show_notch_label == "Y") {
        $(".notch_label").addClass("notch_label_active");
    } else {
        $(".notch_label").removeClass("notch_label_active");
    }
    if (g_show_live_image == "Y") {
        $(".live_image").addClass("live_image_active");
    } else {
        $(".live_image").removeClass("live_image_active");
    }
    if (g_show_max_merch == "Y") {
        $(".fixel_merch").addClass("max_merch_active");
    } else {
        $(".fixel_merch").removeClass("max_merch_active");
    }
    if (g_max_facing_enabled == "Y") {
        $(".max_facing").addClass("enable_maximize_facings");
    } else {
        $(".max_facing").removeClass("enable_maximize_facings");
    }
    if (g_show_days_of_supply == "Y") {
        $(".supply_days").addClass("item_label_active");
    } else {
        $(".supply_days").removeClass("item_label_active");
    }
    if (g_show_item_color == "Y") {
        $(".item_color_legends").css("display", "block");
    } else {
        $(".item_color_legends").css("display", "none");
    }
    //ASA-1138
    if (g_overhung_shelf_active == "Y") {
        $(".overhung_shelf").addClass("overhung_shelf_active");
    } else {
        $(".overhung_shelf").removeClass("overhung_shelf_active");
    }
    logDebug("function : reset_indicators", "E");
}