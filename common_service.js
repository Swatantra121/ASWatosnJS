/* File for uploading multiple AJAX requests for dynamic PDF's */
var requestSubTimer;
var requestSubTimerEnabled = false;
window.clearInterval(requestSubTimer);

apex.server.process
(
	'GET_SERVICE_REQUEST_STATUS', {}, {
	dataType: 'text',
	success: function (pData) {
		if ($.trim(pData) > 0 && (!$("body").hasClass("t-Dialog-page"))) {
			if (!requestSubTimerEnabled) {
				requestSubTimerEnabled = true;
				requestSubTimer = window.setInterval(function () {
						apex_process();
					}, 3000);
			} else
				apex_process();
		}
	}
});

function apex_process() {
	apex.server.process
	(
		'GET_SERVICE_REQUEST_STATUS', {}, {
		dataType: 'text',
		success: function (pData) {
			if ($.trim(pData) == 0) {
				alert(get_message('ALL_REQ_SUBMIT'));
				if (requestSubTimerEnabled) {
					requestSubTimerEnabled = false;
					window.clearInterval(requestSubTimer);
				}
				if (typeof reset_item != 'undefined' && $.isFunction(reset_item))
					reset_item();
			}
		}
	});
}