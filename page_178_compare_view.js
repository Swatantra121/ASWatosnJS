var g_compareColObj = {},
	regex = /(\w+)-#([0-9A-Fa-f]{6})/g;

var g_select_item_color_change = $v('P178_POGCR_BLINK_COLOR_CHANGE');               //ASA-1537 #8
var g_isReportRender = 'N';         //ASA-1537 #12

var g_item_vertical_text_display = $v("P178_ITEM_CODE_VERT_ALN"); //ASA-1847 4 Issue 3
var g_item_text_center_align = $v("P178_ITEM_CODE_CTR_ALN"); //ASA-1847 4 Issue 3

function init(p_canvasNo) {
	try {
		var canvasName = "maincanvas";
		p_canvasNo = parseInt(p_canvasNo);

		if (p_canvasNo > 0) {
			canvasName = "maincanvas" + (p_canvasNo + 1);
		}
		g_canvas = document.getElementById(canvasName);
		g_canvas.setAttribute("data-indx", p_canvasNo);

		g_canvas_region = document.getElementById("drawing_region");
		g_selection = document.getElementById("selection");
		g_canvas_objects.push(g_canvas);
	} catch (e) {
		document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" + e + "</b></p>";
		return;
	}
	createWorld();
	g_raycaster = new THREE.Raycaster();
	render();
	multiselect = "N";
	ctrl_select = "N";
	var devicePixelRatio = window.devicePixelRatio;
	g_start_pixel_ratio = devicePixelRatio;

	g_windowHeight = window.innerHeight;
	windowWidth = $("#drawing_region").innerWidth() / 2;

	setUpMouseHander("maincanvas", doMouseMove, g_canvas);
	g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);

	g_initial_windowHeight = window.innerHeight;
	var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
	var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;
	var canvasWidthOrg = canvasContainerW;
	var canvasHeightOrg = canvasContainerH;
	$("#" + canvasName)
		.css("height", canvasHeightOrg + "px !important")
		.css("width", canvasWidthOrg + "px !important");
	g_canvas.width = canvasWidthOrg;
	g_canvas.height = canvasHeightOrg;
	g_camera.aspect = canvasWidthOrg / canvasHeightOrg;

	// adjust the FOV
	g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
	g_camera.updateProjectionMatrix();
	g_renderer.setSize(canvasWidthOrg, canvasHeightOrg);
}

function setUpMouseHander(p_element, p_mouseDragFunc, p_canvas) {
	try {
		if (typeof p_element == "string") {
			p_element = document.getElementById(p_element);
		}
		if (!p_element || !p_element.addEventListener) {
			throw "first argument in setUpMouseHander is not a valid element";
		}
		var startX, startY;
		var prevX, prevY;

		function doMouseMove(p_event) {
			if (p_mouseDragFunc) {
				var jselector = p_canvas.getAttribute("id");
				var l_new_canvas = p_canvas;
				var pPogIndex = l_new_canvas.getAttribute("data-indx"); //getting the pog_index from the canvas element attribute.
				var new_camera = g_camera;
				if (p_event.target.nodeName == "CANVAS" && typeof g_scene_objects[pPogIndex] !== "undefined") {
					l_new_canvas = p_event.target;
					pPogIndex = l_new_canvas.getAttribute("data-indx");
					if (g_scene_objects.length > 0) {
						new_camera = g_scene_objects[pPogIndex].scene.children[0];
					}
				} else {
					l_new_canvas = p_event.target;
					pPogIndex = 0;
					new_camera = g_camera;
				}

				var r = l_new_canvas.getBoundingClientRect();
				var obj_height = r.height;
				var x = p_event.clientX - r.left;
				var y = p_event.clientY - r.top;
				//calling doMouseMove function and set the object position to next pixel.
				NEW_POGJSON = g_pog_json;
				p_mouseDragFunc(x, y, p_event, prevX, prevY, l_new_canvas, NEW_POGJSON, jselector, pPogIndex, new_camera);
			}
			prevX = x;
			prevY = y;
		}
		p_canvas.addEventListener("mousemove", doMouseMove);
	} catch (err) {
		error_handling(err);
	}
}

function doMouseMove(p_x, p_y, p_event, p_prevX, p_prevY, p_canvas, p_pog_json_opp, p_jselector, p_pog_index, p_camera) {
	/* This is mouse move listner function
    This function handles
    1. dragging of any object set object current position
    2. resetting size of multiselect box
    3. grab and move scene which manually zoom is done
    4. setting items position for multiselect object dragging
    5. when not dragging show item info in bottom of screen.
     */
	try {
		//get the intersect object and from that get the current x y position
		var width = p_canvas.width / window.devicePixelRatio;
		var height = p_canvas.height / window.devicePixelRatio;
		var a = (2 * p_x) / width - 1;
		var b = 1 - (2 * p_y) / height;
		var yaxis = p_y;
		var scroll_top = $(document).scrollTop();
		var scroll_left = $(".t-Region-body").scrollLeft();

		p_camera.updateProjectionMatrix();
		g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
		if (typeof g_scene_objects[p_pog_index] !== "undefined") {
			g_intersects = g_raycaster.intersectObjects(g_scene_objects[p_pog_index].scene.children[2].children); // no need for recusion since all objects are top-level
		} else {
			g_intersects = g_raycaster.intersectObjects(g_world.children);
		} // no need for recusion since all objects are top-level

		/* if dragging is in progress set new positions
        if ctrl key is pressed while mouse move it means user wants to
        create a duplicate of a fixel so do not set new position.
         */

		//if intersected object is item then get details and show in bottom of screen.
		var $doc = $(document),
			$win = $(window),
			$this = $("#object_info"),
			offset = $this.offset(),
			dTop = offset.top - $doc.scrollTop(),
			dBottom = $win.height() - dTop - $this.height(),
			dLeft = offset.left - $doc.scrollLeft(),
			dRight = $win.width() - dLeft - $this.width();
		g_mouse.x = p_event.clientX + scroll_left - 20;
		g_mouse.y = p_event.clientY + scroll_top;

		var x1 = g_startMouse.x;
		var x2 = g_mouse.x;
		var y1 = g_startMouse.y;
		var y2 = g_mouse.y;

		if (x1 > x2) {
			var tmp1 = x1;
			x1 = x2;
			x2 = tmp1;
		}

		if (y1 > y2) {
			var tmp2 = y1;
			y1 = y2;
			y2 = tmp2;
		}
		if (g_dragging) {
			g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
			g_intersects = g_raycaster.intersectObject(g_targetForDragging);

			var z = g_drag_z;
			var locationX = g_intersects[0].point.x;
			var locationY = g_intersects[0].point.y;
			var locationZ = g_intersects[0].point.z;

			var coords = new THREE.Vector3(locationX, locationY, locationZ);
			g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);

			a = Math.min(19, Math.max(-19, coords.x));
			p_y = Math.min(19, Math.max(-19, coords.y));
			//multi select box height width and location setting.
			if (g_selecting) {
				g_multiselect = "Y";
				g_DragMouseEnd.x = a;
				g_DragMouseEnd.y = p_y;

				g_selection.style.left = x1 + "px";
				g_selection.style.top = y1 + "px";
				g_selection.style.width = x2 - x1 - 5 + "px";
				g_selection.style.height = y2 - y1 - 5 + "px";
				console.log("g_selection.style.left", g_selection.style.left, g_selection.style.top, g_selection.style.width);
			}
			g_DragMouseEnd.x = a;
			g_DragMouseEnd.y = p_y;
		} else {
			if (g_selecting) {
				g_selecting = false;
				g_selection.style.visibility = "hidden";
			}
		}

		var contextElement = document.getElementById("object_info");
		$("#object_info")
			.contents()
			.filter(function () {
				return this.nodeType == 3;
			})
			.remove();
		var append_detail = "";
		var valid_width = 0;
		var lines_arry = [];
		var divider = " | ";
		if (g_intersects.length > 0 && typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
			var desc_list_arr = $v("P178_POGCR_ITEM_DESC_LIST").split(":");
			for (i = 0; i < desc_list_arr.length; i++) {
				var line_width = 0;
				var divider = i > 0 ? " | " : "";
				if (desc_list_arr[i] == "ITEM") {
					append_detail = append_detail + divider + get_message("ITEM_ID") + ': <span style="color:yellow">' + g_intersects[0].object.ItemID + "</span>";
					line_width = (" | " + get_message("ITEM_ID") + ": " + g_intersects[0].object.ItemID).visualLength("ruler");
				}
				if (desc_list_arr[i] == "UPC") {
					append_detail = append_detail + divider + get_message("POGCR_REP_TEMP_HEAD_BARCODE") + ': <span style="color:yellow">' + g_intersects[0].object.Barcode + "</span>";
					line_width = (" | " + get_message("POGCR_REP_TEMP_HEAD_BARCODE") + ": " + g_intersects[0].object.Barcode).visualLength("ruler");
				}
				if (desc_list_arr[i] == "DESC") {
					append_detail = append_detail + divider + get_message("DESCRIPTION") + ': <span style="color:yellow">' + g_intersects[0].object.Description + "</span>";
					line_width = (" | " + get_message("DESCRIPTION") + ": " + g_intersects[0].object.Description).visualLength("ruler");
				}
				if (desc_list_arr[i] == "BRAND") {
					append_detail = append_detail + divider + get_message("POGCR_BRAND") + ': <span style="color:yellow">' + g_intersects[0].object.Brand + "</span>";
					line_width = (" | " + get_message("POGCR_BRAND") + ": " + g_intersects[0].object.Brand).visualLength("ruler");
				}
				if (desc_list_arr[i] == "GROUP") {
					append_detail = append_detail + divider + get_message("POGCR_GROUP_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Group + "</span>";
					line_width = (" | " + get_message("POGCR_GROUP_LBL") + ": " + g_intersects[0].object.Group).visualLength("ruler");
				}
				if (desc_list_arr[i] == "DEPT") {
					append_detail = append_detail + divider + get_message("POGCR_TEMP_HEAD_DEPARTMENT") + ': <span style="color:yellow">' + g_intersects[0].object.Dept + "</span>";
					line_width = (" | " + get_message("POGCR_TEMP_HEAD_DEPARTMENT") + ": " + g_intersects[0].object.Dept).visualLength("ruler");
				}
				if (desc_list_arr[i] == "CLASS") {
					append_detail = append_detail + divider + get_message("POGCR_CLASS_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Class + "</span>";
					line_width = (" | " + get_message("POGCR_CLASS_LBL") + ": " + g_intersects[0].object.Class).visualLength("ruler");
				}
				if (desc_list_arr[i] == "SUBCLASS") {
					append_detail = append_detail + divider + get_message("POGCR_SUBCLASS_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.SubClass + "</span>";
					line_width = (" | " + get_message("POGCR_SUBCLASS_LBL") + ": " + g_intersects[0].object.SubClass).visualLength("ruler");
				}
				if (desc_list_arr[i] == "ITEM_SIZE") {
					append_detail = append_detail + divider + get_message("POGCR_ITEMSIZE_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.SizeDesc + "</span>";
					line_width = (" | " + get_message("POGCR_ITEMSIZE_LBL") + ": " + g_intersects[0].object.SizeDesc).visualLength("ruler");
				}
				if (desc_list_arr[i] == "SUPPLIER") {
					append_detail = append_detail + divider + get_message("POGCR_REP_HEAD_SUPPLIERS") + ': <span style="color:yellow">' + g_intersects[0].object.Supplier + "</span>";
					line_width = (" | " + get_message("POGCR_REP_HEAD_SUPPLIERS") + ": " + g_intersects[0].object.Supplier).visualLength("ruler");
				}
				if (desc_list_arr[i] == "WIDTH") {
					append_detail = append_detail + divider + get_message("POGCR_WIDTH_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OW * 100).toFixed(2) + "</span>";
					line_width = (" | " + get_message("POGCR_WIDTH_LBL") + ": " + (g_intersects[0].object.OW * 100).toFixed(2)).visualLength("ruler");
				}
				if (desc_list_arr[i] == "HEIGHT") {
					append_detail = append_detail + divider + get_message("POGCR_HEIGHT_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OH * 100).toFixed(2) + "</span>";
					line_width = (" | " + get_message("POGCR_HEIGHT_LBL") + ": " + (g_intersects[0].object.OH * 100).toFixed(2)).visualLength("ruler");
				}
				if (desc_list_arr[i] == "DEPTH") {
					append_detail = append_detail + divider + get_message("POGCR_DEPTH_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OD * 100).toFixed(2) + "</span>";
					line_width = (" | " + get_message("POGCR_DEPTH_LBL") + ": " + (g_intersects[0].object.OD * 100).toFixed(2)).visualLength("ruler");
				}
				if (desc_list_arr[i] == "STORE") {
					append_detail = append_detail + divider + get_message("POGCR_STORE_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.StoreCnt + "</span>";
					line_width = (" | " + get_message("POGCR_STORE_LBL") + ": " + g_intersects[0].object.StoreCnt).visualLength("ruler");
				}
				if (desc_list_arr[i] == "ITEM_DIM") {
					append_detail = append_detail + divider + get_message("POGCR_ITEM_DIM_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.ItemDim + "</span>";
					line_width = (" | " + get_message("POGCR_ITEM_DIM_LBL") + ": " + g_intersects[0].object.ItemDim).visualLength("ruler");
				}
				if (desc_list_arr[i] == "POSITION") {
					append_detail = append_detail + divider + get_message("POGCR_POSITION_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.LocID + "</span>";
					line_width = (" | " + get_message("POGCR_POSITION_LBL") + ": " + g_intersects[0].object.LocID).visualLength("ruler");
				}
				if (desc_list_arr[i] == "SHELF") {
					append_detail = append_detail + divider + get_message("POGCR_SHELF_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Shelf + "</span>";
					line_width = (" | " + get_message("POGCR_SHELF_LBL") + ": " + g_intersects[0].object.Shelf).visualLength("ruler");
				}
				if (desc_list_arr[i] == "ORIENTATION") {
					append_detail = append_detail + divider + get_message("POGCR_ORIENTATION_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.OrientationDesc + "</span>";
					line_width = (" | " + get_message("POGCR_ORIENTATION_LBL") + ": " + g_intersects[0].object.OrientationDesc).visualLength("ruler");
				}
				if (desc_list_arr[i] == "DEPTH_FACING") {
					append_detail = append_detail + divider + get_message("POGCR_DEPTH_FACING_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.DFacing + "</span>";
					line_width = (" | " + get_message("POGCR_DEPTH_FACING_LBL") + ": " + g_intersects[0].object.DFacing).visualLength("ruler");
				}
				if (desc_list_arr[i] == "HORIZ_FACING") {
					append_detail = append_detail + divider + get_message("TEMP_HEAD_HORIZ_FACING") + ': <span style="color:yellow">' + g_intersects[0].object.HorizFacing + "</span>";
					line_width = (" | " + get_message("TEMP_HEAD_HORIZ_FACING") + ": " + g_intersects[0].object.HorizFacing).visualLength("ruler");
				}
				if (desc_list_arr[i] == "VERT_FACING") {
					append_detail = append_detail + divider + get_message("TEMP_HEAD_VERT_FACING") + ': <span style="color:yellow">' + g_intersects[0].object.VertFacing + "</span>";
					line_width = (" | " + get_message("TEMP_HEAD_VERT_FACING") + ": " + g_intersects[0].object.VertFacing).visualLength("ruler");
				}
				if (desc_list_arr[i] == "SELLING_PRICE") {
					append_detail = append_detail + divider + get_message("SELLING_PRICE_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.SellingPrice).toFixed(2) + "</span>";
					line_width = (" | " + get_message("SELLING_PRICE_LBL") + ": " + g_intersects[0].object.SellingPrice).visualLength("ruler");
				}
				if (desc_list_arr[i] == "SALES_UNIT") {
					append_detail = append_detail + divider + get_message("SALES_UNIT_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.SalesUnit).toFixed(2) + "</span>";
					line_width = (" | " + get_message("SALES_UNIT_LBL") + ": " + g_intersects[0].object.SalesUnit).visualLength("ruler");
				}
				if (desc_list_arr[i] == "NET_SALES") {
					append_detail = append_detail + divider + get_message("NET_SALES_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.NetSales).toFixed(2) + "</span>";
					line_width = (" | " + get_message("NET_SALES_LBL") + ": " + g_intersects[0].object.NetSales).visualLength("ruler");
				}
				if (desc_list_arr[i] == "PROFIT") {
					append_detail = append_detail + divider + get_message("PROFIT_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.Profit).toFixed(2) + "</span>";
					line_width = (" | " + get_message("PROFIT_LBL") + ": " + g_intersects[0].object.Profit).visualLength("ruler");
				}
				if (desc_list_arr[i] == "TOTAL_MARGIN") {
					append_detail = append_detail + divider + get_message("POGCR_TOTAL_MARGIN") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.TotalMargin).toFixed(2) + "</span>";
					line_width = (" | " + get_message("POGCR_TOTAL_MARGIN") + ": " + g_intersects[0].object.TotalMargin).visualLength("ruler");
				}

				valid_width = valid_width + line_width;
				if (valid_width > 1300) {
					append_detail = append_detail + "<br>";
					lines_arry.push(valid_width);
					valid_width = 0;
				}
			}
		} else if (g_intersects.length > 0 && typeof g_intersects[0].object.FixelID !== "undefined" && g_intersects[0].object.FixelID !== "") {
			var pog_version = typeof p_pog_json_opp[p_pog_index].Version !== "undefined" && p_pog_json_opp[p_pog_index].Version !== null ? p_pog_json_opp[p_pog_index].Version : "";
			var draft_version = "";
			var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";

			append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pog_json_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[0].object.Module + " </span> " + divider + get_message("POGCR_FIXEL_ID") + ': <span style="color:yellow">' + g_intersects[0].object.FixelID + "</span>";
			contextElement.classList.add("active");
		} else if (g_intersects.length > 0 && typeof g_intersects[0].object.Module !== "undefined" && g_intersects[0].object.Module !== "") {
			var pog_version = typeof p_pog_json_opp[p_pog_index].Version !== "undefined" && p_pog_json_opp[p_pog_index].Version !== null ? p_pog_json_opp[p_pog_index].Version : "";
			var draft_version = "";
			var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";

			append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pog_json_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[0].object.Module + "</span>";
			contextElement.classList.add("active");
		} else if (typeof p_pog_json_opp !== "undefined" && p_pog_json_opp.length > 0) {
			var pog_version = typeof p_pog_json_opp[p_pog_index].Version !== "undefined" && p_pog_json_opp[p_pog_index].Version !== null ? p_pog_json_opp[p_pog_index].Version : "";
			var draft_version = "";
			var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";

			append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pog_json_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version;
			contextElement.classList.add("active");
		} else {
			contextElement.classList.remove("active");
		}

		append_detail = append_detail + "<br>" + 'Version Compare color details : <span style="color: #' + g_compareColObj["ADD"] + '">Added Product</span> ' + divider + ' <span style="color: #' + g_compareColObj["RETAIN_CHANGE"] + '">Retain Product with position change</span> ' + divider + ' <span style="color: #' + g_compareColObj["RETAIN"] + '">Retain with no change</span> ' + divider + ' <span style="color: #' + g_compareColObj["REMOVE"] + '">Deleted Product</span> ' + divider + ' <span style="color: #' + g_compareColObj["NEW"] + '">New Products</span>';

		if (g_intersects.length > 0) {
			if (typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
				var height = append_detail.visualHeight("ruler") + 12;
				var buffer_width = desc_list_arr.length > 7 ? 150 : 50;
				if (lines_arry.length > 0) {
					var width = Math.max.apply(Math, lines_arry) + buffer_width;
				} else {
					var width = append_detail.visualLength("ruler") + buffer_width;
				}
			} else {
				var height = append_detail.visualHeight("ruler") + 7;
				var width = append_detail.visualLength("ruler") + 50;
			}
		} else {
			var height = append_detail.visualHeight("ruler") + 7;
			var width = append_detail.visualLength("ruler") + 50;
		}

		$("#object_info").html(append_detail);
		contextElement.style.top = window.innerHeight - $this.height() - 15 + "px";
		contextElement.style.width = window.innerWidth + "px"; //width + "px";
		contextElement.style.height = height + "px";
		contextElement.style.fontSize = "large";
		contextElement.style.fontFamily = "Tahoma";
		contextElement.style.left = 0 + "px";
	} catch (err) {
		error_handling(err);
	}
}

async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_index, p_showSingleModule, p_org_mod_index) {
	try {
		$("#LIVE_IMAGE").addClass("apex_disabled");
		if ($v("P178_POGCR_DFT_NOTCH_LABEL") == "Y") {
			g_show_notch_label = "Y";
		}
		if ($v("P178_POGCR_DFT_FIXEL_LABEL") == "Y") {
			g_show_fixel_label = "Y";
		}
		if ($v("P178_POGCR_SHOW_DFLT_ITEM_LOC") == "Y") {
			g_show_item_label = "Y";
		}
		await load_orientation_json();
		await create_module_from_json_lib(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, $v("P178_VDATE"), $v("P178_POG_DEFAULT_COLOR"), $v("P178_MODULE_DEFAULT_COLOR"), null, false, p_showSingleModule, p_org_mod_index, $v("P178_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P178_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P178_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P178_BASKET_WALL_THICK")), parseFloat($v("P178_CHEST_WALL_THICK")), $v("P178_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P178_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P178_POGCR_TEXT_DEFAULT_SIZE")), $v("P178_POG_TEXTBOX_DEFAULT_COLOR"), $v("P178_SHELF_DEFAULT_COLOR"), $v("P178_DIV_COLOR"), $v("P178_SLOT_DIVIDER"), $v("P178_SLOT_ORIENTATION"), $v("P178_DIVIDER_FIXED"), $v("P178_ITEM_DFT_COLOR"), $v("P178_POGCR_DELIST_ITEM_DFT_COLOR"), "Y", null, 1, $v("P178_MERCH_STYLE"), $v("P178_POGCR_LOAD_IMG_FROM"), $v("P178_BU_ID"), $v("P178_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P178_POGCR_ITEM_NUM_LBL_COLOR"), $v("P178_POGCR_DISPLAY_ITEM_INFO"), $v("P178_POGCR_ITEM_NUM_LBL_COLOR"), $v("P178_POGCR_ITEM_NUM_LABEL_POS"), $v("P178_NOTCH_HEAD"), "N", $v("P178_POGCR_DFT_BASKET_FILL"), $v("P178_POGCR_DFT_BASKET_SPREAD"), g_camera, p_pog_index, null, $v("P178_POGCR_NOTCH_START_VALUE"), "N", "Y", "N"); //--ASA-1310 prasanna ASA-1310_20240307 //Regression 29(Portal Issue) added p_calc_dayofsupply

		if ($v("P178_POGCR_DFT_ITEM_DESC") == "Y" || (g_ItemImages.length == 0 && $v("P178_POGCR_DFLT_LIVE_IMAGES") == "Y")) {
			await showHideItemDescription("Y", $v("P178_ITEM_DFT_COLOR"), $v("P178_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
			g_show_item_desc = "Y";
			$v("P178_POGCR_DFT_ITEM_DESC") == "Y" ? (g_show_live_image = "N") : (g_show_live_image = "Y");
		}
		animate_pog(p_pog_index);

		var details = get_min_max_xy(p_pog_index);
		var details_arr = details.split("###");
		set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
		render();
	} catch (err) {
		error_handling(err);
	}
	return "SUCCESS";
}

function changeItemRepView(dispInd) {
	$s("P178_ITM_DISP_IDF", dispInd);
	apex.region("item_detail_grid").refresh();
}

async function reset_colors(p_resetType, p_pog_index) {
	logDebug("function : reset_colors; resetType : " + p_resetType, "S");
	if (p_resetType == "O" && g_colorBackup == "N" && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
			if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
				var shelfs = modules_info.ShelfInfo;
				var shelfs_comp = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
				$.each(shelfs, function (j, shelfs) {
					$.each(shelfs.ItemInfo, function (l, it) {
						g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].OldItemColor = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].Color;
					});
				});
			}
		});
		g_colorBackup = "Y";
	} else if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
			if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
				var shelfs = modules_info.ShelfInfo;
				var shelfs_comp = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
				$.each(shelfs, function (j, shelfs) {
					$.each(shelfs.ItemInfo, function (l, it) {
						g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].Color = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].OldItemColor;
					});
				});
			}
		});
		g_colorBackup = "N";
	}
	render(p_pog_index);
	logDebug("function : reset_colors", "E");
}

async function ShowColorBackup(p_pog_index) {
	try {
		logDebug("function : ShowColorBackup", "S");
		// console.log("backup", g_pog_json[p_pog_index].ColorBackup);
		if (typeof g_pog_json[p_pog_index].ColorBackup == "undefined") {
			$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
				if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
					var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
					var shelfs_info = modules_info.ShelfInfo;
					var j = 0;
					for (const shelfs of shelfs_info) {
						var l = 0;
						for (const it of shelfs.ItemInfo) {
							var item_dtl = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l];
							item_dtl.ShowColorBackup = item_dtl.Color;
							g_pog_json[p_pog_index].ColorBackup = "Y";
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							selectedObject.ShowColorBackup = selectedObject.material.color.getHex;
							l++;
						}
						j++;
					}
					if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
						var l = 0;
						for (const it of carparkInfo[0].ItemInfo) {
							g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].ShowColorBackup = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].Color;
							g_pog_json[p_pog_index].ColorBackup = "Y";
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							selectedObject.ShowColorBackup = selectedObject.material.color.getHex;
							l++;
						}
					}
				}
				render(p_pog_index);
			});
		} else {
			var i = 0;
			for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
				if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
					var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
					var shelfs_info = modules_info.ShelfInfo;
					var j = 0;
					for (const shelfs of shelfs_info) {
						var l = 0;
						for (const it of shelfs.ItemInfo) {
							var item_dtl = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l];
							item_dtl.Color = item_dtl.ShowColorBackup;
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							var newColor = item_dtl.Color.replace(/#/g, "0x");
							selectedObject.material.color.setHex(newColor);
							var child = selectedObject.children;
							for (m = 0; m < child.length; m++) {
								if (child[m].uuid == "horiz_facing") {
									child[m].material.color.setHex(newColor);
								}
							}
							g_pog_json[p_pog_index].ColorBackup = "Y";
							l++;
						}
						j++;
					}
					if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
						l = 0;
						for (const it of carparkInfo[0].ItemInfo) {
							g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].Color = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].ShowColorBackup;
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							var newColor = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].Color.replace(/#/g, "0x");
							selectedObject.material.color.setHex(newColor);
							var child = selectedObject.children;
							for (m = 0; m < child.length; m++) {
								if (child[m].uuid == "horiz_facing") {
									child[m].material.color.setHex(newColor);
								}
							}
							g_pog_json[p_pog_index].ColorBackup = "Y";
							l++;
						}
					}
				}
				i++;
			}
			render(p_pog_index);
		}
		logDebug("function : ShowColorBackup", "E");
	} catch (err) {
		error_handling(err);
	}
}

async function two_pog_diff_checker(p_pog_index, p_comViewIndex) {
	logDebug("function : two_pog_diff_checker", "S");
	var res = await reset_colors("O", p_pog_index);
	var res = await ShowColorBackup(p_pog_index);
	var deletedModules = [];
	var deletedShelves = [];
	var g_deletedItems = [];
	var addedItems = [];
	var positionChangeItemInfo = [];
	var positionChangeItemInfoCount = 0;
	var valid_values = ["SHELF", "PALLET", "HANGINGBAR", "PEGBOARD"];
	g_world = g_scene_objects[p_pog_index].scene.children[2];
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && typeof g_pog_json[p_comViewIndex].ModuleInfo !== "undefined") {
		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_right) {
			var moduleFound = "N";
			//check shelf missing and module missing
			$.each(g_pog_json[p_comViewIndex].ModuleInfo, function (h, modules_left) {
				if (modules_left.Module == modules_right.Module) {
					moduleFound = "Y";
					modules_left["ModuleFound"] = "Y";
					var shelfs_right = modules_right.ShelfInfo;
					var shelfs_left = modules_left.ShelfInfo;
					$.each(shelfs_right, function (j, shelfs_r) {
						if (valid_values.indexOf(shelfs_r.ObjType) !== -1) {
							var shelfFound = "N";
							$.each(shelfs_left, function (k, shelfs_l) {
								if (valid_values.indexOf(shelfs_l.ObjType) !== -1) {
									if (shelfs_r.Shelf == shelfs_l.Shelf) {
										shelfFound = "Y";
									}
								}
							});
							if (shelfFound == "N") {
								deletedShelves.push(shelfs_r.Shelf);
							}
						}
					});
				}
			});
			if (moduleFound == "N") {
				deletedModules.push(modules_right.Module);
			}
		});
		//check deleted items
		$.each(g_pog_json[p_comViewIndex].ModuleInfo, function (i, modules_info) {
			$.each(modules_info.ShelfInfo, function (k, shelf) {
				if (valid_values.indexOf(shelf.ObjType) !== -1) {
					$.each(shelf.ItemInfo, function (m, it) {
						var itemFound = "N";
						$.each(g_pog_json[p_pog_index].ModuleInfo, function (n, modules_info_comp) {
							$.each(modules_info_comp.ShelfInfo, function (o, shelf_comp) {
								if (valid_values.indexOf(shelf_comp.ObjType) !== -1) {
									$.each(shelf_comp.ItemInfo, function (p, it_comp) {
										if (it.ItemID == it_comp.ItemID) {
											itemFound = "Y";
										}
									});
								}
							});
						});
						if (itemFound == "N") {
							g_deletedItems.push(it.ItemID);
						}
					});
				}
			});
		});
		//items added
		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
			$.each(modules_info.ShelfInfo, function (k, shelf) {
				if (valid_values.indexOf(shelf.ObjType) !== -1) {
					$.each(shelf.ItemInfo, function (m, it) {
						var itemFound = "N";
						$.each(g_pog_json[p_comViewIndex].ModuleInfo, function (n, modules_info_comp) {
							$.each(modules_info_comp.ShelfInfo, function (o, shelf_comp) {
								if (valid_values.indexOf(shelf_comp.ObjType) !== -1) {
									$.each(shelf_comp.ItemInfo, function (p, it_comp) {
										if (it.ItemID == it_comp.ItemID) {
											itemFound = "Y";
										}
									});
								}
							});
						});
						if (itemFound == "N") {
							addedItems.push(it.ItemID);
						}
					});
				}
			});
		});
		//check position changed items
		$.each(g_pog_json[p_comViewIndex].ModuleInfo, function (i, modules_info) {
			$.each(modules_info.ShelfInfo, function (k, shelf) {
				if (valid_values.indexOf(shelf.ObjType) !== -1) {
					$.each(shelf.ItemInfo, function (m, it) {
						var positionChanged = "N";
						$.each(g_pog_json[p_pog_index].ModuleInfo, function (n, modules) {
							$.each(modules.ShelfInfo, function (o, shelfs) {
								$.each(shelfs.ItemInfo, function (p, items) {
									if (modules_info.Module == modules.Module && shelf.Shelf == shelfs.Shelf) {
										if (typeof shelfs.ItemInfo[m] !== "undefined") {
											if (shelf.ItemInfo[m].ItemID == shelfs.ItemInfo[m].ItemID) {
												positionChanged = "Y";
											} else {
												positionChangeItemInfo[positionChangeItemInfoCount] = {};
												positionChangeItemInfo[positionChangeItemInfoCount].Module = modules.Module;
												positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelfs.Shelf;
												positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelfs.ItemInfo[m].ItemID;
												positionChangeItemInfoCount++;
											}
										} else {
											positionChangeItemInfo[positionChangeItemInfoCount] = {};
											positionChangeItemInfo[positionChangeItemInfoCount].Module = modules_info.Module;
											positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelf.Shelf;
											positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelf.ItemInfo[m].ItemID;
											positionChangeItemInfoCount++;
										}
									}
								});
							});
						});
					});
				}
			});
		});

		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
			$.each(modules_info.ShelfInfo, function (k, shelf) {
				if (valid_values.indexOf(shelf.ObjType) !== -1) {
					$.each(shelf.ItemInfo, function (m, it) {
						var positionChanged = "N";
						$.each(g_pog_json[p_comViewIndex].ModuleInfo, function (n, modules) {
							$.each(modules.ShelfInfo, function (o, shelfs) {
								$.each(shelfs.ItemInfo, function (p, items) {
									if (modules_info.Module == modules.Module && shelf.Shelf == shelfs.Shelf) {
										if (typeof shelfs.ItemInfo[m] !== "undefined") {
											if (shelf.ItemInfo[m].ItemID == shelfs.ItemInfo[m].ItemID) {
												positionChanged = "Y";
											} else {
												positionChangeItemInfo[positionChangeItemInfoCount] = {};
												positionChangeItemInfo[positionChangeItemInfoCount].Module = modules.Module;
												positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelfs.Shelf;
												positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelfs.ItemInfo[m].ItemID;
												positionChangeItemInfoCount++;
											}
										} else {
											positionChangeItemInfo[positionChangeItemInfoCount] = {};
											positionChangeItemInfo[positionChangeItemInfoCount].Module = modules_info.Module;
											positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelf.Shelf;
											positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelf.ItemInfo[m].ItemID;
											positionChangeItemInfoCount++;
										}
									}
								});
							});
						});
					});
				}
			});
		});

		//SET REMOVED ITEMS
		$.each(g_pog_json[p_comViewIndex].ModuleInfo, function (i, modules_info) {
			//ASA-1464 Issue 1
			$.each(modules_info.ShelfInfo, function (k, shelf) {
				if (valid_values.indexOf(shelf.ObjType) !== -1) {
					$.each(shelf.ItemInfo, function (m, it) {
						var selectedObject = g_scene_objects[p_comViewIndex].scene.children[2].getObjectById(it.ObjID);
						if (g_deletedItems.indexOf(it.ItemID) !== -1) {
							if (g_show_live_image == "N") {
								selectedObject.material.color.setHex("0x" + g_compareColObj["REMOVE"]);
							}

							g_pog_json[p_comViewIndex].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x" + g_compareColObj["REMOVE"];
						} else {
							if (g_show_live_image == "N") {
								selectedObject.material.color.setHex(0xffffff);
							}
							g_pog_json[p_comViewIndex].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0xFFFFFF";
						}
					});
				}
			});
		});
		render(p_comViewIndex);

		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
			$.each(modules_info.ShelfInfo, function (k, shelf) {
				if (valid_values.indexOf(shelf.ObjType) !== -1) {
					$.each(shelf.ItemInfo, function (m, it) {
						var isItemPoisitionChanged = false;
						for (let itemInfo of positionChangeItemInfo) {
							if (itemInfo.ItemID == it.ItemID && itemInfo.Shelf == shelf.Shelf && itemInfo.Module == modules_info.Module) {
								isItemPoisitionChanged = true;
								break;
							}
						}
						if (isItemPoisitionChanged || deletedShelves.indexOf(shelf.Shelf) !== -1) {
							//ASA-1525 Issue 1 & 2
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							if (g_show_live_image == "N") {
								selectedObject.material.color.setHex("0x" + g_compareColObj["RETAIN_CHANGE"]);
							}

							g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x" + g_compareColObj["RETAIN_CHANGE"];
						} else {
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							if (g_show_live_image == "N") {
								selectedObject.material.color.setHex("0x" + g_compareColObj["RETAIN"]); //ASA-1537 #4
							}

							g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x" + g_compareColObj["RETAIN"];
						}
						if (addedItems.indexOf(it.ItemID) !== -1) {
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							if (g_show_live_image == "N") {
								selectedObject.material.color.setHex("0x" + g_compareColObj["ADD"]);
							}

							g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x" + g_compareColObj["ADD"];
						}
						if (it.NewYN == "Y") {
							var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
							if (g_show_live_image == "N") {
								selectedObject.material.color.setHex("0x" + g_compareColObj["NEW"]);
							}
							g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x" + g_compareColObj["NEW"];
						}
					});
				}
			});
		});
		render(p_pog_index);
	}
	logDebug("function : two_pog_diff_checker", "E");
}

async function switchCanvasView() {
	var containerH,
		containerW,
		rowCount,
		old_pogIndex = g_pog_index,
		rowCount = $("[data-row]").length;
	colCount = $("[data-col]").length;
	var drawRegW = $("#drawing_region").width();
	containerW = drawRegW;
	containerH = $("#canvas-holder .container").height();
	$("#canvas-holder .container").css("display", "grid");
	for (var i = 1; i <= rowCount; i++) {
		var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
		$("[data-row=" + i + "] .canvas-content").css("width", parseFloat((containerW / currColCOunt).toFixed(2)));
	}
	if (g_pog_json.length > 0) {
		g_canvas_objects = [];
		for (var i = 1; i <= g_pog_json.length; i++) {
			const pRenderer = g_renderer;
			const pScene = g_scene_objects[i - 1].scene;
			const pCamera = g_scene_objects[i - 1].scene.children.find((obj) => {
				return obj.type === "PerspectiveCamera";
			});
			var canvasName = "maincanvas" + (i == 1 ? "" : i);
			g_canvas = document.getElementById(canvasName);
			var canvasContainerH = $("#" + canvasName)
				.parent()
				.height();
			var canvasContainerW = $("#" + canvasName)
				.parent()
				.width();
			var canvasWidthOrg = canvasContainerW;
			var canvasHeightOrg = canvasContainerH;

			$("#" + canvasName)
				.css("height", canvasHeightOrg + "px !important")
				.css("width", canvasWidthOrg + "px !important");
			$("#" + canvasName).height(canvasHeightOrg);
			$("#" + canvasName).width(canvasWidthOrg);
			g_canvas.width = canvasWidthOrg;
			g_canvas.height = canvasHeightOrg;
			g_canvas_objects.push($("#" + canvasName)[0]);

			var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
			pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
			pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
			pCamera.updateProjectionMatrix();
			pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
			var details = get_min_max_xy(i - 1);
			var details_arr = details.split("###");
			set_camera_z(pCamera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i - 1);
			g_pog_index = i - 1;
			g_scene = pScene;
			g_camera = pCamera;
			render(i - 1);
		}
	}
	g_pog_index = old_pogIndex;
    //ASA - 1537 #12 Start
    if(g_isReportRender == 'Y'){
        $("#wpdSplitter_splitter_second")[0].style.setProperty("display", "block", "important");
        $("#maincanvas2-btns, #productInfoMainCont, .a-Splitter-barH").css("visibility", "visible");        
    }
    g_isReportRender = 'Y';
    //ASA - 1537 #12 End
    setTimeout(function(){
        $('.a-Splitter-barH').removeClass('is-active is-focused');
    },100);     //ASA-1537 #8
}


//ASA-1537 #8 Start
function set_item_blink(p_select_items) {
    logDebug("function : set_item_blink", "S");
    try {
        var m = 0;
        g_multiselect = "Y";
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            if (g_intersected) {
                for (var i = 0; i < g_intersected.length; i++) {
                    g_select_color = g_intersected[i].BorderColour;
                    g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                    if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                        g_intersected[i].WireframeObj.material.transparent = true;
                        g_intersected[i].WireframeObj.material.opacity = 0.0025;
                    }
                }
            }
            g_intersected = [];
            g_delete_details = [];
            if (typeof p_select_items !== "undefined") {
                for (var i = 0; i < p_select_items.length; i++) {
                    m = 0;
                    for (const pogs of g_pog_json) {
                            var j = 0;
                            for (const Modules of pogs.ModuleInfo) {
                                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                                    var k = 0;
                                    for (const Shelf of Modules.ShelfInfo) {
                                        if (typeof Shelf !== "undefined") {
                                            if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                                                var l = 0;
                                                for (const items of Shelf.ItemInfo) {
                                                    if (items.Item == p_select_items[i].getAttribute("data-id")) {
                                                        var selectedObject = g_scene_objects[m].scene.children[2].getObjectById(items.ObjID);
                                                        g_intersected.push(selectedObject);

                                                        var details = {};
                                                        details["p_pog_index"] = m;
                                                        details["ObjID"] = items.ObjID;
                                                        details["MIndex"] = j;
                                                        details["SIndex"] = k;
                                                        details["ObjWidth"] = items.W;
                                                        details["ObjHeight"] = items.H;
                                                        details["XAxis"] = items.X;
                                                        details["YAxis"] = items.Y;
                                                        details["ZAxis"] = items.Z;
                                                        details["IIndex"] = l;
                                                        details["ObjType"] = Shelf.ObjType;
                                                        details["IsDivider"] = "N";
                                                        details["Object"] = "ITEM";
                                                        details["MObjID"] = Modules.MObjID;
                                                        details["SObjID"] = Shelf.SObjID;
                                                        details["ItemID"] = items.ItemID;
                                                        details["Item"] = items.Item;
                                                        details["W"] = items.W;
                                                        details["H"] = items.H;
                                                        details["X"] = items.X;
                                                        details["Y"] = items.Y;
                                                        details["RW"] = items.RW;
                                                        details["Exists"] = "N";
                                                        details["Rotation"] = 0;
                                                        details["Slope"] = 0;
                                                        details["Distance"] = items.Distance;
                                                        details["TopObjID"] = items.TopObjID;
                                                        details["BottomObjID"] = items.BottomObjID;
                                                        g_delete_details.multi_delete_shelf_ind = "";
                                                        g_delete_details.push(details);
                                                        if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                            var shelfInfo = g_pog_json[m].ModuleInfo[j].ShelfInfo[k];
                                                            g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                            g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                                        }
                                                    }
                                                    l++;
                                                }
                                            }
                                        }
                                        k++;
                                    }
                                }
                                j++;
                            }
                        m++;
                    }
                }
                render_animate_selected();
            }
        }
        logDebug("function : set_item_blink", "E");
    } catch (err) {
        error_handling(err);
    }
}

function setUpItemBlink(){
    $("#item_detail_grid .a-GV-w-scroll tbody tr").click(function () {
    
        var currenttr = $(this);
        var select_object = [];
        g_lastSelectedRow = currenttr;
        $("#item_detail_grid .a-GV-w-scroll tr.selected").removeClass("selected");
        $(this).addClass("selected");
        var select_object = $("#item_detail_grid .a-GV-w-scroll tr.selected");
        if (typeof select_object !== "undefined") {
            set_item_blink(select_object);
            g_productselect = "Y";
        }
        setTimeout(function () {
            $("#item_detail_grid_ig_grid_vc_status").html(apex.lang.formatMessage("APEX.GV.SELECTION_COUNT", $("#item_detail_grid .a-GV-w-scroll tbody tr.selected").length));
        }, 200);
    });
}
//ASA-1537 #8 End