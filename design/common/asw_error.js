//asw_error.js centralizes exception handling and standardizes error logging across the WPD application.


//This function is used when page load to remove the parameters passed in the url, to avoid when again page reload those values are reset and pog which is created will be gone.
function removeParam(p_parameter) {
    try {
        logDebug("function : removeParam; parameter : " + p_parameter, "S");
        var l_url = document.location.href;
        if (l_url.includes("f?p")) {
            var urlparts = l_url.split("?");
            var next_url = "?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":";

            if (urlparts.length >= 2) {
                window.history.pushState("", document.title, urlparts[0] + next_url);
            }
        } else {
            var matches = l_url.match(/[?](.*)&s/);
            if (matches !== null) {
                if (typeof matches[1] !== "undefined") {
                    var new_url = l_url.replace(matches[1] + "&", "");
                    window.history.pushState("", document.title, new_url);
                }
            }
        }

        logDebug("function : removeParam", "E");
        return l_url;
    } catch (err) {
        logDebug("function : removeParam", "E");
        error_handling(err);
    }
}

// Raise error is modified as it should thorw exception in order to return error message to caller function.
// Function in common JS should be modified after thorough testing
function raise_error(p_message, p_location = "page", p_page_item) {
    console.log("error message ", p_message);
    apex.message.clearErrors();
    var err = new Error();
    var l_prefix_message;
    if (typeof p_message == "string") {
        if (p_message.indexOf("ERROR:") == -1) l_prefix_message = "ERROR:";
        err.message = l_prefix_message + p_message;
        err.stack = l_prefix_message + p_message;
    } else {
        err = p_message;
        if (err.message.indexOf("ERROR:") == -1) l_prefix_message = "ERROR:";
        err.message = l_prefix_message + err.message;
        l_prefix_message = "";
        if (err.stack.indexOf("ERROR:") == -1) l_prefix_message = "ERROR:";
        err.stack = l_prefix_message + err.stack;
    }

    if (g_show_error) {
        if (typeof p_page_item !== "undefined")
            apex.message.showErrors([
                {
                    type: "error",
                    location: p_location,
                    message: p_message,
                },
            ]);
        else
            apex.message.showErrors([
                {
                    type: "error",
                    location: p_location,
                    pageItem: p_page_item,
                    message: p_message,
                },
            ]);
    }
    if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function") {
        //Task_26601 always giving error when there is no active loading indicator
        removeLoadingIndicator(regionloadWait);
    }
    console.log("raise error function: ", p_message, g_show_error);
    throw err;
}

function isPromise(p) {
    return p && Object.prototype.toString.call(p) === "[object Promise]";
}

//This function is called in all the function in catch part to raise error on screen.
async function error_handling(p_error) {
    console.log("error ", p_error);
    var returnval = await get_format_error(p_error);

    if (returnval) {
        if (typeof returnval == "string") {
            raise_error(returnval);
        } else {
            var error_message;
            returnval
                .then(function (result) {
                    error_message = result;
                    raise_error(error_message);
                })
                .catch(function (result) {
                    error_message = result;
                    raise_error(error_message);
                });
        }
    } else {
        raise_error(p_error.stack);
    }
}

//Getting readable error message and print on screen.
async function get_format_error(p_err) {
    logDebug("function : get_format_error", "S");
    if (typeof p_err == "string") {
        return p_err;
    } else {
        var caller_line = p_err.stack.split("\n");
        var message,
            lineno_arr = [];
        for (i = 0; i < caller_line.length; i++) {
            if (i == 0) {
                var first = caller_line[i];
                message = first.slice(first.lastIndexOf(":") + 1, first.length);
                lineno_arr.push("Exception Occurred, Reverted to previous action.");
                lineno_arr.push(message);
            } else {
                var first = caller_line[i];
                var new_first = first.slice(0, first.lastIndexOf(":"));
                var location;
                var index = first.indexOf(".js");
                if (index !== -1) {
                    location = new_first.slice(new_first.lastIndexOf("/") + 1, new_first.lastIndexOf(":"));
                } else {
                    location = "Page 25";
                }
                lineno_arr.push(new_first.slice(0, new_first.indexOf("(") - 1) + " | " + location + " | " + new_first.slice(new_first.lastIndexOf(":") + 1, new_first.length));
            }
        }
        console.log("error", p_err.stack);
        var res = revertOnError(g_pogBackup, g_pog_index);
        logDebug("function : get_format_error", "E");
        return lineno_arr.join("<br>");
    }
}

async function revertOnError(p_backupJson, p_pog_index) {
    try {
        lIndex = 0;
        if (g_errorRaisedFlag == "N") {
            g_errorRaisedFlag = "Y";
            pogBackup = [];
        }
    } catch (err) {
        console.log("error");
    }
}