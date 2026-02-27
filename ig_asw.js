function enable_fetch_all() {
    $('.a-IG-gridView').find('.a-GV-hdr').find('.a-GV-header.a-GV-selHeader').on('click', function () {
        var ig_name = $(this).closest('.t-IRR-region').attr('id');
        if (apex.region(ig_name).widget().interactiveGrid("getViews", "grid").model.getTotalRecords() < 5000 && apex.region(ig_name).widget().interactiveGrid("getViews", "grid").view$.grid('option', 'persistSelection')) {
            apex.region(ig_name).widget().interactiveGrid("getViews", "grid").view$.grid("fetchAllData");
        }
    });
}

function enable_only_row_selector(pRegionStaticId) {
    let gridViewInstance = apex.region(pRegionStaticId).widget().interactiveGrid("getViews").grid.view$.grid("instance");

    (function () {
        const origSelect = gridViewInstance._select;

        gridViewInstance._select = function (...args) {
            const cell$ = args[0];
            const doSelect = args[3];

            // Allow: click on select-all checkbox in header
            if (cell$ && cell$.hasClass("a-GV-selHeader")) {
                return origSelect.apply(this, args);
            }

            // Allow: "deselect all" programmatically
            if ((!cell$ || cell$.length === 0) && doSelect === false) {
                return origSelect.apply(this, args);
            }

            // Block all other selection changes (e.g. keyboard or cell click)
            return false;
        };
    })();
}

function resetDefaultToggleState(pRegionStaticId, pDefaultState) {
    if (pDefaultState != $("#" + pRegionStaticId + "_ig_toolbar_toggle_filter_data").parent().children('label').hasClass('is-active')) {
        $("#" + pRegionStaticId + "_ig_toolbar_toggle_filter_data").click();
    }
}

function add_error(model, regionStaticId, precordId, recordId, pcolumnName, columnName, message, arrayErrors) {
    var currentError = {};
    currentError.type = "error";
    currentError.location = "page";
    currentError.message = message;
    currentError.regionStaticId = regionStaticId;
    currentError.recordId = precordId;
    currentError.columnName = pcolumnName;
    currentError.unsafe = false;
    arrayErrors.push(currentError);
    model.setValidity("error", recordId, columnName, message);
}

function invokeIGSave(pRegionStaticId, successCallback, failureCallback) {
    apex.message.clearErrors();
    if (apex.region(pRegionStaticId).widget().interactiveGrid("getViews").grid.model.isChanged()) {
        apex.region(pRegionStaticId).widget().interactiveGrid("getViews").grid.model.save().done(function () {
            apex.message.showPageSuccess(apex.lang.getMessage('APEX.IG.CHANGES_SAVED'));
            if (typeof successCallback === 'function') {
                successCallback();
            }
        }).fail(function (err) {
            apex.message.showErrors(err);
            if (typeof failureCallback === 'function') {
                failureCallback();
            }
        });
    } else
        if (typeof successCallback === 'function') {
            successCallback();
        }
}

function hideshowIGColumns(igName, pArrCol) {
    $.each(pArrCol, function (key, value) {
        apex.region(igName).widget().interactiveGrid("getViews").grid.curInst.options.columns[0][pArrCol[key].pColumn].hidden = pArrCol[key].pFlag;
    });
    apex.region(igName).widget().interactiveGrid("getViews").grid.curInst._refreshGrid();
}

function init_ig(config, p_persistSelection = true, p_pkItemName = 'P0_SELECTED_RECORDS') {

    var toolbarData = apex.jQuery.apex.interactiveGrid.copyDefaultToolbar();
    var toolbarGroup = toolbarData.toolbarFind("actions1");

    // add a filter button after the actions menu
    if (typeof config.features !== 'undefined' && typeof config.features.download !== 'undefined') {
        if (jQuery.inArray("XLSX", config.features.download.formats) !== -1) {
            toolbarGroup.controls.push({
                type: "BUTTON",
                action: "export_custom",
                hot: true,
                iconBeforeLabel: true
            });
            toolbarData.toolbarRemove("show-download-dialog");
        }
    }

    var group = toolbarData.toolbarFind("actions2");
    group.controls.shift();
    config.toolbarData = toolbarData;

    config.defaultGridViewOptions = {
        selectionStateItem: p_pkItemName,
        persistSelection: p_persistSelection
    }

    return config;
}

/*
function init_ig(config) {
var toolbarData = apex.jQuery.apex.interactiveGrid.copyDefaultToolbar();
var toolbarGroup = toolbarData.toolbarFind("actions1");
// add a filter button after the actions menu
if (typeof config.features !== 'undefined' && typeof config.features.download !== 'undefined') {
if (jQuery.inArray("XLSX", config.features.download.formats) !== -1) {
toolbarGroup.controls.push({
type: "BUTTON",
action: "export_custom",
hot: true,
iconBeforeLabel: true
});
toolbarData.toolbarRemove("show-download-dialog");
}
}
var group = toolbarData.toolbarFind("actions2");
group.controls.shift();
config.toolbarData = toolbarData;
return config;
}*/
function add_buttons_inside_ig(config, buttonsJSON) {
    var ig_regionStaticId = config.regionStaticId;
    var ig_regionId = config.regionStaticId;
    var toolbarData = config.toolbarData;
    if (buttonsJSON.length > 0) {
        $.each(buttonsJSON.reverse(), function (key, value) {
            var toolbarGroup = toolbarData.toolbarFind(value.action_group);
            if (value.type == 'BUTTON') {
                toolbarGroup.controls.unshift({
                    type: "BUTTON",
                    action: value.action,
                    hot: value.hot,
                    iconBeforeLabel: value.iconBeforeLabel
                });
            } else if (value.type == 'RADIO_GROUP') {
                toolbarGroup.controls.unshift({
                    type: "RADIO_GROUP",
                    id: value.id,
                    action: value.action,
                    hot: value.hot
                });
            } else if (value.type == 'TOGGLE') {
                toolbarGroup.controls.unshift({
                    type: "TOGGLE",
                    id: value.id,
                    action: value.action,
                    choices: value.choices
                });
            } else if (value.type == 'MENU') {
                toolbarGroup.controls.unshift({
                    type: "MENU",
                    id: value.id,
                    hot: value.hot,
                    iconBeforeLabel: value.iconBeforeLabel,
                    labelKey: value.label,
                    menu: JSON.parse(value.choices)
                });
            } else {
                toolbarGroup.controls.unshift({
                    type: "SELECT",
                    id: value.id,
                    action: value.action
                });
            }
        });
    }
    config.toolbarData = toolbarData;
    config.initActions = function (actions) {
        if (typeof config.features !== 'undefined' && typeof config.features.download !== 'undefined') {
            if (jQuery.inArray("XLSX", config.features.download.formats) !== -1) {
                actions.add({
                    name: 'export_custom',
                    label: get_message('IG_BTN_DOWNLOAD'),
                    icon: 'fa fa-download',
                    action: function (event, focusElement) {
                        $.event.trigger('EXPORT_CUSTOM_XLSX', {
                            'regionId': config.regionId,
                            'regionStaticId': config.regionStaticId,
                            'baseReport': 'N'
                        });
                    }

                });
            }
        }
        if (buttonsJSON.length > 0) {
            $.each(buttonsJSON, function (key, value) {
                if (value.type == 'TOGGLE') {
                    var p_label = '';
                    var p_state = false;
                    var p_choices = JSON.parse(value.choices);
                    p_choices.forEach(function (val, index) {
                        if (val.default) {
                            p_label = val.label;
                            p_state = val.value;
                            return false;
                        }
                    });
                    if (p_label == '')
                        p_label = value.label;

                    actions.add({
                        name: value.action,
                        label: p_label,
                        state: p_state,
                        get: function () {
                            return this.state;
                        },
                        set: function (v) {
                            this.state = v;
                            var p_label = this.label;
                            var choices = eval("value.choices");
                            if (choices != '') {
                                JSON.parse(choices).forEach(function (val, index) {
                                    if (val.value == v) {
                                        p_label = val.label;
                                        if (val.style !== '') {
                                            if (ig_regionStaticId != '') {
                                                $("#" + ig_regionStaticId + "_ig_toolbar_" + value.id).parent().children('label').attr('style', val.style);

                                            } else {
                                                $("#R" + ig_regionId + "_ig_toolbar_" + value.id).parent().children('label').attr('style', val.style);
                                            }
                                        }
                                        return false;
                                    }
                                });
                                this.label = p_label;
                            }
                        }
                    });
                } else if (value.type == 'MENU') {
                    var p_choices = JSON.parse(value.choices);
                    $.each(p_choices.items, function (lkey, lvalue) {
                        actions.add({
                            name: lvalue.action,
                            label: lvalue.label,
                            icon: lvalue.icon,
                            action: function (event, focusElement) {
                                $.event.trigger(lvalue.action);
                            }
                        });
                    });
                } else if (value.type == 'SELECT') {
                    actions.add({
                        name: value.action,
                        choices: JSON.parse(value.choices),
                        action: function (event, focusElement) {
                            $.event.trigger(value.event);
                        }
                    });
                } else if (value.type == 'RADIO_GROUP') {
                    actions.add({
                        name: value.action,
                        choices: JSON.parse(value.choices),
                        action: function (event, focusElement) {
                            if (value.redirect_static_id != '') {
                                $s(value.redirect_static_id, focusElement.value);
                            }
                            if (value.event != '')
                                $.event.trigger(value.event);
                        }
                    });

                    // Update Radio selection on change of values
                    if (value.redirect_static_id != '') {
                        $('#' + value.redirect_static_id).change(function (event) {
                            if (ig_regionStaticId != '') {
                                $("input:radio[name=" + ig_regionStaticId + "_ig_toolbar_" + value.action + "][value=" + $v(value.redirect_static_id) + "]").prop("checked", true);
                                apex.region(ig_regionStaticId).refresh();
                            } else {
                                $("input:radio[name=R" + ig_regionId + "_ig_toolbar_" + value.action + "][value=" + $v(value.redirect_static_id) + "]").prop("checked", true);
                                apex.region('R' + ig_regionId).refresh();
                            }

                        });

                        $('#' + value.redirect_static_id).ready(function () {
                            if (ig_regionStaticId != '') {
                                $("input:radio[name=" + ig_regionStaticId + "_ig_toolbar_" + value.action + "][value=" + $v(value.redirect_static_id) + "]").prop("checked", true);
                            } else {
                                $("input:radio[name=R" + ig_regionId + "_ig_toolbar_" + value.action + "][value=" + $v(value.redirect_static_id) + "]").prop("checked", true);
                            }
                        });

                    }
                } else if (typeof (value.redirect_static_id) === 'undefined' || value.redirect_static_id == '') {
                    actions.add({
                        name: value.action,
                        label: value.label,
                        icon: value.icon,
                        action: function (event, focusElement) {
                            $.event.trigger(value.event);
                        }
                    });
                } else {
                    var static_id = '#' + value.redirect_static_id;
                    actions.add({
                        name: value.action,
                        label: value.label,
                        icon: value.icon,
                        action: function (event, focusElement) {
                            $(static_id).trigger("click");
                        }
                    });
                }
            });
        }
    }

    return config;
};

function add_filter_toggle(buttonsJSON, pDefault, p_action_group) {
    var p_label_text = get_message('IG_BTN_SELECT_ALL');
    var p_label;
    var choices = '[{"label":"' + p_label_text + '","style":"font-weight: bold;" , "value":true';
    if (pDefault) {
        p_label = p_label_text;
        choices = choices + ',"default":true';
    }

    choices = choices + '},{"label":"' + p_label_text + '","style":" " , "value":false';
    if (!pDefault) {
        p_label = p_label_text;
        choices = choices + ',"default":true';
    }

    choices = choices + '}]';
    add_button_to_json(buttonsJSON, 'toggle_data', p_label, '', '', '', '', '', 'TOGGLE', 'toggle_filter_data', choices, p_action_group);
    return buttonsJSON;
}

function add_button_to_json(buttonsJSON, p_action, p_label, p_hot, p_iconBeforeLabel, p_icon, p_event, p_redirect_static_id, p_type, p_id, p_choices, p_action_group) {
    console.log(p_label, p_redirect_static_id);
    var tempJSON = {};
    tempJSON["action"] = p_action;
    tempJSON["label"] = p_label;
    tempJSON["hot"] = p_hot;
    tempJSON["iconBeforeLabel"] = p_iconBeforeLabel;
    tempJSON["icon"] = p_icon;
    tempJSON["event"] = p_event;
    tempJSON["redirect_static_id"] = p_redirect_static_id;
    tempJSON["id"] = p_id;
    tempJSON["choices"] = p_choices;
    if (typeof (p_type) !== 'undefined' && p_type !== '')
        tempJSON["type"] = p_type;
    else
        tempJSON["type"] = 'BUTTON';
    if (typeof (p_action_group) !== 'undefined' && p_action_group !== '')
        tempJSON["action_group"] = p_action_group;
    else
        tempJSON["action_group"] = "actions4";

    buttonsJSON.push(tempJSON);
    return buttonsJSON;
}

var deferredObj;

//selectAll only selects render data but not full data. Therefore nextpage is required to do the rendering before selecting all.
function loadBatchOfRecords(igName) {
    function checkifpagechanged(igName, timerId) {
        if (apex.region(igName).call("getViews").grid.view$.data("apex-grid").onLastPage) {
            clearInterval(timerId);
            apex.region(igName).widget().interactiveGrid("getViews", "grid").view$.grid("selectAll");
            apex.region(igName).widget().interactiveGrid("getViews", "grid").view$.grid("firstPage");
            removeLoadingIndicator(regionloadWait);
            deferredObj.resolve();
            return deferredObj.promise();
        } else if (apex.region(igName).call("getViews").grid.view$.data("apex-grid").scrollPageTimer == null) {
            //} else if (!apex.region(igName).call("getViews").grid.view$.data("apex-grid").renderInProgress) {
            clearInterval(timerId);
            loadBatchOfRecords(igName);
        }
    }
    apex.region(igName).widget().interactiveGrid("getViews", "grid").view$.grid("nextPage");
    let timerId = setInterval(() => checkifpagechanged(igName, timerId), 10);

}

function loadAllRecords(igName, SelectAllRec, successCallback) {
    deferredObj = $.Deferred();
    addLoadingIndicator();
    apex.region(igName).widget().interactiveGrid("getViews", "grid").view$.grid("firstPage");
    function ModelLoaded(igName, timerId) {
        if (apex.region(igName).widget().interactiveGrid("getViews").grid.model._haveAllData) {
            clearInterval(timerId);
            if (SelectAllRec) {
                // if select all, then navigate to each page first before performing select all
                apex.region(igName).widget().interactiveGrid("getViews", "grid").view$.grid("firstPage");
                loadBatchOfRecords(igName);
            } else {
                removeLoadingIndicator(regionloadWait);
                deferredObj.resolve();
                if (typeof successCallback === 'function') {
                    successCallback();
                }
                return deferredObj.promise();
            }
        }
    }
    if (apex.region(igName).widget().interactiveGrid("getViews").grid) {
        // If model is not loaded with full data, load model completely
        if (!apex.region(igName).widget().interactiveGrid("getViews").grid.model._haveAllData) {
            apex.region(igName).widget().interactiveGrid("getViews").grid.model.fetchAll(function () { });
        }
        let timerId = setInterval(() => ModelLoaded(igName, timerId), 10);
    }
}

function SelecttoJSON(igName) {
    var records = apex.region(igName).widget().interactiveGrid("getViews", "grid").view$.grid("getSelectedRecords");
    var keyindex = {};
    $.each(apex.region(igName).widget().interactiveGrid("getViews").grid.modelColumns, function (k, v) {
        $.each(this, function (key, value) {
            if (key == 'index') {
                if (apex.region(igName).widget().interactiveGrid("getViews").grid.model.isIdentityField(k)) {
                    keyindex[k] = value;
                }
            }
        });

    });

    $.each(apex.region(igName).widget().interactiveGrid("getViews").grid.getColumns(), function (colIndex, columnInfo) {
        if ((typeof columnInfo.index !== "undefined") && ((!columnInfo.readonly && (typeof columnInfo.readonly !== "undefined")) || apex.region(igName).widget().interactiveGrid("getViews").grid.model.isIdentityField(columnInfo.index) || columnInfo.index === 0)) {
            keyindex[columnInfo.property] = columnInfo.index;
        }
    });

    var AllRecords = [];
    var jsonObj;
    $.each(records, function (RecNo, values) {
        var CurrentItems = {};
        $.each(values, function (index, value) {
            $.each(keyindex, function (pkColumn, pkIndex) {
                if (index == pkIndex) {
                    if (typeof value == 'object') {
                        CurrentItems[pkColumn] = value.v;
                    } else {
                        CurrentItems[pkColumn] = value;
                    }
                }
            });

        });
        AllRecords.push(CurrentItems);
    });
    var json = JSON.stringify(AllRecords);
    return json;
}

function SelecttoCollection(igName) {
    addLoadingIndicator();
    var jsonclob = SelecttoJSON(igName);
    apex.server.process(
        'AX_SELECT_TO_COLLECTION', {
        x01: igName,
        p_clob_01: jsonclob
    }, {
        dataType: 'text',
        success: function (pData) {
            if ($.trim(pData) != '') {
                removeLoadingIndicator(regionloadWait);
                apex.message.clearErrors();
                apex.message.showErrors(
                    [{
                        "type": "error",
                        "location": "page",
                        "message": pData
                    }
                    ]);
            } else {
                removeLoadingIndicator(regionloadWait);
            }
        }
    });
}

// Only add XLSX to IG, if button is also added then use method add_buttons_inside_ig
function add_xlsx_only_ig(config) {
    if (typeof config.features !== 'undefined' && typeof config.features.download !== 'undefined') {
        if (jQuery.inArray("XLSX", config.features.download.formats) !== -1) {
            config.initActions = function (actions) {
                actions.add({
                    name: 'export_custom',
                    label: get_message('IG_BTN_DOWNLOAD'),
                    icon: 'fa fa-download',
                    action: function (event, focusElement) {
                        $.event.trigger('EXPORT_CUSTOM_XLSX', {
                            'regionId': config.regionId,
                            'regionStaticId': config.regionStaticId,
                            'baseReport': 'N'
                        });
                    }
                });
            }
        }
    }
    return config;
};

// Adding IG Filters programatically
function addIGFilter(p_ig_region_id, p_column_name, p_operator_name, p_value, p_is_case_sensitive) {
    apex.region(p_ig_region_id).widget().interactiveGrid("addFilter", {
        type: 'column',
        columnType: 'column',
        columnName: p_column_name.toUpperCase(),
        operator: p_operator_name,
        value: p_value,
        isCaseSensitive: p_is_case_sensitive
    });
}

// Deleting all IG Filters programatically
function deleteIGFilter(p_ig_region_id) {
    $.each(apex.region(p_ig_region_id).widget().interactiveGrid("getFilters"), function (key, value) {
        apex.region(p_ig_region_id).widget().interactiveGrid("deleteFilter", $(this)[0].id);
    });
}

// Check if at least 1 row exists or not in IG
function ig_row_exists(p_ig_static_id) {
    var model = apex.region(p_ig_static_id).widget().interactiveGrid("getViews", "grid").model;
    var l_count = 0;
    var l_totalRecords = model.getTotalRecords();
    var l_deletedRecords = 0;

    model.forEach(function (r) {
        l_count = l_count + 1;
    });
    model.forEach(function (record, index, id) {
        if (model.getRecordMetadata(id).deleted)
            l_deletedRecords = l_deletedRecords + 1;
    });
    l_deletedRecords = l_totalRecords - l_deletedRecords;

    if (l_count == 0 || l_deletedRecords == 0) {
        return false;
    } else {
        return true;
    }
}

// Return rowcount after removing deleted records
function ig_fetch_row_count(p_ig_static_id) {
    var model = apex.region(p_ig_static_id).widget().interactiveGrid("getViews", "grid").model;
    var l_count = 0;
    var l_totalRecords = model.getTotalRecords();
    var l_deletedRecords = 0;

    model.forEach(function (r) {
        l_count = l_count + 1;
    });
    model.forEach(function (record, index, id) {
        if (model.getRecordMetadata(id).deleted)
            l_deletedRecords = l_deletedRecords + 1;
    });

    return l_totalRecords - l_deletedRecords;
}

// Function to load all records and then mark change ind and submit
function ig_load_add_submit(p_arr_parameters, p_request, p_showWait) {
    var p_count = p_arr_parameters.length;
    var p_local;
    p_local = $.Deferred();
    //Immidiately Resolved because we want promise.done to execute first time
    p_local.resolve();
    p_arr_parameters.forEach(function (p_record, p_index, p_id) {
        p_local.promise().done(function () {
            p_local = $.Deferred();
            var static_id = p_record.static_id;
            var checked = p_record.checked;
            var checkChanged = p_record.checkChanged;
            var columnName = p_record.columnName;
            var columnValue = p_record.columnValue;

            loadAllRecords(static_id, checked);
            deferredObj.promise().done(function () {
                model = apex.region(static_id).widget().interactiveGrid('getViews', 'grid').model;
                if (checkChanged == 'Y' && model.isChanged()) {
                    model.forEach(function (record, index, id) {
                        if (!model.getRecordMetadata(id).deleted)
                            model.setValue(record, columnName, columnValue);
                    });
                } else if (checkChanged == 'N') {
                    model.forEach(function (record, index, id) {
                        if (!model.getRecordMetadata(id).deleted)
                            model.setValue(record, columnName, columnValue);
                    });
                }
                p_count = p_count - 1;
                if (p_request != '' && p_count == 0) {
                    apex.submit({
                        request: p_request,
                        showWait: p_showWait
                    });
                }
                p_local.resolve();
            });
        });
    });

}

function add_records(p_json, p_staticid, p_checked, p_checkChanged, p_columnName, p_columnValue) {
    var item = {}
    item["static_id"] = p_staticid;
    item["checked"] = p_checked;
    item["checkChanged"] = p_checkChanged;
    item["columnName"] = p_columnName;
    item["columnValue"] = p_columnValue;
    p_json.push(item);
    return p_json;
}

function customChecked(pThis, successCallback) {
    if ($(pThis.triggeringElement).hasClass("fa-check-square-o")) {
        $(pThis.triggeringElement).removeClass('fa-check-square-o').addClass('fa-square-o');
        $("span.select_all").removeClass('fa-check-square-o').addClass('fa-square-o');
    } else {
        $(pThis.triggeringElement).removeClass('fa-square-o').addClass('fa-check-square-o');
    }

    if (typeof successCallback === 'function') {
        successCallback();
    }
}

function customPagination(p_staticid, pSelectClass) {
    if ($('#' + p_staticid + '_ig_grid_vc .a-GV-bdy table tbody').find('tr span.fa-check-square-o.' + pSelectClass).length > 0)
        $('#' + p_staticid + '_ig_grid_vc_status').html(apex.lang.formatMessage('APEX.GV.SELECTION_COUNT', $('#' + p_staticid + '_ig_grid_vc .a-GV-bdy table tbody').find('tr span.fa-check-square-o.' + pSelectClass).length));
    else
        $('#' + p_staticid + '_ig_grid_vc_status').html('');
}

function ig_checkAllRecords(pThis, pParamClass, pIgName, pLoadAllRecords, pUpdatePagination) {
    if (pLoadAllRecords) {
        loadAllRecords(pIgName, true);
        deferredObj.promise().done(function () {
            if ($(pThis).hasClass("fa-square-o")) {
                $(pThis).removeClass('fa-square-o').addClass('fa-check-square-o');
                $('.fa-square-o.' + pParamClass).not(".apex_disabled").removeClass('fa-square-o').addClass('fa-check-square-o');
            } else {
                $(pThis).removeClass('fa-check-square-o').addClass('fa-square-o');
                $('.fa-check-square-o.' + pParamClass).not(".apex_disabled").removeClass('fa-check-square-o').addClass('fa-square-o');
            }
            if (pUpdatePagination)
                customPagination(pIgName, pParamClass);
        });
    } else {
        if ($(pThis).hasClass("fa-square-o")) {
            $(pThis).removeClass('fa-square-o').addClass('fa-check-square-o');
            $('.fa-square-o.' + pParamClass).not(".apex_disabled").removeClass('fa-square-o').addClass('fa-check-square-o');
        } else {
            $(pThis).removeClass('fa-check-square-o').addClass('fa-square-o');
            $('.fa-check-square-o.' + pParamClass).not(".apex_disabled").removeClass('fa-check-square-o').addClass('fa-square-o');
        }
        if (pUpdatePagination)
            customPagination(pIgName, pParamClass);
    }
}

function downloadBaseReport(regionStaticId) {
    $.event.trigger('EXPORT_CUSTOM_XLSX', {
        'regionId': apex.region(regionStaticId).call("getViews").grid.model.getOption("regionId"),
        'regionStaticId': regionStaticId,
        'baseReport': 'Y'
    });
}

function checkIGChanged(p_staticid, truefunction, falsefunction, p_message) {
    if (apex.region(p_staticid).widget().interactiveGrid("getViews").grid.model.isChanged()) {
        //Task_29818 - Start
        // ax_message.set({
        //     labels: {
        //         ok: get_message('CONFIRM_BUTTON_OK_TEXT'),
        //         cancel: get_message('CONFIRM_BUTTON_CANCEL_TEXT')
        //     },
        //     buttonReverse: true,
        // });
        //Task_29818 - End
        var message;
        if (typeof p_message !== 'undefined')
            message = p_message;
        else
            message = get_message('WARN_FOR_UNSAVED_CHANGES');

        //Task_29818 - Start
        // ax_message.confirm(message, function (e) {
        //     if (e) {
        //         if (typeof truefunction === 'function') {
        //             truefunction();
        //         }
        //     } else {
        //         if (typeof falsefunction === 'function') {
        //             falsefunction();
        //         }
        //     }
        // });
        confirm(
            message,
            get_message('CONFIRM_BUTTON_OK_TEXT'),
            get_message('CONFIRM_BUTTON_CANCEL_TEXT'),
            function () {
                if (typeof truefunction === 'function') {
                    truefunction();
                }
            },
            function () {
                if (typeof falsefunction === 'function') {
                    falsefunction();
                }
            });
        //Task_29818 - End
    } else {
        if (typeof truefunction === 'function') {
            truefunction();
        }
    }
}

function AutofreezeIG() {
    $('[class*=asw_autofreeze-]').each(function () {
        var IGridId = $(this).attr("id");
        var all_cols = apex.region(IGridId).call("getViews").grid.getColumns();
        var FreezeRaito = parseInt($(this).attr("class").match(/asw_autofreeze-(\d+)/)[1]);
        var i;
        var GridWidth = $('#' + IGridId + '_ig_content_container').width();
        var TotalFreezeWidth = 0;
        var TotalcolWidth = 0;
        //Find Frozen Column total width
        for (i = 0; i < all_cols.length; i++) {
            if (!all_cols[i].hidden) {
                if (all_cols[i].frozen) {
                    TotalFreezeWidth += all_cols[i].curWidth;
                }
                TotalcolWidth += all_cols[i].curWidth;
            }
        }
        apex.debug.info('GridWidth', GridWidth);
        apex.debug.info('TotalFreezeWidth', TotalFreezeWidth);
        apex.debug.info('TotalcolWidth', TotalcolWidth);
        apex.debug.info('FreezeRaito', FreezeRaito);
        if (GridWidth < TotalcolWidth) {
            var currFreezeWidth = 0;
            for (i = 0; i < all_cols.length; i++) {
                if (!all_cols[i].hidden) {
                    currFreezeWidth += all_cols[i].curWidth;
                    if (currFreezeWidth > ((GridWidth * FreezeRaito) / 100)) {
                        if (all_cols[i].frozen) {
                            all_cols[i].frozen = false;
                            apex.debug.info('Unfreeze', all_cols[i].property);
                        }
                    } else {
                        if (!all_cols[i].frozen) {
                            all_cols[i].frozen = true;
                            apex.debug.info('Freeze', all_cols[i].property);
                        }
                    }
                }
            }
            apex.region(IGridId).call("getCurrentView").view$.grid("refreshColumns").grid("refresh");
        }
    })
}

// Function to set Active Text Filter on top of each IRR where modify button is present
function set_filter_criteria(p_search_region, p_report_region) {
    apex.debug.log('Adding Filter Criteria for Search Region ' + p_search_region + ' Report Region ' + p_report_region);
    var id = '';
    var val;
    var filter_text = '';

    $("#" + p_search_region).find("input[type=text],textarea,select,input[type=checkbox]").each(function () {
        val = '';
        if ($(this).prop('nodeName') == 'SELECT') {
            id = '#' + $(this).attr('id');
            if ($(this).prop('type') == 'select-multiple') {
                $(id + ' option:selected').each(function () {
                    val = val + ',' + $(this).text();
                });
                val = val.substr(1, val.length - 1);
            } else {
                if ($(id + ' option:selected').val() != '') {
                    val = $(id + ' option:selected').text();
                }
            }
        } else {
            if ($(this).attr('type') == 'checkbox') {
                id = '#' + $(this).attr('id').replace('_0', '');
                if ($(id + '_0').prop('checked'))
                    val = '<input type="checkbox" disabled checked>';
                else
                    val = '<input type="checkbox" disabled>';
            } else {
                id = '#' + $(this).attr('id');
                val = this.value;
            }
        }

        if ((val != '')) {
            //.clone().children().remove().end() This is done by SUNILB for removing * in mandatory fields which come as (Value Required) in text()
            filter_text = filter_text + ' <b>' + $.trim($(id + '_LABEL').clone().children().remove().end().text()) + ' : </b>' + val;
        }
    });
    if (filter_text != '') {
        filter_text = '<b style="color:#0000FF;">' + apex.lang.getMessage("ACTIVE_FILTER_TEXT") + ':</b> ' + filter_text;
    }
    $('#' + p_report_region + '_filter_criteria').html(filter_text);
}

/*
Example Usage;
Send p_pkItem in case of multiple PK Values '["PORTAL_STORE_POG_DAYS_R","WTCUA"]:["FLOOR_PLAN_LOCK_ALLOWED","WTCUA"]:["IFPC_DS4_MERGED_LINE_SPACE","WTC"]';
Send p_pkItem in case of single PK Values 'REST_TIMEOUT:DEFAULT_AUTH_SCHEMA:BATCH_LOG_FILE_PURGE_DAYS';
*/
async function setSelectedRecordIG(pRegionStaticId) {
    var selectionStateItem = apex.region(pRegionStaticId).widget().interactiveGrid("getViews", "grid").view$.grid("option", 'selectionStateItem');
    var parts = $v(selectionStateItem).split(':');

    await loadAllRecordsIG(pRegionStaticId);

    var result;
    try {
        result = parts.map(function (item) {
            return JSON.parse(item);
        });
    } catch (e) {
        result = parts;
    }

    var finalArr = [];
    var gridView = apex.region(pRegionStaticId).widget().interactiveGrid("getViews", "grid");
    var model = gridView.model;

    result.forEach(function (id) {
        finalArr.push(model.getRecord(id));
    });

    // Clear selection before applying new
    model.clearSelection();

    // SetSelectedRecords seems has bug that it visually selects all but when using getSelectedRecords it 
    // only get first records. Hence calling setSelectedRecords to visually select all Check Boxes
    // and marking setSelectionState to allow getting selected records using getSelectedRecords
    apex.region(pRegionStaticId).widget().interactiveGrid("getViews").grid.view$.grid("setSelectedRecords", finalArr, false);

    result.forEach(function (id) {
        var rec = model.getRecord(id);
        if (rec) {
            var rid = model.getRecordId(rec);
            model.setSelectionState(rid, true, "set");
        }
    });
}

function loadAllRecordsIG(igName) {
    return new Promise(function (resolve, reject) {
        try {
            var gridView = apex.region(igName).widget().interactiveGrid("getViews", "grid");
            var model = gridView.model;

            // Always reset to first page
            gridView.view$.grid("firstPage");

            // fetchAll will keep calling the callback until all pages are done
            model.fetchAll(function (status) {
                // status.done = true when finished
                if (status.done) {
                    resolve();
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}