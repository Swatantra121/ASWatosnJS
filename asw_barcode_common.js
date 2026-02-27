// Check if device has webcam
function detectWebcam(callback) {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices)
        return callback(false);
    md.enumerateDevices().then(devices => {
        callback(devices.some(device => 'videoinput' === device.kind));
    })
}

// Find and attach scanner button for items with asw_barcode class

if (apex.item('P0_DEVICE_OS').getValue() == 'ANDROID') {
    $(".asw_barcode").each(function (index) {
        var p_barcode_item_id = $(this).attr('id');
        $(this).after('<button type="button" id="' + p_barcode_item_id + '_PB" class="t-Button t-Button--noLabel t-Button--icon t-Button--medium t-Button--padLeft t-Button--padRight asw_barcode_pb" ontouchstart="scan_barcode(&apos;' + p_barcode_item_id + '&apos;)" ><span class="t-Icon fa fa-qrcode" aria-hidden="true"></span></button>');

    });
}

// Find and attach QR code scanner button for items which has asw_QRcode class is webcam is available
if ($(".asw_QRcode").length > 0) {
    detectWebcam(function (hasWebcam) {
        if (hasWebcam) {
            $(".asw_QRcode").each(
                function (index) {
                    var p_QRcode_item_id = $(this).attr('id');
                    $(this).after('<span class="t-Form-itemText t-Form-itemText--post"><button type="button" style="height:100%" class="a-Button " id="' + p_QRcode_item_id + '_PB" onclick="openQRModelPage(&quot;' + p_QRcode_item_id + '&quot;);"><span class="t-Icon fa fa-qrcode"></span></button></span>');
                });
        }
    })
}
// To simulate keypress
function simulateKeyPress(character) {
    jQuery.event.trigger({
        type: 'keypress',
        which: character.charCodeAt(0)
    });
}

// Invoke Android Barcode scanner
function scan_barcode(p_item_id) {
    Android.startScan(p_item_id);
}

function openQRModelPage(p_return_item) {
    $('#' + p_return_item).on("apexafterclosedialog", function (e, data) {
        apex.item(p_return_item).setValue(data.P975_BARCODE_RESULT);
        $('#' + data.P975_BARCODE_RESULT).unbind('apexafterclosedialog');
        apex.server.process('dummy', {
            pageItems: "#" + p_return_item
        }, {
            dataType: "text"
        });
    });
    apex.server.process(
        'PREPARE_MODAL_URL', {
        x01: 975,
        x02: 'P975_BARCODE_RESULT',
        x03: p_return_item,
        x04: p_return_item
    }, {
        success: function (pData) {
            apex.navigation.redirect($.trim(pData));
        },
        dataType: "text"
    });
}
