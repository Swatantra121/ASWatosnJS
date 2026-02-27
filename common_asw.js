var regionloadWait;
var ReturnVal;
var origshowSpinner = apex.util.showSpinner;
var SpinnerTimeout;
var messageKey = "ASWMessages";
var inputDateFormat = get_global_ind_values('AI_INPUT_DATE_FORMAT');
var jsDateFormat = get_global_ind_values('AI_JS_DATE_FORMAT');

//Disable Items
function disable_item(p_itemId, p_itemClass) {
    var l_itemName;
    if (p_itemId != '')
        l_itemName = '#' + p_itemId;
    else
        l_itemName = '.' + p_itemClass;

    $(l_itemName).addClass('apex_disabled');
}

//Enable Items
function enable_item(p_itemId, p_itemClass) {
    var l_itemName;
    if (p_itemId != '')
        l_itemName = '#' + p_itemId;
    else
        l_itemName = '.' + p_itemClass;

    $(l_itemName).removeClass('apex_disabled');
}

//Add loading indicator
function addLoadingIndicator() {
    regionloadWait = apex.widget.waitPopup();
}
//Remove loading indicator once background process has executed
function removeLoadingIndicator(regionloadWait) {
    if (typeof regionloadWait !== 'undefined')
        regionloadWait.remove();
}

function page_edit_access(edit_ind) {
    if (edit_ind == 'N') {
        // Add asw_always_on to IG toolbar items
        $("input:radio[name*='_ig_toolbar_']").addClass('asw_always_on');
        $(".a-Toolbar-input").addClass('asw_always_on');
        /* To disable all datepickers dynamic and static on page */
        $("input").not(".asw_always_on").datepicker('disable');
        $("button.ui-multiselect").not(".asw_always_on").addClass('apex_disabled');

        $("input:checkbox").not('.asw_always_on,.a-IG-controlsCheckbox').closest('div').addClass('apex_disabled');
        $("input:checkbox").parents('div.asw_always_on').find('input:checkbox').closest('div').removeClass('apex_disabled');
        $("input:radio").not('.asw_always_on').closest('div').addClass('apex_disabled');
        $("input:radio").parents('div.asw_always_on').find('input:radio').closest('div').removeClass('apex_disabled');

        $('div.asw_always_on').find('input:checkbox').prop('disabled', '');
        $('div.asw_always_on').find('input:radio').prop('disabled', '');
        $('textarea').not(".asw_always_on").addClass("apex_disabled");
        $('ul.apex-item-multi').addClass("apex_disabled");
        $('ul.apex-item-multi').parents('div.asw_always_on').find('ul.apex-item-multi').removeClass("apex_disabled");

        $('button.a-Button--popupLOV').addClass("apex_disabled");
        $('button.a-Button--popupLOV').parent().addClass("apex_disabled");
        $('button.a-Button--popupLOV').parents('div.asw_always_on').find('button.a-Button--popupLOV').removeClass("apex_disabled");
        $('button.a-Button--popupLOV').parents('div.asw_always_on').find('button.a-Button--popupLOV').parent().removeClass("apex_disabled");

        $("oj-input-date").not(".asw_always_on").addClass('apex_disabled');
        $("input, select").not("div .a-IRR-searchFieldContainer input").not("div .a-IRR-savedReports").not("div .a-IRR-sortWidget-search").not("div .a-IRR-sortWidget-search input").not(".asw_always_on").not(".a-IRR-selectList").not("div .asw_always_on input").not("div .asw_always_on select").not(".a-Toolbar-inputText").not(".a-Toolbar-selectList").not(".u-TF-item--select").addClass("apex_disabled");
    }
    $('label.t-Form-label').css('cursor', 'default').css('pointer-events', 'none');
    $('.apex_disabled').bind('keydown', function (e) {
        return false;
    });
}

// Can be used as common function.
function getSelectionStart(o) {
    if (o.createTextRange) {
        var r = document.selection.createRange().duplicate()
        r.moveEnd('character', o.value.length)
        if (r.text == '')
            return o.value.length
        return o.value.lastIndexOf(r.text)
    } else
        return o.selectionStart
}

//Function for numeric text
$(document).on('keypress', '.numeric_list', function (e) {
    if (!numbersonly(e))
        e.preventDefault();
});

function numbersonly(e) {
    var unicode = e.charCode ? e.charCode : e.keyCode
    if (unicode != 8 || unicode != 46) { //if the key isn't the backspace or delete key (which we should allow)
        if (unicode < 48 || unicode > 57) //if not a number
            return false; //disable key press
        else
            return true;
    }
}

//Function for numeric with negative
$(document).on('keypress', '.numeric_list_with_negative', function (e) {
    if (!isNumberKeyWithNegative(e))
        e.preventDefault();
});

// Overriding Alert Message
function alert(message) {
    apex.message.alert(message);
}

//Task_29818 - Start
// Overriding Confirm Message
// function confirm(message, request, okText, cancelText) {
//     ax_message.set({
//         labels: {
//             ok: okText,
//             cancel: cancelText
//         }
//     });

//     ax_message.set({
//         buttonReverse: true
//     });

//     ax_message.confirm(message, function (e) {
//         if (e) {
//             apex.submit(request);
//         }
//     });
// }

function confirm(p_message, p_okText, p_cancelText, p_okCallback, p_cancelCallback, p_okRequest, p_cancelRequest) {

    apex.lang.addMessages({
        "APEX.DIALOG.OK": p_okText,
        "APEX.DIALOG.CANCEL": p_cancelText
    });

    apex.message.confirm(p_message, function (e) {
        if (e) {

            if (typeof p_okCallback === 'function') {
                p_okCallback();
            } else if (p_okRequest != '' && typeof p_okRequest != 'undefined') {
                apex.submit(p_okRequest);
            }

        } else {
            if (typeof p_cancelCallback === 'function') {
                p_cancelCallback();
            } else if (p_cancelRequest != '' && typeof p_cancelRequest != 'undefined') {
                apex.submit(p_cancelRequest);
            }
        }
    });

    setTimeout(function () {
        var $buttons = $('.ui-dialog-buttonpane button');
        if ($buttons.length === 2) {
            // Move the "Yes" (OK) button to the right of the "No" button
            $buttons.eq(0).before($buttons.eq(1));
        }
    }, 25);

}
//Task_29818 - End

function isNumberKeyWithNegative(e) {
    var unicode = e.charCode ? e.charCode : e.keyCode
    if (unicode != 8 && unicode != 45) { //if the key isn't the backspace or delete key or minus (which we should allow)
        if (unicode < 48 || unicode > 57 || unicode == 46) //if not a number
            return false; //disable key press
        else
            return true;
    } else {
        return true;
    }
}

// Function for numeric with dot
$(document).on('keypress', '.numeric_list_with_dot', function (e) {
    if (!isNumberKeyWithDot(e))
        e.preventDefault();
});

// Function for numeric with dot
function isNumberKeyWithDot(e) {
    var t = e.which ? e.which : event.keyCode;
    return t >= 48 && 57 >= t || 46 == t || 8 == t ? !0 : !1
}

//Function for non numeric text (allow special characters)
$(document).on('keypress', '.non_numeric_list', function (e) {
    var regex = new RegExp("^[0-9 \b]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed == 46)
        e.preventDefault();
    if (regex.test(str)) {
        e.preventDefault();
    }
});

//Function for non numeric text (allow special characters except space)
$(document).on('keypress', '.non_numeric_withoutspace_list', function (e) {
    var regex = new RegExp("^[0-9 \b]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed == 46)
        return true;
    if (regex.test(str)) {
        e.preventDefault();
    }
});

//Function for non numeric text (do not allow special characters)
$(document).on('keypress', '.only_alpha_list', function (e) {
    var regex = new RegExp("^[0-9 \b `~!@#$%\^&*()-_+={};:'?/.><, |\"\\\[\]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        e.preventDefault();
    }
});

//Function for non numeric text (allow space)
$(document).on('keypress', '.alpha_with_space_list', function (e) {
    var regex = new RegExp("^[ a-zA-Z\s\b]*$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed == 46)
        return true;
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
});

//Function for alpha numeric with "_" allowed

$(document).on('keypress', '.alpha_without_special', function (e) {
    var regex = new RegExp("^[A-Za-z0-9_\b]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed == 46)
        return true;
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
});

//Function for alpha numeric with " " allowed
$(document).on('keypress', '.alphanumeric_with_space', function (e) {
    var regex = new RegExp("^[ A-Za-z0-9\b]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed == 46)
        return true;
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
});

//Function for only alpha without space
$(document).on('keypress', '.only_alpha_list_without_space', function (e) {
    var regex = new RegExp("^[0-9 `~!@#$%\^&*()-_+={};:'?/.><, |\"\\\[\]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed != 46 && regex.test(str)) {
        e.preventDefault();
    }
});

//Function for only alpha with space
$(document).on('keypress', '.only_alpha_list_with_space', function (e) {
    var regex = new RegExp("^[0-9`~!@#$%\^&*()-_+={};:'?/.><,|\"\\\[\]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    var keypressed = e.which || e.keyCode;
    if (keypressed != 46 && regex.test(str)) {
        e.preventDefault();
    }
});

// Function to validate date
function ValidateDate(dtValue, dtString) {
    return moment(dtValue, ['' + dtString + ''], true).isValid();
}

// Only to be used if height and width of inline dialog needs to be changed.
function openInlineDialog(pInlineDialogId, pWidth, pHeight) {
    try {
        if (pHeight && $.isNumeric(pHeight)) {
            var calc_heigth = (screen.height * (pHeight / 100)).toFixed(0);
            if ($("#" + pInlineDialogId).hasClass("js-regionPopup")) {
                $("#" + pInlineDialogId).popup({
                    height: calc_heigth,
                });
            } else {
                $("#" + pInlineDialogId).dialog({
                    height: calc_heigth,
                });
            }
        }
        if (pWidth && $.isNumeric(pWidth)) {
            var calc_width = (screen.width * (pWidth / 100)).toFixed(0);
            if ($("#" + pInlineDialogId).hasClass("js-regionPopup")) {
                $("#" + pInlineDialogId).popup({
                    width: calc_width,
                });
            } else {
                $("#" + pInlineDialogId).dialog({
                    width: calc_width,
                });
            }
        }
        apex.theme.openRegion(pInlineDialogId);
    } catch (err) {
        console.log(err);
    }
}

function closeInlineDialog(pInlineDialogId) {
    try {
        apex.theme.closeRegion(pInlineDialogId);
    } catch (err) {
        console.log(err);
    }
}

function get_global_ind_values(p_ind) {
    var return_result;

    apex.server.process
        (
            'GET_GLOBAL_IND_VAL', {
            x01: p_ind
        }, {
            dataType: 'text',
            async: false,
            success: function (pData) {
                return_result = pData;
            }
        });
    return return_result;
}

function get_message(var1, var2, var3, var4) {
    var return_result;
    SetAllMessages();
    return_result = apex.lang.getMessage(var1).replace("%s1", var2).replace("%s2", var3).replace("%s3", var4);
    return return_result;
}

//allow negetive and positive numbers with Float only

$('.numeric_pos_neg_list').on('input', function () {
    this.value = this.value.replace(/(?!^-)[^0-9.]/g, "").replace(/(\..*)\./g, '$1');
});

// New File Uploading process without using temp files

function clob2Array(clob, size, array) {
    loopCount = Math.floor(clob.length / size) + 1;
    for (var i = 0; i < loopCount; i++) {
        array.push(clob.slice(size * i, size * (i + 1)));
    }
    return array;
}

function SetAllMessages() {
    var allMessages = sessionStorage.getItem(messageKey);
    if (typeof allMessages === 'undefined' || allMessages == null || allMessages == 'null') {
        apex.server.process
            (
                'GET_ALL_MESSAGES', {}, {
                dataType: 'text',
                async: false,
                success: function (pData) {
                    allMessages = pData;
                    sessionStorage.setItem(messageKey, allMessages);
                    apex.lang.addMessages(JSON.parse(allMessages));
                }
            });
    } else {
        apex.lang.addMessages(JSON.parse(allMessages));
    }
}

function DeleteAllMessages() {
    sessionStorage.removeItem(messageKey);
}

function binaryArray2base64(int8Array) {
    var data = "";
    var bytes = new Uint8Array(int8Array);
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
        data += String.fromCharCode(bytes[i]);
    }
    return btoa(data);
}

async function upload_files(pFileBrowseItem, pFileIndex, p_successCallback, p_failCallback, p_deleteOld) {
    //Shobhit, Added p_deleteOld indicator to handle upload with multiple file browser items at once
    var fileInputElem = document.getElementById(pFileBrowseItem);
    var reader = new FileReader();
    var FileIndex;

    if (typeof pFileIndex === "undefined" || pFileIndex == "")
        FileIndex = 0;
    else
        FileIndex = pFileIndex;

    var file = fileInputElem.files[FileIndex];

    reader.onload = (function (pFile) {
        return function (event) {
            if (pFile) {
                var f01Array;
                var base64 = binaryArray2base64(event.target.result);
                f01Array = apex.server.chunk(base64);

                if (!Array.isArray(f01Array)) {
                    f01Array = [f01Array];
                }

                var DeleteOld;

                if (FileIndex == 0 && p_deleteOld !== "N")
                    DeleteOld = 'Y';
                else
                    DeleteOld = 'N';

                apex.server.process(
                    'AX_UPLOAD_FILES', {
                    x01: file.name,
                    x02: file.type,
                    x03: DeleteOld,
                    f01: f01Array
                }, {
                    dataType: 'json',
                    success: function (data) {
                        if (data.result == 'success') {
                            FileIndex++;
                            if (FileIndex < fileInputElem.files.length) {
                                // start uploading the next file
                                upload_files(pFileBrowseItem, FileIndex, p_successCallback, p_failCallback);
                            } else {
                                FileIndex = 0;
                                fileInputElem.value = '';
                                if (typeof p_successCallback === 'function') {
                                    p_successCallback();
                                }
                            }
                        } else {
                            apex.message.clearErrors();

                            apex.message.showErrors([{
                                type: "error",
                                location: ["page"],
                                message: data.error,
                                unsafe: false
                            }
                            ]);
                            if (typeof p_failCallback === 'function') {
                                p_failCallback();
                            }
                        }
                        removeLoadingIndicator(regionloadWait);
                    }
                });
            }
        }
    })(file);
    if (fileInputElem.files.length > 0) {
        reader.readAsArrayBuffer(file);
    } else
        console.log('Nothing to read');
}

function mass_upld_file(pItem, pUpldType) {
    upload_files(pItem, 0, function () {
        apex.server.process(
            'MASS_UPLD_UPLOAD_FILE', {
            x01: pUpldType
        }, {
            dataType: 'json',
            success: function (data) {
                console.log(data);
                apex.message.clearErrors();
                if (data.result == 'success') {
                    apex.message.showPageSuccess('&IMP_SUCCESS_MSG.');
                    apex.region("ig_buffer_stock").refresh();
                } else if (data.result == 'download') {
                    apex.message.showErrors({
                        type: "error",
                        location: "page",
                        message: get_message('IMPORT_RECORD_FAILURE'),
                        unsafe: false
                    });

                    apex.navigation.redirect(data.redirectURL);
                } else {
                    apex.message.showErrors([{
                        type: "error",
                        location: ["page"],
                        message: data.error,
                        unsafe: false
                    }
                    ]);
                }
            },
            loadingIndicatorPosition: "page"
        });
    });
}

//Format manual entry of date picker item
$(document).on('change', '.apex-item-datepicker-jet', function (e) {
    console.log(this);
    var date_val = apex.item(this.id).getValue();
    var date_time_picker = $(this).attr('time-picker.time-increment');
    if (date_val !== null && date_val !== '' && !date_time_picker) {
        if (ValidateDate(date_val, inputDateFormat)) {
            var date_string = moment(date_val.replace(/\\/g, ''), inputDateFormat).format(jsDateFormat);
            apex.item(this.id).setValue(date_string);
        } else if (!ValidateDate(date_val, jsDateFormat)) {
            apex.item(this.id).setValue('');
            alert(get_message('INVALID_INPUT_DATE_FORMAT', inputDateFormat));
        }
    }
});

function appendToDialogTitle(pClassSelector, pFindChar, pText) {
    var pageTitle = apex.util.getTopApex().jQuery("." + pClassSelector + " .ui-dialog-title").text();
    if (pageTitle.indexOf(pFindChar)
        > -1) {
        pageTitle = pageTitle.substr(0, pageTitle.indexOf(pFindChar));
    }

    apex.util.getTopApex().jQuery("." + pClassSelector + " .ui-dialog-title").text(pageTitle + pText);

}

// Common function to replicate click function passing selector attrib and selector value
function invoke_click(p_selector, p_selector_value) {
    $('[' + p_selector + '=' + p_selector_value + ']').click();
}

// Common function to replicate click for file uploader new item
function openFilePicker(p_selector_value) {
    $("#" + p_selector_value + "_input").click();
}

// Process to add Download Icon to each Interactive Report
function addDownloadXLSXIcon(p_selector_id, p_region_id, p_image_path) {
    $('body').on("dialogopen", function (event, ui) {
        if ($('div.a-IRR-dialog span.ui-dialog-title').text() === apex.lang.getMessage("APEXIR_DOWNLOAD")) {
            var $dialog_window = $(event.target);
            var current_region_id = $dialog_window.attr('id').match(/(.+)_dialog_js/)[1];
            var re = new RegExp(p_selector_id, 'g');

            if (!p_selector_id || current_region_id.match(re) != null) {
                $dialog_window.find('table.a-IRR-dialogTable tbody td a').closest('tr').append('<td nowrap="nowrap"><a href="javascript:get_ir_xlsx(' + "'" + p_region_id + "'" + ')"><img src="' + p_image_path + 'ws/download_xls_64x64.gif" alt="XLSX" title="XLSX"></a></td>');
                $dialog_window.find('table.a-IRR-dialogTable tbody td span').closest('tr').append('<td align="center" nowrap="nowrap"><span>XLSX</span></td></tr>');
                $dialog_window.find('table.a-IRR-dialogTable tbody tr td a').closest('tr').find('td:last-child').prev().remove();
                $dialog_window.find('table.a-IRR-dialogTable tbody tr tr td span').closest('tr').find('td:last-child').prev().remove();
            }
        }
    });
}

// Submit Request with IR[Region_ID]_XLSX
function get_ir_xlsx(p_region_id) {
    apex.server.process(
        "PREPARE_XLSX_URL", {
        x01: $('#pFlowId').val(),
        x02: $('#pFlowStepId').val(),
        x03: $('#pInstance').val(),
        x04: $('#pdebug').val(),
        x05: 'IR[' + p_region_id + ']_XLSX'
    }, {
        dataType: "text",
        success: function (data) {
            apex.navigation.redirect(data);
        }
    });
}
