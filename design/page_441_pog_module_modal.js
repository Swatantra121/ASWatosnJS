var l_modalinfo = [];

function setFields() {
	try {
		logDebug("function : setFields ", "S");
		l_modalinfo = sessionStorage.getItem("modulelist") !== null ? JSON.parse(sessionStorage.getItem("modulelist")) : [];
		console.log("l_modalinfo", l_modalinfo);
		sessionStorage.removeItem("modulelist");
		apex.item("P441_MODULE_NAME").setFocus();
		if (l_modalinfo[0].Type == "N") {
			$("#DELETE_MODULE").css("display", "none");
			$s("P441_MODULE_ALLOW_OVERLAP", "N");
		} else {
			$("#DELETE_MODULE").css("display", "inline");
			$s("P441_MODULE_ALLOW_OVERLAP", l_modalinfo[0].AllowOvrelap);
		}
		$s("P441_POG_MODULE", l_modalinfo[0].PogModule);
		$s("P441_MODULE_NAME", l_modalinfo[0].ModuleName);
		$s("P441_MODULE_REMARKS", l_modalinfo[0].Remarks);
		$s("P441_POG_MODULE_HEIGHT", l_modalinfo[0].H);
		$s("P441_POG_MODULE_WIDTH", l_modalinfo[0].W);
		$s("P441_POG_MODULE_DEPTH", l_modalinfo[0].D);
		$s("P441_POG_MODULE_ROTATION", l_modalinfo[0].Rotation);
		$s("P441_MODULE_COLOR", l_modalinfo[0].Color);
		$s("P441_POG_MODULE_NWIDTH", l_modalinfo[0].NotchW);
		$s("P441_POG_MODULE_NSTART", l_modalinfo[0].NStart);
		$s("P441_POG_MODULE_NSPACING", l_modalinfo[0].Nspacing);
		$s("P441_MODULE_HORZ_START", l_modalinfo[0].HorzStart);
		$s("P441_MODULE_HORZ_SPACING", l_modalinfo[0].HorzSpacing);
		$s("P441_MODULE_VERT_START", l_modalinfo[0].VertStart);
		$s("P441_MODULE_VERT_SPACING", l_modalinfo[0].VertSpacing);

		$s("P441_DIVISION", l_modalinfo[0].Division);
		$s("P441_DEPT", l_modalinfo[0].Dept);
		$s("P441_SUBDEPT", l_modalinfo[0].Subdept);
		$s("P441_DIVISION", l_modalinfo[0].Division);
        $s("P441_NEW_TEMPLATE", l_modalinfo[0].IsTemplate); //ASA-1694 #17
		$("#P441_DEPT").on("apexafterrefresh", function () {
			// after refresh of the list, attempt to set the value of the list to the
			// value retrieved earlier
			apex.item(this).setValue(l_modalinfo[0].Dept);
		});
		$("#P441_SUBDEPT").on("apexafterrefresh", function () {
			// after refresh of the list, attempt to set the value of the list to the
			// value retrieved earlier
			apex.item(this).setValue(l_modalinfo[0].Subdept);
		});

        //ASA-1507 #2 Start
        $('body').on('keydown', function (event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                $('#CREATE_POG_MODULE').click();
            }
        });
        //ASA-1507 #2 End

        if ($v('P441_NEW_TEMPLATE') == "Y") {
            $("#P441_SUBDEPT_CONTAINER .t-Form-itemRequired-marker").remove();
        }   //ASA-1694 #17

		logDebug("function : setFields ", "E");
	} catch (err) {
		error_handling(err);
	}
}

function set_values(p_action) {
	try {
		logDebug("function : set_values pAction: " + p_action, "S");
		var mod_details = [];
		var item_list = {};
		item_list["Module"] = $v("P441_POG_MODULE");
		item_list["ModuleName"] = $v("P441_MODULE_NAME");
		item_list["Subdept"] = $v("P441_SUBDEPT");
		item_list["Remarks"] = $v("P441_MODULE_REMARKS");
		item_list["H"] = $v("P441_POG_MODULE_HEIGHT");
		item_list["W"] = $v("P441_POG_MODULE_WIDTH");
		item_list["D"] = $v("P441_POG_MODULE_DEPTH");
		item_list["Rotation"] = $v("P441_POG_MODULE_ROTATION");
		item_list["Color"] = $v("P441_MODULE_COLOR");
		item_list["ModuleNwidth"] = $v("P441_POG_MODULE_NWIDTH");
		item_list["ModuleNstart"] = $v("P441_POG_MODULE_NSTART");
		item_list["ModuleNspacing"] = $v("P441_POG_MODULE_NSPACING");
		item_list["HorzStart"] = $v("P441_MODULE_HORZ_START");
		item_list["HorzSpacing"] = $v("P441_MODULE_HORZ_SPACING");
		item_list["VertStart"] = $v("P441_MODULE_VERT_START");
		item_list["VertSpacing"] = $v("P441_MODULE_VERT_SPACING");
		item_list["ModuleAllowOverlap"] = $v("P441_MODULE_ALLOW_OVERLAP");
		item_list["Action"] = p_action;
		mod_details.push(item_list);

		sessionStorage.setItem("mod_details", JSON.stringify(mod_details));

		logDebug("function : set_values ", "E");
		apex.submit("CLOSE_Module");
	} catch (err) {
		error_handling(err);
	}
}

function validate_data() {
	logDebug("function : validate_data ", "S");
	var POGModule = $v("P441_POG_MODULE");
	var duplicate_ind = "N";
	try {
		if (l_modalinfo[0].ModNames.length > 0) {
			for (const modnames of l_modalinfo[0].ModNames) {
				if (POGModule.toUpperCase().trim() === modnames.toUpperCase().trim()) {
					duplicate_ind = "Y";
				}
			}
		}

        //ASA-1694 #17 added condition $v('P441_NEW_TEMPLATE') != 'Y'
		if ($v("P441_POG_MODULE") == "" || ($v("P441_SUBDEPT") == "" && $v('P441_NEW_TEMPLATE') != 'Y') || $v("P441_POG_MODULE_HEIGHT") == "" || $v("P441_POG_MODULE_WIDTH") == "" || $v("P441_POG_MODULE_DEPTH") == "" || $v("P441_MODULE_COLOR") == "") {
			alert(get_message("ENTER_MANDATORY_FIELDS"));
		} else if (duplicate_ind == "Y") {
			alert(get_message("MODULE_UNIQUE_ID"));
		} else if ($v("P441_POG_MODULE_HEIGHT") == 0) {
			alert(get_message("HEIGHT_GRT_THAN_ZERO"));
		} else if ($v("P441_POG_MODULE_WIDTH") == 0) {
			alert(get_message("WIDTH_GRT_THAN_ZERO"));
		} else if ($v("P441_POG_MODULE_DEPTH") == 0) {
			alert(get_message("DEPTH_GRT_THAN_ZERO"));
		} else if (parseFloat($v("P441_MODULE_HORZ_START")) / 100 >= parseFloat($v("P441_POG_MODULE_WIDTH")) / 100 - (parseFloat($v("P441_POG_MODULE_NWIDTH")) / 100) * 2) {
			alert(get_message("HORZ_START_LESS_POG_WIDTH"));
		} else if (parseFloat($v("P441_MODULE_VERT_START")) / 100 > parseFloat($v("P441_POG_MODULE_HEIGHT")) / 100) {
			alert(get_message("VERT_START_LESS_THAN_HEIGHT"));
		} else {
			set_values("U");
		}
		logDebug("function : validate_data ", "E");
	} catch (err) {
		error_handling(err);
	}
}
