
//asw_utilities.js contains reusable, pure helper functions shared across rendering, engine, UI, and error modules in WPD.


//This function is added in all the other function start and end. this will log messages in console when g_dbuDebugEnabled = 'Y'.
function logDebug(p_string, p_type) {
    var logType;
    if (p_type == "S") {
        logType = "Start";
    } else {
        logType = "End";
    }
    g_dbuDebugEnabled = "Y";
    if (g_dbuDebugEnabled == "Y") {
        // apex.debug.log(logType + " | " + p_string + " | " + getDateTime());
        console.log(logType + " | " + p_string + " | " + getDateTime());
    }
}


//ASA-1472
//Global function to handle to Fixed and its defaulted to 5 decimal points now.
function wpdSetFixed(p_num) {
    try {
        if (typeof p_num == "string") {
            p_num = parseFloat(p_num);
        }
        return parseFloat(nvl(p_num).toFixed(g_toFixedValue));
    } catch (err) {
        error_handling(err);
    }
}
//ASA-1472
function wpdGetFixed(p_fixedValue) {
    try {
        g_toFixedValue = p_fixedValue;
    } catch (err) {
        error_handling(err);
    }
}
wpdGetFixed(5); //ASA-1472

//This function is used to calculate suitable visible height of the camera so that POG is completely visible on the screen.
const visibleHeightAtZDepth = (depth, camera) => {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    // vertical fov in radians
    const vFOV = (camera.fov * Math.PI) / 180;

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};
//This function is used to set_camera_z function to set suitable z position of the camera. so that POG is completely visible on screen.
const visibleWidthAtZDepth = (depth, camera) => {
    const height = visibleHeightAtZDepth(depth, camera);
    return height * camera.aspect;
};

//This function will return an arry
let findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index);

//This function is globally used to sort any array based on any key inside json in asc or desc order.
//Please note: variable with details of sorting to be set and passed when calling keySort. Example as below.
//var sorto = {
//    LocID: "asc",
//};
Array.prototype.keySort = function (keys) {
    keys = keys || {};
    var obLen = function (obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    var obIx = function (obj, ix) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (size == ix) return key;
                size++;
            }
        }
        return false;
    };

    var keySort = function (a, b, d) {
        d = d !== null ? d : 1;
        if (a == b) return 0;
        return a > b ? 1 * d : -1 * d;
    };

    var KL = obLen(keys);

    if (!KL) return this.sort(keySort);

    for (var k in keys) {
        // asc unless desc or skip
        keys[k] = keys[k] == "desc" || keys[k] == -1 ? -1 : keys[k] == "skip" || keys[k] === 0 ? 0 : 1;
    }

    this.sort(function (a, b) {
        var sorted = 0,
            ix = 0;
        while (sorted === 0 && ix < KL) {
            var k = obIx(keys, ix);
            if (k) {
                var dir = keys[k];
                sorted = keySort(a[k], b[k], dir);
                ix++;
            }
        }
        return sorted;
    });
    return this;
};

//This function is used in logDebug function to console log the time any function is called.
function getDateTime() {
    var today = new Date();
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var l_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds();
    var dateTime = date + " " + l_time;
    return dateTime;
}


//This function is used in create_pdf function because after recreate items with image. needs rendering time for items to be visible on screen and then create PDF
function timeout(p_ms) {
    try {
        return new Promise((resolve) => setTimeout(resolve, p_ms));
    } catch (err) {
        error_handling(err);
    }
}

//converting JavaScript strings to ArrayBuffers and vice-versa. Currently not used anywhere.
function s2ab(p_s) {
    var buf = new ArrayBuffer(p_s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != p_s.length; ++i) view[i] = p_s.charCodeAt(i) & 0xff;
    return buf;
}

//This will give you current available heap space in browser. Currently not used anywhere.
function get_avail_heap() {
    return performance.memory.jsHeapSizeLimit - performance.memory.totalJSHeapSize;
}

// Validate dimensions for decimal with 2 places (Hardcoded to 2 decimal places as told by TerryI)
function validateDimensions(p_el, p_evt) {
    try {
        logDebug("function : validateDimensions", "S");
        var charCode = p_evt.which ? p_evt.which : event.keyCode;
        var number = p_el.value.split(".");
        if (charCode != 46 && charCode > 31 && charCode !== 45 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        //just one dot
        if (number.length > 1 && charCode == 46) {
            return false;
        }
        //get the carat position
        var caratPos = getSelectionStart(p_el);
        var dotPos = p_el.value.indexOf(".");
        var sysPrmMeterageLength = 2;
        if (caratPos > dotPos && dotPos > -1 && number[1].length > sysPrmMeterageLength - 1) {
            return false;
        }
        logDebug("function : validateDimensions", "E");
        return true;
    } catch (err) {
        error_handling(err);
    }
}

//This function will return hex color value when 0x color code is passed. Currently not used anywhere.
function invertHex(p_hex) {
    try {
        return (Number(`0x1${p_hex}`) ^ 0xffffff).toString(16).substr(1).toUpperCase();
    } catch (err) {
        error_handling(err);
    }
}

//This function will return r,g,b color values when hex color is passed.
function hexToRgb(p_hex) {
    try {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(p_hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    } catch (err) {
        error_handling(err);
    }
}

//This function will return the width of the text in pixels. basically used to create status bar.
String.prototype.visualLength = function (id) {
    try {
        var ruler = document.getElementById(id);
        ruler.style.fontSize = "large";
        ruler.innerHTML = this;
        return ruler.offsetWidth;
    } catch (err) {
        error_handling(err);
    }
};

//This function will return the height of the text in pixels. basically used to create status bar.
String.prototype.visualHeight = function (id) {
    try {
        var ruler = document.getElementById(id);
        ruler.style.fontSize = "large";
        ruler.innerHTML = this;
        return ruler.offsetHeight;
    } catch (err) {
        error_handling(err);
    }
};

function calculateSize(p_img, p_maxWidth, p_maxHeight) {
    try {
        logDebug("function : calculateSize; maxWidth : " + p_maxWidth + "; maxHeight : " + p_maxHeight, "E");
        let width = p_img.width;
        let height = p_img.height;

        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > p_maxWidth) {
                height = Math.round((height * p_maxWidth) / width);
                width = p_maxWidth;
            }
        } else {
            if (height > p_maxHeight) {
                width = Math.round((width * p_maxHeight) / height);
                height = p_maxHeight;
            }
        }
        logDebug("function : calculateSize", "E");
        return [width, height];
    } catch (err) {
        logDebug("function : calculateSize", "E");
        error_handling(err);
    }
}

//This function return the size in proper readable format like 120 MB, 554 KB etc.
function readableBytes(p_bytes) {
    try {
        logDebug("function : readableBytes; bytes : " + p_bytes, "S");
        const i = Math.floor(Math.log(p_bytes) / Math.log(1024)),
            sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        logDebug("function : readableBytes", "E");
        return (p_bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
    } catch (err) {
        logDebug("function : readableBytes", "E");
        error_handling(err);
    }
}

//Returns true or false if any tag is having sent value. used for context menu.
function JsonContains(p_json, p_keyname, p_value) {
    try {
        if (typeof p_json !== "undefined" && p_json !== null) {
            return Object.keys(p_json).some((key) => {
                return typeof p_json[key] === "object" ? JsonContains(p_json[key], p_keyname, p_value) : key === p_keyname && p_json[key] === p_value;
            });
        }
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1669 Start
//Function to compare multiple keys and values of JSON
//p_conditions -> pass key-values as an JS Object
function JsonContainsAll(arr, conditions) {
    try {
        if (!Array.isArray(arr)) return false;

        return arr.some((obj) => {
            return Object.entries(conditions).every(([key, value]) => obj[key] === value);
        });
    } catch (err) {
        console.error(err);
    }
    return false;
}

//ASA-1669 End


//Getting next alphabet passing current alphabet. this is used to generate new module name.
function nextLetter(p_s) {
    try {
        return p_s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
            var c = a.charCodeAt(0);
            switch (c) {
                case 90:
                    return "A";
                case 122:
                    return "a";
                default:
                    return String.fromCharCode(++c);
            }
        });
    } catch (err) {
        error_handling(err);
    }
}

function getCanvasBlob(p_canvas) {
    return new Promise(function (resolve, reject) {
        p_canvas.toBlob(
            function (blob) {
                resolve(blob);
            },
            "image/jpeg",
            0.5
        );
    });
}

function blobToBase64(p_blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(p_blob);
    });
}

function check_cookie_name(p_name, p_bu_id) {
    try {
        logDebug("function : check_cookie_name; name : " + p_name + "; bu_id : " + p_bu_id, "S");
        var match = document.cookie.match(new RegExp("(^| )" + p_name + "=([^;]+)"));
        if (match) {
            if (p_bu_id == match[2].split("$$$")[0]) {
                logDebug("function : check_cookie_name", "E");
                return match[2].split("$$$")[1];
            } else {
                document.cookie = p_name + "=;  max-age=31536000;";
                logDebug("function : check_cookie_name", "E");
                return "";
            }
        } else {
            logDebug("function : check_cookie_name", "E");
            return "";
        }
    } catch (err) {
        error_handling(err);
    }
}

function chunkString(p_string, p_length) {
    logDebug("function : chunkString; len : " + p_length, "S");
    const size = Math.ceil(p_string.length / p_length);
    const r = Array(size);
    let offset = 0;

    for (let i = 0; i < size; i++) {
        r[i] = p_string.substr(offset, p_length);
        offset += p_length;
    }
    logDebug("function : chunkString", "E");
    return r;
}

function base64ToBuffer(p_string) {
    p_string = window.atob(p_string); // creates a ASCII string
    var buffer = new ArrayBuffer(p_string.length),
        view = new Uint8Array(buffer);
    for (var i = 0; i < p_string.length; i++) {
        view[i] = p_string.charCodeAt(i);
    }
    return buffer;
}

function clob2Array(p_clob, p_size, p_array) {
    try {
        logDebug("function : clob2Array; size : " + p_size, "S");
        loopCount = Math.floor(p_clob.length / p_size) + 1;
        for (var i = 0; i < loopCount; i++) {
            p_array.push(p_clob.slice(p_size * i, p_size * (i + 1)));
        }
        logDebug("function : clob2Array", "E");
        return p_array;
    } catch (err) {
        error_handling(err);
    }
}

function nvl(p_value) {
    try {
        // logDebug("function : nvl; value : " + value, "S");
        if (typeof p_value == "undefined" || p_value == "" || p_value == null || p_value == "null") {
            // logDebug("function : nvl", "N");
            return 0;
        } else {
            // logDebug("function : nvl", "N");
            return p_value;
        }
    } catch (err) {
        error_handling(err);
    }
}

function get_orientation_list(p_orien_check) {
    if (p_orien_check == 1) {
        return [2, 8, 3];
    } else if (p_orien_check == 2) {
        return [1, 8, 3];
    } else if (p_orien_check == 3) {
        return [1, 2, 8];
    } else if (p_orien_check == 8) {
        return [1, 2, 3];
    }
}

//ASA-1095
function getTextColor(p_red, p_green, p_blue) {
    var darkColor = "#000000",
        lightColor = "#FFFFFF";
    var uicolors = [p_red / 255, p_green / 255, p_blue / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L > 0.179 ? darkColor : lightColor;
}

function get_type(p_description) {
    //ASA-1113
    if (p_description == "OwnLabel-Local") {
        return "W";
    } else if (p_description == "OwnLabel-IB") {
        return "W";
    } else if (p_description == "OwnLabel-OtherCountry") {
        return "W";
    } else if (p_description == "Exclusive-SupplieE") {
        return "E";
    } else if (p_description == "Exclusive-DistributorE") {
        return "E";
    } else if (p_description == "PrivateLabel-Local") {
        return "P";
    } else if (p_description == "PrivateLabel-IB") {
        return "P";
    } else if (p_description == "FRESHKON") {
        return "F";
    } else if (p_description == "Normal") {
        return "N";
    } else if (p_description == "A Brand") {
        return "A";
    }
}
//ASA-1405
//ASA-1936.2 Regression Fix
function permuteArrayOfArrays(p_arr) {
    let result = [];
    function permuteHelper(arr, m = []) {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permuteHelper(curr.slice(), m.concat(next));
            }
        }
    }
    permuteHelper(p_arr);
    return result;
}

//ASA-1405
function getObjectWithHighestValue(p_arr, p_key) {
    return p_arr.reduce((maxObj, currentObj) => {
        return currentObj[p_key] > (maxObj[p_key] || -Infinity) ? currentObj : maxObj;
    }, {});
}