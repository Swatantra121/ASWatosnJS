//Construct HTML to emulate standard success message alert
var successHTML = '<div class="t-Body-alert" id="customSuccessMessage"><div class="t-Alert t-Alert--defaultIcons t-Alert--success t-Alert--horizontal t-Alert--page t-Alert--colorBG is-visible" id="t_Alert_Success" role="alert"><div class="t-Alert-wrap"><div class="t-Alert-icon"><span class="t-Icon"></span></div><div class="t-Alert-content"><div class="t-Alert-header"><h2 class="t-Alert-title">#CUSTOM_SUCCESS_MESSAGE#</h2></div></div><div class="t-Alert-buttons"><a href="javascript:void(0);" onclick="$(\'#customSuccessMessage\').remove();" class="t-Button t-Button--noUI t-Button--icon t-Button--closeAlert" type="button" title="Close"><span class="t-Icon icon-close"></span></a></div></div></div></div>';

//Construct HTML to emulate standard success message alert
var failureHTML = '<div class="t-Body-alert" id="customFailureMessage"><div class="t-Alert t-Alert--defaultIcons t-Alert--success t-Alert--horizontal t-Alert--page t-Alert--colorBG is-visible" style="background-color:crimson" id="t_Alert_Success" role="alert"><div class="t-Alert-wrap"><div class="t-Alert-icon1"><span class="t-Icon"></span></div><div class="t-Alert-content"><div class="t-Alert-header"><h2 class="t-Alert-title">#CUSTOM_FAILURE_MESSAGE#</h2></div></div><div class="t-Alert-buttons"><a href="javascript:void(0);" onclick="$(\'#customFailureMessage\').remove();" class="t-Button t-Button--noUI t-Button--icon t-Button--closeAlert" type="button" title="Close"><span class="t-Icon icon-close"></span></a></div></div></div></div>';

// Function to set the meterage format in HTML, but not in download XLS
function set_meterage_format(class_name, format) {
	$('.' + class_name).each(function (index) {
		var meterage = $(this).html();
		if (meterage.trim() != '')
			$(this).html(parseFloat(meterage).toFixed(format.split('D')[1].length));
	});
}

// Function to highlight cell on click
/*function highlight_cell(p_this, p_static_id) {
	var current_table = '#' + p_static_id + ' td';
	$(current_table).removeClass('highlight_current');
	$(p_this).parent().addClass('highlight_current');
    $(p_this).parent().removeClass('is-readonly');
    $(p_this).parent().removeAttr("style");
}*/
function highlight_cell(p_this, p_static_id) {
	var current_table = '#' + p_static_id + ' td';
	$(current_table).removeClass('highlight_current');
	$(p_this).parent().addClass('highlight_current');
}

// Function to higlight row on anchor click
function highlight_row(p_this, p_static_id) {
	var current_table = '#' + p_static_id + ' td';
	$(current_table).removeClass('highlight_current');
	$(p_this).closest('tr').find('td').addClass('highlight_current');
}

// To Center Align Interactive Report filters on action menu popup. If condition for making height and width larger in case of Actions -> Filters, and else for everything except this.
apex.jQuery("body").on("dialogopen", ".a-IRR-dialog", function (event, ui) {
	$(this).css("min-width", "30vw").css("min-height", "47vh").css("top", "25%").css("left", "50%").css("margin-left", "-20%");
	$(this).find('.a-IRR-dialogBody').css("min-height", "42vh");
});

// Disable specific keyboard key
function disable_char(pKey, pClass) {
	$('.' + pClass).keypress(function (e) {
		if ((e.keyCode || e.which) == pKey) {
			e.preventDefault();
		}
	});
}

// Common function to replace space and new lines to comma
function replaceSpaceNewline(p_str, p_Id) {
	$('.' + p_Id).val(p_str.replace(/\s/g, ",").replace(/\n/g, ",").replace(/,\s*$/, ''));
}

// Common function for calling saved report through javascript
function trigger_ir_report() {
	var item_name = 'P' + $('#pFlowStepId').val() + '_REPORT_TYPE';
	var report_type = apex.item(item_name).getValue().split('$$$')[0];
	var static_id = '#' + apex.item(item_name).getValue().split('$$$')[1] + '_saved_reports';
	$(static_id).val(report_type).trigger('change');
}

function export_manual_ig_report(p_app_id, p_page_id, p_session, p_ig_static_id) {
	apex.navigation.redirect('f?p=' + p_app_id + ':0:' + p_session + ':APPLICATION_PROCESS=DOWNLOAD_IG_XLSX:::AI_REGION_ID_XLSX,AI_PAGE_ID_XLSX:' + p_ig_static_id + ',' + p_page_id);
}
