var l_new_pog_ind = "N";

//this is a common function which is used to set the details of any object selected into g_delete_details.
function setDetailsArray(p_objID, p_mIndex, p_sIndex, p_objWidth, p_objHeight, p_xAxis, p_yAxis, p_zAxis, p_iIndex, p_objType, p_isDivider, p_object, p_mObjID, p_sObjID, p_itemid, p_item, p_exists, p_rotation, p_slope, p_distance, p_topObjId, p_bottomObjId, p_startCanvas, p_present_canvas, p_pog_index) {
	var details = {};
	details["ObjID"] = p_objID;
	details["MIndex"] = p_mIndex;
	details["SIndex"] = p_sIndex;
	details["ObjWidth"] = p_objWidth;
	details["ObjHeight"] = p_objHeight;
	details["XAxis"] = p_xAxis;
	details["YAxis"] = p_yAxis;
	details["ZAxis"] = p_zAxis;
	details["IIndex"] = p_iIndex;
	details["ObjType"] = p_objType;
	details["IsDivider"] = p_isDivider;
	details["Object"] = p_object;
	details["MObjID"] = p_mObjID;
	details["SObjID"] = p_sObjID;
	details["ItemID"] = p_itemid;
	details["Item"] = p_item;
	details["Exists"] = p_exists;
	details["Rotation"] = p_rotation;
	details["Slope"] = p_slope;
	details["Distance"] = p_distance;
	details["TopObjID"] = p_topObjId;
	details["BottomObjID"] = p_bottomObjId;
	details["StartCanvas"] = p_startCanvas;
	details["g_present_canvas"] = p_present_canvas;
	details["p_pog_index"] = p_pog_index;

	if (p_object == "SHELF") {
		//ASA-1471 S
		details["AllowAutoCrush"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].AllowAutoCrush;
		details["Rotation"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Rotation; //0
		details["Slope"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Slope; //0
		details["Color"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Color;
		details["Combine"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Combine;
		details["LOverhang"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].LOverhang;
		details["ROverhang"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ROverhang;
		details["DivHeight"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivHeight == "undefined" ? 0 : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivHeight;
		details["DivWidth"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivWidth == "undefined" ? 0 : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivWidth;
		details["DivPst"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPst == "undefined" ? "N" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPst;
		details["DivPed"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPed == "undefined" ? "N" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPed;
		details["DivPbtwFace"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPbtwFace == "undefined" ? "N" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPbtwFace;
		details["NoDivIDShow"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].NoDivIDShow;
		details["DivFillCol"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivFillCol == "undefined" ? "#3D393D" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivFillCol;
		details["SpreadItem"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].SpreadItem;
		details["W"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].W;
		details["H"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].H;
		details["D"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].D;
		details["MaxMerch"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].MaxMerch;
	} //ASA-1471 S

	if (p_objType == "TEXTBOX") {
		details["FBold"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].FBold;
		details["FSize"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].FSize;
		details["FStyle"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].FStyle;
		details["InputText"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].InputText;
		details["TextImg"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextImg;
		details["TextImgMime"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextImgMime;
		details["TextImgName"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextImgName;
		details["ReduceToFit"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ReduceToFit;
        details["TextDirection"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextDirection;
		details["WrapText"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].WrapText;
	} //ASA-1669
	return details;
}

//this function is used in mouseup, when multi select is done using click drag multi select box. the area will be calculated and objects coming inside that
//area will be taken into g_delete_details. we use g_DragMouseStart, g_DragMouseEnd vector hold start and end position of the dragging.
async function get_multiselect_obj(p_pog_index) {
	logDebug("function : get_multiselect_obj", "S");
	try {
		g_delete_details = [];
		g_multi_drag_shelf_arr = [];
		g_multi_drag_item_arr = [];
		var carpark_object = "CARPARK_ITEM";
		g_dup_mod_list = await find_select_module(p_pog_index);
		if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
			var module_details = g_pog_json[p_pog_index].ModuleInfo;
			var j = 0;
			for (const Modules of module_details) {
				if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
					var k = 0;
					for (const Shelf of Modules.ShelfInfo) {
						if (typeof Shelf !== "undefined") {
							if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER") {
								if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
									var shelf_left = Shelf.X - Shelf.ShelfRotateWidth / 2;
									var shelf_right = Shelf.X + Shelf.ShelfRotateWidth / 2;
									var shelf_bottom = Shelf.Y - Shelf.ShelfRotateHeight / 2;
									var shelf_top = Shelf.Y + Shelf.ShelfRotateHeight / 2;
								} else {
									var shelf_left = Shelf.X - Shelf.W / 2;
									var shelf_right = Shelf.X + Shelf.W / 2;
									var shelf_bottom = Shelf.Y - Shelf.H / 2;
									var shelf_top = Shelf.Y + Shelf.H / 2;
								}
								//left to right and top to bottom
								if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
									if (shelf_left >= g_DragMouseStart.x && shelf_right >= g_DragMouseStart.x && shelf_bottom <= g_DragMouseStart.y && shelf_top <= g_DragMouseStart.y && shelf_left <= g_DragMouseEnd.x && shelf_right <= g_DragMouseEnd.x && shelf_bottom >= g_DragMouseEnd.y && shelf_top >= g_DragMouseEnd.y) {
										var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
										g_delete_details.multi_delete_shelf_ind = "";
										g_delete_details.push(details);
									}
									//right to left and top to bottom
								} else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
									if (shelf_left >= g_DragMouseEnd.x && shelf_right >= g_DragMouseEnd.x && shelf_bottom >= g_DragMouseEnd.y && shelf_top >= g_DragMouseEnd.y && shelf_left <= g_DragMouseStart.x && shelf_right <= g_DragMouseStart.x && shelf_bottom <= g_DragMouseStart.y && shelf_top <= g_DragMouseStart.y) {
										var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
										g_delete_details.multi_delete_shelf_ind = "";
										g_delete_details.push(details);
									}
									//left to right bottom to top
								} else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
									if (shelf_left >= g_DragMouseStart.x && shelf_right >= g_DragMouseStart.x && shelf_bottom >= g_DragMouseStart.y && shelf_top >= g_DragMouseStart.y && shelf_left <= g_DragMouseEnd.x && shelf_right <= g_DragMouseEnd.x && shelf_bottom <= g_DragMouseEnd.y && shelf_top <= g_DragMouseEnd.y) {
										var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
										g_delete_details.multi_delete_shelf_ind = "";
										g_delete_details.push(details);
									}
									//right to left bottom to top.
								} else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
									if (shelf_left <= g_DragMouseStart.x && shelf_right <= g_DragMouseStart.x && shelf_bottom >= g_DragMouseStart.y && shelf_top >= g_DragMouseStart.y && shelf_left >= g_DragMouseEnd.x && shelf_right >= g_DragMouseEnd.x && shelf_bottom <= g_DragMouseEnd.y && shelf_top <= g_DragMouseEnd.y) {
										var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
										g_delete_details.multi_delete_shelf_ind = "";
										g_delete_details.push(details);
									}
								}
								var l = 0;
								var itemsDetail = Shelf.ItemInfo;
								var sorto = {
									X: "asc",
								};
								itemsDetail.keySort(sorto);
								for (const items of itemsDetail) {
									var item_left = items.X - items.W / 2;
									var item_right = items.X + items.W / 2;
									var item_bottom = items.Y - items.H / 2;
									var item_top = items.Y + items.H / 2;
									if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
										if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y) {
											var is_divider = "N";
											var object = "ITEM";
											if (items.Item == "DIVIDER") {
												is_divider = "Y";
												object = "SHELF";
											}

											var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

											details["W"] = items.W;
											details["RW"] = items.RW;
											details["H"] = items.H;
											details["X"] = items.X;
											details["Y"] = items.Y;
											g_delete_details.multi_delete_shelf_ind = "";
											g_delete_details.push(details);
											if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
												var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
												g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
												g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
											}
										}
									} else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
										if (item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y && item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y) {
											var is_divider = "N";
											var object = "ITEM";
											if (items.Item == "DIVIDER") {
												is_divider = "Y";
												object = "SHELF";
											}

											var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

											details["W"] = items.W;
											details["RW"] = items.RW;
											details["H"] = items.H;
											details["X"] = items.X;
											details["Y"] = items.Y;

											g_delete_details.multi_delete_shelf_ind = "";
											g_delete_details.push(details);
											if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
												var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
												g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
												g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
											}
										}
									} else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
										if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
											var is_divider = "N";
											var object = "ITEM";
											if (items.Item == "DIVIDER") {
												is_divider = "Y";
												object = "SHELF";
											}
											var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

											details["W"] = items.W;
											details["RW"] = items.RW;
											details["H"] = items.H;
											details["X"] = items.X;
											details["Y"] = items.Y;

											g_delete_details.multi_delete_shelf_ind = "";
											g_delete_details.push(details);
											if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
												var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
												g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
												g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
											}
										}
									} else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
										if (item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
											var is_divider = "N";
											var object = "ITEM";
											if (items.Item == "DIVIDER") {
												is_divider = "Y";
												object = "SHELF";
											}
											var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

											details["W"] = items.W;
											details["RW"] = items.RW;
											details["H"] = items.H;
											details["X"] = items.X;
											details["Y"] = items.Y;

											g_delete_details.multi_delete_shelf_ind = "";
											g_delete_details.push(details);
											if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
												var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
												g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
												g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
											}
										}
									}
									l++;
								}
							}
						}
						k++;
					}
					var Carpark = Modules.Carpark;
					if (typeof Carpark !== "undefined" && Carpark.length > 0) {
						var l = 0;
						var itemsDetail = Modules.Carpark[0].ItemInfo;
						var sorto = {
							X: "asc",
						};
						itemsDetail.keySort(sorto);
						var is_divider = "N";
						for (const items of itemsDetail) {
							var item_left = items.X - items.W / 2;
							var item_right = items.X + items.W / 2;
							var item_bottom = items.Y - items.H / 2;
							var item_top = items.Y + items.H / 2;
							if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
								if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y) {
									var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

									details["W"] = items.W;
									details["RW"] = items.RW;
									details["H"] = items.H;
									details["X"] = items.X;
									details["Y"] = items.Y;
									details["IsCarpark"] = "Y";
									g_delete_details.multi_delete_shelf_ind = "";
									g_delete_details.multi_carpark_ind = "Y";
									g_delete_details.push(details);
								}
							} else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
								if (item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y && item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y) {
									var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

									details["W"] = items.W;
									details["RW"] = items.RW;
									details["H"] = items.H;
									details["X"] = items.X;
									details["Y"] = items.Y;
									details["IsCarpark"] = "Y";
									g_delete_details.multi_delete_shelf_ind = "";
									g_delete_details.multi_carpark_ind = "Y";
									g_delete_details.push(details);
								}
							} else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
								if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
									var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

									details["W"] = items.W;
									details["RW"] = items.RW;
									details["H"] = items.H;
									details["X"] = items.X;
									details["Y"] = items.Y;
									details["IsCarpark"] = "Y";
									g_delete_details.multi_delete_shelf_ind = "";
									g_delete_details.multi_carpark_ind = "Y";
									g_delete_details.push(details);
								}
							} else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
								if (item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
									var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

									details["W"] = items.W;
									details["RW"] = items.RW;
									details["H"] = items.H;
									details["X"] = items.X;
									details["Y"] = items.Y;
									details["IsCarpark"] = "Y";
									g_delete_details.multi_delete_shelf_ind = "";
									g_delete_details.multi_carpark_ind = "Y";
									g_delete_details.push(details);
								}
							}
							l++;
						}
					}
				}
				j++;
			}
			g_delete_details.StartCanvas = g_start_canvas;
			g_delete_details.g_present_canvas = g_present_canvas;
		}
		if (g_delete_details.multi_carpark_ind == "Y") {
			if (g_delete_details.some((e) => e.Object !== carpark_object)) {
				//Task_29818 - Start
				// ax_message.set({
				//     labels: {
				//         ok: get_message("SHCT_YES"),
				//         cancel: get_message("SHCT_NO"),
				//     },
				// });

				// ax_message.set({
				//     buttonReverse: true,
				// });

				// ax_message.confirm(get_message("CARPARK_MULTI_SEL_CONF"), function (e) {
				//     if (e) {
				//         for (var i = g_delete_details.length - 1; i >= 0; --i) {
				//             if (g_delete_details[i].Object !== carpark_object) {
				//                 g_delete_details.splice(i, 1);
				//             }
				//         }
				//         set_multi_blink(g_pog_json, p_pog_index);
				//     } else {
				//         g_delete_details = [];
				//         set_multi_blink(g_pog_json, p_pog_index);
				//     }
				// });

				confirm(
					get_message("CARPARK_MULTI_SEL_CONF"),
					get_message("SHCT_YES"),
					get_message("SHCT_NO"),
					function () {
						for (var i = g_delete_details.length - 1; i >= 0; --i) {
							if (g_delete_details[i].Object !== carpark_object) {
								g_delete_details.splice(i, 1);
							}
						}
						set_multi_blink(g_pog_json, p_pog_index);
					},
					function () {
						g_delete_details = [];
						set_multi_blink(g_pog_json, p_pog_index);
					}
				);
				//Task_29818 - End
			}
		}
		logDebug("function : get_multiselect_obj", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function is called inside context_cut, context_copy. when use click on an object and click copy or cut. we save that details in g_cut_copy_arr
function copy_selected_obj(p_action, p_pog_index) {
	logDebug("function : copy_selected_obj; action : " + p_action, "S");
	g_undo_all_obj_arr = [];
	if (g_module_edit_flag == "Y") {
		g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index])));
		g_cut_copy_arr[0].MObjID = "";
		if (p_action == "COPY") {
			var module_arr = g_pog_json[p_pog_index].ModuleInfo;
			var last_mod_name = "";
			var mod_name = "";
			$.each(module_arr, function (i, modules) {
				if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
					last_mod_name = modules.Module;
				}
			});
			if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
				mod_name = nextLetter(last_mod_name);
			} else {
				var mod_name = g_pog_json[p_pog_index].ModuleInfo.length + 1;
			}
			g_cut_copy_arr[0].Module = mod_name;
			g_cut_copy_arr[0].SeqNo = g_pog_json[p_pog_index].ModuleInfo.length + 1; //ASA - 1609 Issue 1
		}
		loc_details["MIndex"] = g_module_index;
		loc_details["SIndex"] = -1;
		loc_details["IIndex"] = -1;
		loc_details["ShelfObjType"] = "";
		loc_details["Item"] = "";
		loc_details["ModuleEdit"] = "Y";
		loc_details["ShelfEdit"] = "N";
		loc_details["ItemEdit"] = "N";
		loc_details["gPogIndex"] = p_pog_index;
		g_cut_loc_arr.push(loc_details);
		g_cut_copy_arr[0].loc_details = g_cut_loc_arr;
	} else if (g_shelf_edit_flag == "Y") {
		g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index])));
		g_cut_copy_arr[0].SObjID = "";

		loc_details["MIndex"] = g_module_index;
		loc_details["SIndex"] = g_shelf_index;
		loc_details["IIndex"] = -1;
		loc_details["ShelfObjType"] = g_shelf_object_type;
		loc_details["Item"] = "";
		loc_details["ModuleEdit"] = "N";
		loc_details["ShelfEdit"] = "Y";
		loc_details["ItemEdit"] = "N";
		loc_details["gPogIndex"] = p_pog_index;
		g_cut_loc_arr.push(loc_details);
		var child_module_index = -1;
		var module_arr = g_pog_json[p_pog_index].ModuleInfo;
		if (g_shelf_object_type == "TEXTBOX") {
			var i = 0;
			for (const modules of module_arr) {
				if (modules.ObjID == g_objectHit_id) {
					child_module_index = i;
					return;
				}
				i++;
			}
			if (child_module_index !== -1) {
				g_cut_support_obj_arr.push(g_pog_json[p_pog_index].ModuleInfo[child_module_index]);
			}
		}
	} else if (g_item_edit_flag == "Y") {
		var isDevider = g_carpark_item_flag == "Y" ? g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[g_shelf_index].ItemInfo[g_item_index].Item : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item;
		if (g_carpark_item_flag == "Y") {
			g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index])));
			loc_details["ShelfObjType"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[g_shelf_index].ItemInfo[g_item_index].CType;
			loc_details["Item"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[g_shelf_index].ItemInfo[g_item_index].Item;
			loc_details["SObjID"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[g_shelf_index].SObjID;
		} else {
			g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index])));
			loc_details["ShelfObjType"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CType;
			loc_details["Item"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item;
			loc_details["SObjID"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID;
		}
		g_cut_copy_arr[0].OldObjID = g_cut_copy_arr[0].ObjID;
		g_cut_copy_arr[0].ObjID = "";
		loc_details["MIndex"] = g_module_index;
		loc_details["SIndex"] = g_shelf_index;
		loc_details["IIndex"] = g_item_index;
		loc_details["ModuleEdit"] = "N";
		loc_details["ShelfEdit"] = "N";
		loc_details["ItemEdit"] = "Y";
		loc_details["gPogIndex"] = p_pog_index;
		g_cut_loc_arr.push(loc_details);
		g_cut_copy_arr[0].loc_details = g_cut_loc_arr;
		if (isDevider == "DIVIDER") {
			shelf_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo;
			var div_index = -1;
			var itemid = g_carpark_item_flag == "Y" ? g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[g_shelf_index].ItemInfo[g_item_index].ItemID : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].ItemID;
			var i = 0;
			for (const shelfs of shelf_arr) {
				if (shelfs.Shelf == itemid) {
					div_index = i;
				}
				i++;
			}
			if (div_index !== -1) {
				g_cut_support_obj_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[div_index])));
			}
		}
	}
	logDebug("function : copy_selected_obj", "E");
	return "SUCCESS";
}

//this function is called when user select a object and click on cut. could be right click cut or ctrl+X
async function context_cut(p_pog_index) {
	try {
		logDebug("function : context_cut", "S");
		g_cut_copy_arr = [];
		g_cut_support_obj_arr = [];
		g_cut_loc_arr = [];
		loc_details = {};
		g_cut_action_done = "Y";
		g_copy_action_done = "N";
		g_dup_action_done = "N";
		g_delete_action_done = "N";
		g_multi_delete_done = "N";
		g_multi_copy_done = "N";
		if (g_item_edit_flag == "Y") {
			var undoObjectsInfo = [];
			if (g_carpark_item_flag == "Y") {
				var objectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].SObjID;
				undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0])));
				var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo));
				undoObjectsInfo.IsCarpark = "Y";
			} else {
				var objectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID;
				undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index])));
				var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo));
			}
			undoObjectsInfo.moduleIndex = g_module_index;
			undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
			undoObjectsInfo.shelfIndex = g_shelf_index;
			undoObjectsInfo.actionType = "ITEM_DELETE";
			undoObjectsInfo.startCanvas = g_start_canvas;
			undoObjectsInfo.objectID = objectID;
			undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
			g_allUndoObjectsInfo.push(undoObjectsInfo);
			logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
			g_allUndoObjectsInfo = [];
		} else if (g_shelf_edit_flag == "Y") {
			var undoObjectsInfo = [];
			var objectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID;
			undoObjectsInfo.moduleIndex = g_module_index;
			undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
			undoObjectsInfo.shelfIndex = g_shelf_index;
			undoObjectsInfo.actionType = "SHELF_DELETE";
			undoObjectsInfo.startCanvas = g_start_canvas;
			undoObjectsInfo.objectID = objectID;
			undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
			undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index])));
			var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo));
			g_allUndoObjectsInfo.push(undoObjectsInfo);
			logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
			g_allUndoObjectsInfo = [];
		} else if (g_module_edit_flag == "Y") {
			async function doSomething() {
				var return_val = await update_undo_details("", "", g_module_index, "", "", "", "ITEM", g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID, "", "", "N", "", "", "", "", "CUT_MODULE", "", "", "", "", "", "U", "", "", "", "", p_pog_index);
			}
			doSomething();
		}

		var return_val = copy_selected_obj("CUT", p_pog_index);
		context_delete("CUT", g_module_index, g_shelf_index, g_item_index, g_item_edit_flag, g_module_edit_flag, g_shelf_edit_flag, g_objectHit_id, "", g_delete_details, g_camera, p_pog_index, "N");
		var module_sum = 0;
		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
			if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
				module_sum += modules.W;
			}
		});
		g_pog_json[p_pog_index].W = module_sum;

		if (g_pog_json[p_pog_index].BaseH > 0) {
			var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
			var hex_decimal = new THREE.Color(colorValue);
			g_pog_json[p_pog_index].BaseW = module_sum;
			g_pog_json[p_pog_index].BaseX = module_sum / 2;
			var return_val = await add_base("BASE1", module_sum, g_pog_json[p_pog_index].BaseH, g_pog_json[p_pog_index].BaseD, hex_decimal, module_sum / 2, g_pog_json[p_pog_index].BaseY, "Y", p_pog_index);
		}

        //ASA-2010 Issue2 Start
		if (g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
			const sceneGroup = g_scene_objects[1]?.scene?.children?.[2];
			if (sceneGroup) {
				const baseObj = sceneGroup.getObjectByProperty("uuid", "BASE1");

				if (baseObj) {
					sceneGroup.remove(baseObj);
					baseObj.geometry?.dispose();
					if (Array.isArray(baseObj.material)) {
						baseObj.material.forEach(m => m.dispose());
					} else {
						baseObj.material?.dispose();
					}
				}
				render(1);
			}
		}
		//ASA-2010 Issue2 End

		if (g_module_edit_flag == "Y") {
			var details = get_min_max_xy(p_pog_index);
			var details_arr = details.split("###");
			set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
			render(p_pog_index);
		}
		logDebug("function : context_cut", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function is called when user select an object and copy it can be right click copy or ctrl+C
function context_copy(p_multiselect_ind, p_pog_index) {
	try {
		logDebug("function : context_copy; multiselect_ind : " + p_multiselect_ind, "S");
		g_cut_copy_arr = [];
		g_cut_support_obj_arr = [];
		g_cut_loc_arr = [];
		loc_details = {};
		g_cut_action_done = "N";
		g_copy_action_done = "Y";
		g_dup_action_done = "N";
		g_delete_action_done = "N";
		g_multi_delete_done = "N";
		if (p_multiselect_ind == "S") {
			var return_val = copy_selected_obj("COPY", p_pog_index);
		} else {
			g_multi_copy_done = "Y";
			g_mselect_drag = "N";
			g_multiselect = "N";
			g_delete_details.StartCanvas = p_pog_index;
		}
		logDebug("function : context_copy", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function is called when click paste can be right click paste or ctrl+V . this function is also called from undo and duplicating object.
async function context_paste(p_action, p_camera, p_duplicating, p_item_copy = "Y", p_pog_index, p_startCanvas = -1) {
    logDebug("function : context_paste; action : " + p_action, "S");
	g_multi_copy_done = g_multiItemCopy == "Y" ? "Y" : g_multi_copy_done;
	var l_validate_passed = "Y";
	var l_newShelfCreated = "N";
	var l_dupItem = g_duplicating;
    var l_dupItem = "N";
	var l_newShelfId = -1;
	var l_sucess = "N";
	var confirm = "Y"; //ASA-1640 #6
	var draggedItems = []; //ASA-1640 #6
	var new_shelf_index = -1; //ASA-1780
	try {
		if (p_action == "CUT" || p_action == "COPY" || p_action == "UNDO") {
			//this block is only for single object copy or cut or undo
			if (g_multi_delete_done == "N" && g_multi_copy_done == "N") {
				if (g_cut_loc_arr[0].ModuleEdit == "Y") {
					if (p_action !== "UNDO") {
						var mod_num = 0;
						var i = 0;
						for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
							if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
								mod_num = i;
							}
							i++;
						}
						if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
							var next_name = nextLetter(g_pog_json[p_pog_index].ModuleInfo[mod_num].Module);
						} else {
							var next_name = (mod_num + 1).toString();
						}


                        // ASA-1964.1 Start
						// if (p_action == "COPY") {
						// 	g_cut_copy_arr[0].Module = next_name;
						// 	l_shelf_details = g_cut_copy_arr[0].ShelfInfo;
						// 	$.each(l_shelf_details, function (i, shelfs) {
						// 		g_cut_copy_arr[0].ShelfInfo[i].Shelf = next_name + (i + 1);
						// 	});
						// }
                        if (p_action == "COPY") {
                            g_cut_copy_arr[0].Module = next_name;
                            l_shelf_details = g_cut_copy_arr[0].ShelfInfo;
                            const dividerMap = {};
                            $.each(l_shelf_details, function (i, shelfs) {
                                var oldShelf = shelfs.Shelf;
                                var newShelf = next_name + (i + 1);
                                g_cut_copy_arr[0].ShelfInfo[i].Shelf = newShelf;

                                if (shelfs.ObjType === "DIVIDER") {
                                    var oldId = shelfs.ItemID || oldShelf;
                                    dividerMap[oldId] = newShelf;
                                    shelfs.ItemID = newShelf;
                                }
                            });
                            $.each(l_shelf_details, function (i, shelfs) {
                                var allItems = [].concat(shelfs.Items || [], shelfs.ItemInfo || []);
                                $.each(allItems, function (j, item) {
                                    if ((item.Item === "DIVIDER" || item.ObjType === "DIVIDER") && dividerMap[item.ItemID]) {
                                        item.ItemID = dividerMap[item.ItemID];
                                    }
                                });
                            });
                        }
                        // ASA-1964.1 End
                        
						if (p_item_copy == "N") {
							for (const shelf of g_cut_copy_arr[0].ShelfInfo) {
								shelf.ItemInfo = [];
							}
						}
						g_pog_json[p_pog_index].ModuleInfo.push(g_cut_copy_arr[0]);
						g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].SubDept = g_pog_json[p_pog_index].SubDept;
						var max_height = 0;
						var total_width = 0;
						for (const obj of g_pog_json[p_pog_index].ModuleInfo) {
							max_height = Math.max(max_height, obj.H);
							if (obj.ParentModule == null || typeof obj.ParentModule == "undefined") {
								total_width = total_width + obj.W;
							}
						}
						g_pog_json[p_pog_index].PrevH = g_pog_json[p_pog_index].H;
						g_pog_json[p_pog_index].PrevW = g_pog_json[p_pog_index].W;
						g_pog_json[p_pog_index].H = max_height + g_pog_json[p_pog_index].BaseH;
						g_pog_json[p_pog_index].W = total_width;
					} else {
						g_module_index = g_cut_loc_arr[0].MIndex;
						g_pog_json[p_pog_index].ModuleInfo.splice(g_cut_loc_arr[0].MIndex, 0, g_cut_copy_arr[0]);
					}
					var shelfArr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo;
					$.each(shelfArr, async function (i) {
						var ItemArr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[i].ItemInfo;

						for (const details of ItemArr) {
							g_deletedItems.push(details.ItemID);
						}
					});

					if (p_pog_index != p_startCanvas && g_multi_cnvs_drag_conf == "Y") {
						draggedItems = [...new Set(g_deletedItems)];
						confirm = await doItemMoveConf(draggedItems, g_pog_json, p_pog_index, -1, g_pog_json[p_pog_index].ModuleInfo.length - 1);
					} //ASA-1640 #6

					if (confirm != "N") {
						//we first log the added items into log. so that product list will change to green.
						let itemsFlag = await deleted_items_log(g_deletedItems, "A", p_pog_index);
						//we use this function which will recreate all modules after pasting new module.
						var res = await context_create_module(g_cut_copy_arr, p_camera, p_item_copy, p_pog_index, "N");
						var return_val = await update_undo_details("", "", g_pog_json[p_pog_index].ModuleInfo.length - 1, "", "", "", "ITEM", g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID, "", "", "N", "", "", "", "", "MODULE_CREATE", "", "", "", "", "", "U", "", "", "", "", p_pog_index);
					} else {
						g_pog_json[p_pog_index].ModuleInfo.pop();
					} //ASA-1640 #6

					g_cut_copy_arr = [];
					g_cut_support_obj_arr = [];
					g_cut_loc_arr = [];
					loc_details = {};
					g_cut_action_done = "N";
					g_copy_action_done = "N";
					g_dup_action_done = g_duplicating == "Y" ? "Y" : "N";
					g_delete_action_done = "N";
					g_multi_delete_done = "N";
					g_multi_copy_done = "N";
				} else if (g_cut_loc_arr[0].ShelfEdit == "Y") {
					if (g_cut_loc_arr[0].ShelfObjType == "TEXTBOX" && g_cut_support_obj_arr.length > 0) {
						g_pog_json[p_pog_index].ModuleInfo.push(g_cut_support_obj_arr[0]);
					}
					var new_shelf_y = 0;
					if (p_action !== "UNDO") {
						//ASA-1780 added if/else to separate logic for shelf/hangingbar and other objtype.
						var pog_json_push = "N";
						if (g_cut_loc_arr[0].ShelfObjType == "SHELF" || g_cut_loc_arr[0].ShelfObjType == "HANGINGBAR") {
							//ASA-1780 added to avoid error when user do ctrl+v and click on paste in menu.
							if (g_shelf_index != -1) {
								g_cut_copy_arr = [];
								g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index])));
								pog_json_push = "Y";
							} else {
								g_cut_copy_arr[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
								g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(g_cut_copy_arr[0]);
								g_shelf_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
								new_shelf_index = g_shelf_index;
								pog_json_push = "N";
							}
							// ASA-1780 get correct Y value on basis of merch/item height/default merch for shelf/hangingbar else return 0 for others objtype
							new_shelf_y = get_yaxis_on_paste(g_cut_copy_arr[0], g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo, g_module_index, g_shelf_index, p_pog_index);
							// ASA-1780 when shelf/hanging bar is out of module and is duplicate to last position break the flow
							if (new_shelf_y == -1) {
								g_cut_copy_arr = [];
								g_cut_support_obj_arr = [];
								g_cut_loc_arr = [];
								loc_details = {};
								g_cut_action_done = "N";
								g_copy_action_done = "N";
								g_dup_action_done = "N";
								g_delete_action_done = "N";
								g_multi_delete_done = "N";
								g_multi_copy_done = "N";
								return;
							}
							if (pog_json_push == "Y") {
								g_cut_copy_arr[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
								g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(g_cut_copy_arr[0]);
								new_shelf_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
							}
						} else {
							g_cut_copy_arr[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(g_cut_copy_arr[0]);
							g_shelf_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
							new_shelf_index = g_shelf_index;
						}
					} else {
						g_module_index = g_cut_loc_arr[0].MIndex;
						g_shelf_index = g_cut_loc_arr[0].SIndex;
						g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo.splice(g_cut_loc_arr[0].SIndex, 0, g_cut_copy_arr[0]);
						new_shelf_index = g_shelf_index; //ASA-1780
					}

					var ItemsArr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo;

					for (const details of g_delete_details) {
						if (details.IIndex !== -1) {
							g_deletedItems.push(details.ItemID);
						}
					}
					//we first log the added items into log. so that product list will change to green.
					let res = await deleted_items_log(g_deletedItems, "A", p_pog_index);
					var same_location = "N";
					if ((g_cut_loc_arr[0].MIndex == g_module_index && g_cut_loc_arr[0].gPogIndex == p_pog_index && p_action == "CUT") || p_action == "UNDO") {
						same_location = "Y";
					}
					if (p_action == "COPY") {
						g_cut_copy_arr[0].ItemInfo = [];
					}

					var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(g_cut_copy_arr[0], -1, -1, g_module_index, new_shelf_index, "N", same_location, p_camera, "Y", "", "Y", p_pog_index, new_shelf_y); //ASA-1780 added p_merch
					var undoObjectsInfo = [];
					var objectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[new_shelf_index].SObjID;//ASA-1780, new_shelf_index was g_shelf_index
					undoObjectsInfo.moduleIndex = g_module_index;
					undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
					undoObjectsInfo.shelfIndex = new_shelf_index;//ASA-1780
					undoObjectsInfo.actionType = "DUPLICATE_SHELF";
					undoObjectsInfo.startCanvas = p_pog_index;
					undoObjectsInfo.g_present_canvas = g_cut_loc_arr[0].gPogIndex;
					undoObjectsInfo.objectID = objectID;
					undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
					undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[new_shelf_index])));//ASA-1780
					var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[new_shelf_index].ItemInfo));//ASA-1780
					g_allUndoObjectsInfo.push(undoObjectsInfo);

					logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
					g_allUndoObjectsInfo = [];
					g_cut_copy_arr = [];
					g_cut_support_obj_arr = [];
					// g_cut_loc_arr = [];//ASA-1780
					loc_details = {};
					g_cut_action_done = "N";
					//ASA-1780 only g_copy_action_done = 'Y' when shelf/hangingbar.
					if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "SHELF" || g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "HANGINGBAR") {
						g_copy_action_done = "Y";
					} else {
						g_copy_action_done = "N";
						g_cut_loc_arr = [];
					}
					g_dup_action_done = "N";
					g_delete_action_done = "N";
					g_multi_delete_done = "N";
					g_multi_copy_done = "N";
				} else if ((g_cut_loc_arr[0].ItemEdit == "Y" && g_module_index > -1 && g_shelf_index > -1 && g_module_index !== "" && g_shelf_index !== "" && g_cut_copy_arr.length > 0) || (g_cut_loc_arr[0].ItemEdit == "Y" && p_action == "UNDO" && (g_cut_action_done == "Y" || g_delete_action_done == "Y"))) {
					var locationX = g_intersects[0].point.x;
					var locationY = g_intersects[0].point.y;
					var locationZ = g_intersects[0].point.z;
					var coords = new THREE.Vector3(locationX, locationY, locationZ);
					g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);
					var l_final_x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
					var l_final_y = Math.min(19, Math.max(-19, coords.y));

					//this below code will work for duplicating item.
					if (g_duplicating == "Y" && g_cut_copy_arr[0].Item !== "DIVIDER") {
						var shelfs = g_pog_json[p_startCanvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
						g_shelf_edit_flag = "N";
						var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(l_final_x, l_final_y, g_shelf_edit_flag, g_module_index, g_shelf_index, shelfs, p_pog_index);
						var [item_inside_world, curr_module, div_object_type, shelfY, shelfHieght, div_shelf_index, shelf_found] = get_div_shelf_index(l_final_x, l_final_y, curr_module, item_inside_world, p_pog_index, "", false); //ASA-1592
						if (div_shelf_index !== -1) {
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index];
							g_shelf_edit_flag = "N";
							//check if the item is pasted on the shelf which is combined shelf.
							[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf);
							var spread_product = shelfs.SpreadItem;
							if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
								spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
								if (spread_product == "R") {
									div_shelf_index = g_combinedShelfs[currCombinationIndex][0].SIndex;
									curr_module = g_combinedShelfs[currCombinationIndex][0].MIndex;
								} else {
									div_shelf_index = g_combinedShelfs[currCombinationIndex][g_combinedShelfs[currCombinationIndex].length - 1].SIndex;
									curr_module = g_combinedShelfs[currCombinationIndex][g_combinedShelfs[currCombinationIndex].length - 1].MIndex;
								}
							}
						}
						g_shelf_index = div_shelf_index;
						g_module_index = curr_module;
						//this is a feature when your duplicating an item and the place user clicked dont have any shelf. then create a new shelf.
						if (div_shelf_index == -1) {
							var [index, objId] = await duplicateShelf(p_camera, p_pog_index);
							console.log("new shelf index returned", index, objId);
							console.log("res ", res);
							g_shelf_index = index;
							l_newShelfCreated = "Y";
							g_module_index = curr_module;
							shelf_obj_type = "SHELF";
							l_validate_passed = validate_shelf_min_distance(g_module_index, g_shelf_index, l_final_y, "", "N", g_module_index, l_final_x, "Y", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index], p_pog_index);
							l_newShelfId = objId;
						}
						//if validation fails remove the shelf and revert the paste.
						if (l_validate_passed == "N") {
							var object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID);
							g_scene_objects[p_pog_index].scene.children[2].remove(object);
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.splice(g_shelf_index, 1);
						} else {
							g_shelf_index = g_shelf_index;
							shelf_obj_type = "SHELF";
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType = shelf_obj_type;
							g_cut_copy_arr[0].X = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2;
							g_cut_copy_arr[0].Y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2;
						}
					} else if (g_duplicating == "Y" && g_cut_copy_arr[0].Item == "DIVIDER") {
						shelf_obj_type = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType;
						g_cut_copy_arr[0].X = l_final_x;
						g_cut_copy_arr[0].Y = l_final_y;
					} else {
						if (g_shelf_index !== -1) {
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
							g_shelf_edit_flag = "N";

							[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf);
							var spread_product = shelfs.SpreadItem;
							if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
								spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
								if (spread_product == "R") {
									g_shelf_index = g_combinedShelfs[currCombinationIndex][0].SIndex;
									g_module_index = g_combinedShelfs[currCombinationIndex][0].MIndex;
								} else {
									g_shelf_index = g_combinedShelfs[currCombinationIndex][g_combinedShelfs[currCombinationIndex].length - 1].SIndex;
									g_module_index = g_combinedShelfs[currCombinationIndex][g_combinedShelfs[currCombinationIndex].length - 1].MIndex;
								}
							}
						}
						shelf_obj_type = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType;
					}
					if (l_validate_passed == "Y") {
						if (p_action !== "UNDO") {
							var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
							[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
							var spread_product = shelfdtl.SpreadItem;
							if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
								spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
							}
							var undoObjectsInfo = [];
							undoObjectsInfo.moduleIndex = g_module_index;
							undoObjectsInfo.shelfIndex = g_shelf_index;
							undoObjectsInfo.actionType = "ITEM_DELETE";
							undoObjectsInfo.startCanvas = p_pog_index;
							undoObjectsInfo.g_present_canvas = g_start_canvas;
							undoObjectsInfo.objectID = shelfdtl.SObjID;
							undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
							undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
							undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
							g_allUndoObjectsInfo.push(undoObjectsInfo);
							g_cut_copy_arr[0].Dragged = "N";
							g_cut_copy_arr[0].Exists = "Y";
							g_cut_copy_arr[0].DfacingUpd = "Y"; //ASA-1150
							if (spread_product == "M") {
								g_cut_copy_arr[0].X = l_final_x;
								g_cut_copy_arr[0].Y = l_final_y;
							}
							if (g_cut_loc_arr[0].ShelfObjType !== "PALLET" && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "PALLET") {
								g_cut_copy_arr[0].Z = 0 + g_cut_copy_arr[0].D / 2;
							}
							var rand_value = Math.floor(Math.random() * 999999);
							if (g_cut_loc_arr[0].Item == "DIVIDER") {
								g_cut_copy_arr[0].ItemID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
								g_cut_copy_arr[0].ObjID = rand_value; // Math.floor(Math.random() * 900000);
							}

							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.push(g_cut_copy_arr[0]);
							g_item_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1;
							if (g_cut_loc_arr[0].Item == "DIVIDER") {
								g_cut_support_obj_arr[0].ShelfDivObjID = rand_value;
								g_cut_support_obj_arr[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
								g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(g_cut_support_obj_arr[0]);
							}
						} else {
							g_module_index = g_cut_loc_arr[0].MIndex;
							g_item_index = g_cut_loc_arr[0].IIndex;
							shelf_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo;
							if (g_cut_loc_arr[0].Item == "DIVIDER") {
								var div_index = -1;
								$.each(shelf_arr, function (i, shelfs) {
									if (shelfs.SObjID == g_cut_loc_arr[0].SObjID) {
										div_index = i;
									}
								});
								g_shelf_index = div_index;
							} else {
								g_shelf_index = g_cut_loc_arr[0].SIndex;
							}
							if (typeof g_cut_copy_arr[0].BottomObjID !== "undefined" && g_cut_copy_arr[0].BottomObjID !== "") {
								items_arr = g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo;
								$.each(items_arr, function (i, items) {
									if (g_cut_copy_arr[0].BottomObjID == items.OldObjID) {
										g_cut_copy_arr[0].BottomObjID = items.ObjID;
										g_cut_copy_arr[0].X = items.X;
										g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo[i].TopObjID = g_cut_copy_arr[0].ObjID;
										return false;
									}
								});
							} else if (typeof g_cut_copy_arr[0].TopObjID !== "undefined" && g_cut_copy_arr[0].TopObjID !== "") {
								items_arr = g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo;
								$.each(items_arr, function (i, items) {
									if (g_cut_copy_arr[0].TopObjID == items.OldObjID) {
										g_cut_copy_arr[0].TopObjID = items.ObjID;
										g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo[i].BottomObjID = g_cut_copy_arr[0].ObjID;
										g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo[i].X = g_cut_copy_arr[0].X;
										g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo[i].Y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 + g_cut_copy_arr[0].H + g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo[i].H / 2;
										return false;
									}
								});
							}

							g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo[g_shelf_index].ItemInfo.splice(g_cut_loc_arr[0].IIndex, 0, g_cut_copy_arr[0]);
							g_deletedItems.push(g_cut_loc_arr[0].Item);
							let res = deleted_items_log(g_deletedItems, "A", p_pog_index);

							if (g_cut_loc_arr[0].Item == "DIVIDER") {
								g_pog_json[p_pog_index].ModuleInfo[g_cut_loc_arr[0].MIndex].ShelfInfo.push(g_cut_support_obj_arr[0]);
							}
						}
						if (g_copy_action_done == "Y" || g_cut_action_done == "Y" || g_multi_copy_done == "Y") {
							g_cut_copy_arr[0].TopObjID = "";
							g_cut_copy_arr[0].BottomObjID = "";
						}

						var item_width_arr = [],
							item_height_arr = [],
							item_depth_arr = [],
							item_index_arr = [];
						var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo;
						var itemy = 0;
						var shelfY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
						console.log("shelf item y", shelf_obj_type, items_arr.length);

						if (items_arr.length > 0) {
							if (shelf_obj_type == "SHELF" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "N") || shelf_obj_type == "BASKET" || shelf_obj_type == "PALLET") {
								itemy = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 + g_cut_copy_arr[0].H / 2;
							} else if (shelf_obj_type == "PEGBOARD") {
								itemy = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 - g_cut_copy_arr[0].H / 2 - 0.01 - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].VertiStart;
							} else if (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y") {
								itemy = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 - g_cut_copy_arr[0].H / 2 - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].VertiStart;
							} else if (shelf_obj_type == "HANGINGBAR") {
								itemy = shelfY - g_cut_copy_arr[0].H / 2;
							} else if (shelf_obj_type == "ROD") {
								itemy = shelfY - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 - g_cut_copy_arr[0].H / 2;
							}
							if ((typeof g_cut_copy_arr[0].BottomObjID !== "undefined" && g_cut_copy_arr[0].BottomObjID !== "") || (typeof g_cut_copy_arr[0].TopObjID !== "undefined" && g_cut_copy_arr[0].TopObjID !== "")) {
								var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
								update_top_bottom_xy(g_module_index, g_shelf_index, g_item_index, items_arr, p_pog_index);
							} else {
								if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item == "DIVIDER" && g_duplicating == "Y") {
									console.log("duplicate divider");
								} else {
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y = itemy;
								}
							}

							var CrushHoriz = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CrushHoriz;
							var CrushVert = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CrushHoriz;
							var CrushDepth = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CrushD;
							var item_fixed = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Fixed;
							item_width_arr.push(wpdSetFixed(g_cut_copy_arr[0].W)); //.toFixed(4)));
							item_height_arr.push(wpdSetFixed(g_cut_copy_arr[0].H)); //.toFixed(4)));
							item_depth_arr.push(wpdSetFixed(g_cut_copy_arr[0].D)); //.toFixed(4)));
							item_index_arr.push(g_item_index);

							var l_edit_ind = "N";
							if (g_cut_loc_arr[0].MIndex == g_module_index && g_cut_loc_arr[0].SIndex == g_shelf_index) {
								l_edit_ind = "Y";
							}
							var return_val = "N";
							var spread_gap = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].HorizGap;
							var horiz_gap = spread_gap;
							var item_length = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length;
							var allow_crush = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].AllowAutoCrush;

							if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
								var i = 0;
								for (const fitems of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo) {
									if (fitems.ObjID == g_cut_copy_arr[0].ObjID) {
										g_item_index = i;
										break; //return false;
									}
									i++;
								}
								if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].FromProductList = "Y";
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Edited = "N";
								}
								var new_x = get_item_xaxis(g_cut_copy_arr[0].W, g_cut_copy_arr[0].H, g_cut_copy_arr[0].D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, g_module_index, g_shelf_index, g_item_index, "Y", item_length, "N", p_pog_index, "Y", "Y"); //ASA-1927 Issue-1
								if (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y") {
									console.log("do nothing");
								} else if (shelf_obj_type !== "PEGBOARD") {
									return_val = item_height_validation(g_cut_copy_arr[0].H, g_module_index, g_shelf_index, g_item_index, "Y", -1, allow_crush, CrushVert, item_fixed, "Y", g_cut_copy_arr[0].D, "N", p_pog_index);
								}

								if (return_val == "N") {
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X = new_x;
								}
                                //ASA-2029 Start
   								// let l_x_val = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine == "N" ? -1 : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H/2;
                                // if ((shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR") && shelfdtl.Combine !== "N") {
                                //     [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Shelf);
                                // }
                                // if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                //     await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, locx ? locx : l_x_val, "Y", "N", -1, 0, []);
                                // }


                                 // ASA-2029 -start  Issue no 4
                                var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                                let l_x_val = shelfdtl.Combine == "N" ? -1 : shelfdtl.Y + shelfdtl.H/2;
                                if ((shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR") && shelfdtl.Combine !== "N") {
                                    [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
                                }
                                if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                    //ASA-2029 Start
                                    var pastedItem = shelfdtl.ItemInfo[g_item_index];
                                    if (typeof pastedItem !== "undefined") {
                                         if (!pastedItem.ObjID) {
                                            pastedItem.ObjID = Math.floor(Math.random() * 999999);
                                        }
                                        var drag_details_arr = [{
                                            MIndex: g_module_index,
                                            SIndex: g_shelf_index,
                                            IIndex: g_item_index,
                                            Iobjid: pastedItem.ObjID
                                        }];
                                        await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, locx ? locx : l_x_val, "Y", "N", -1, 0, drag_details_arr,"Y"); //ASA-2029  Issue4 Case(c)
                                        if (drag_details_arr.length > 0) {
                                            g_module_index = drag_details_arr[0].MIndex;
                                            g_shelf_index = drag_details_arr[0].SIndex;
                                            g_item_index = drag_details_arr[0].IIndex;
                                            item_index_arr = [g_item_index];
                                        }
                                    }
                                    
                                }
                                    //ASA-2029 End
                                    
                                var drag_item_arr = [];
								if (return_val == "N" && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelf_obj_type, g_module_index, g_shelf_index, g_item_index, l_edit_ind, CrushHoriz, CrushVert, CrushDepth, -1, "N", "N", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
                                    var locx = "";
                                    var edit_item_index = -1;
                                    if (g_mousedown_locx !== "" && typeof g_mousedown_locx !== "undefined") {
                                        locx = g_mousedown_locx;
                                    }
									if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "PEGBOARD" || (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjTyp == "CHEST" && g_chest_as_pegboard == "Y")) {
										edit_item_index = 0;
									} else if (p_action !== "UNDO") {
										edit_item_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1;
									} else {
										edit_item_index = g_item_index;
									}
   									 let c =  await reset_auto_crush(g_module_index, g_shelf_index, -1, p_pog_index, g_module_index, g_shelf_index, p_pog_index); //ASA-1343 issue 1 //ASA-1685
                                    console.log(c)
									var res = await set_auto_facings(g_module_index, g_shelf_index, edit_item_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[edit_item_index], "B", "I", "D", p_pog_index); //ASA-1273 Prasanna
									return_val = await recreate_all_items(g_module_index, g_shelf_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType, "Y", locx, edit_item_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
									g_cut_copy_arr = [];
									g_cut_support_obj_arr = [];
									g_cut_loc_arr = [];
									loc_details = {};
									g_cut_action_done = "N";
									g_copy_action_done = "N";
									g_dup_action_done = "N";
									g_delete_action_done = "N";
									g_multi_delete_done = "N";
									g_multi_copy_done = "N";
									update_item_distance(g_module_index, g_shelf_index, p_pog_index);

									logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
									g_allUndoObjectsInfo = [];

									l_sucess = "Y";
                                    //ASA-1907 Issue-3 Start
                                    if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0]?.ItemInfo?.length == 0) { // Regression Fix
                                        var selectObjects = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].SObjID);
                                        g_scene_objects[p_pog_index].scene.children[2].remove(selectObjects);
                                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark.splice(0, 1);
                                    }
                                    //ASA-1907 Issue-3 End
								} else {
									var item_ind = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1;
									console.log("l_dup_item", l_dupItem, l_newShelfCreated, g_shelf_index, l_newShelfId, l_validate_passed, g_module_index);
									if (l_dupItem == "Y" && l_newShelfCreated == "Y") {
										g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.splice(g_shelf_index, 1);
										if (l_newShelfId !== -1) {
											var object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(l_newShelfId);
											g_scene_objects[p_pog_index].scene.children[2].remove(object);
										}
									}
									if (item_ind == 0 && l_newShelfId == -1) {
										g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.splice(item_ind, item_ind + 1);
									} else if (item_ind > 0 && l_newShelfId == -1) {
										g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.splice(item_ind, 1);
									}
									l_sucess = "N";
								}
							}
						}
					}
					render(p_pog_index);
				}
			} else if (g_multi_copy_done == "Y") {
				// when multiple objects are selected and copied, we separate shelfs and individual items into different array and get it for different processing.
				var [l_shelf_details, item_details] = get_multi_item_shelf(g_delete_details, g_delete_details.StartCanvas);
				if (typeof l_shelf_details !== "undefined" && typeof item_details !== "undefined") {
					//shelfs creation first.
					if (l_shelf_details.length > 0) {
						for (const details of l_shelf_details) {
							var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(l_final_x, l_final_y, g_shelf_edit_flag, g_module_index, g_shelf_index, details.ShelfInfo[0], p_pog_index);
							g_module_index = curr_module;
							if (details.ObjType == "TEXTBOX") {
								g_pog_json[p_pog_index].ModuleInfo.push(details.support_obj[0]);
							}

							details.ShelfInfo[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(details.ShelfInfo[0]);
							g_shelf_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;

							var ItemsArr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo;

							for (const details of ItemsArr) {
								details.ObjID = "";
							}

							var same_location = "N";
							//use this function to create the pasted shelf in the new location.
							var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(details.ShelfInfo[0], -1, -1, g_module_index, g_shelf_index, "N", same_location, p_camera, "Y", "", p_item_copy, p_pog_index,-1);
							var undoObjectsInfo = [];
							var objectID = shelfID;
							undoObjectsInfo.moduleIndex = g_module_index;
							undoObjectsInfo.shelfIndex = g_shelf_index;
							undoObjectsInfo.actionType = "DUPLICATE_SHELF";
							undoObjectsInfo.startCanvas = p_pog_index;
							undoObjectsInfo.g_present_canvas = g_start_canvas;
							undoObjectsInfo.objectID = objectID;
							undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
							undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
							undoObjectsInfo.push(JSON.parse(JSON.stringify(details.ShelfInfo[0])));
							g_allUndoObjectsInfo.push(undoObjectsInfo);
							logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
						}
					} else if (item_details.length > 0) {
						if (g_intersects.length !== 0) {
							var locationX = g_intersects[0].point.x;
							var locationY = g_intersects[0].point.y;
							var locationZ = g_intersects[0].point.z;
						} else {
							var locationX = g_pog_json[item_details[0].p_pog_index].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].X;
							var locationY = g_pog_json[item_details[0].p_pog_index].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].Y;
							var locationZ = g_pog_json[item_details[0].p_pog_index].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].Z;
						}
						//we find out the currently clicked location and try to ge the
						var coords = new THREE.Vector3(locationX, locationY, locationZ);
						g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);
						var l_final_x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
						var l_final_y = Math.min(19, Math.max(-19, coords.y));
						//set the X and Y distance of each item based on the mouse cursor point.
						await update_array_xy_distance(item_details, l_final_x, l_final_y);

						var shelfs = g_pog_json[item_details[0].StartCanvas].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex];
						g_shelf_edit_flag = "N";

						var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = await get_curr_module(l_final_x, l_final_y, g_shelf_edit_flag, g_module_index, g_shelf_index, shelfs, p_pog_index);

						var [item_inside_world, curr_module, div_object_type, shelfY, shelfHieght, div_shelf_index, shelf_found] = await get_div_shelf_index(l_final_x, l_final_y, curr_module, item_inside_world, p_pog_index, "", false); //ASA-1592
						var spread_product; //ASA-1438 Task 1
						if (div_shelf_index !== -1) {
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index];
							g_shelf_edit_flag = "N";

							[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf);
							spread_product = shelfs.SpreadItem; ///ASA-1438 Task 1
							if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
								spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
								if (spread_product == "R") {
									div_shelf_index = g_combinedShelfs[currCombinationIndex][0].SIndex;
									curr_module = g_combinedShelfs[currCombinationIndex][0].MIndex;
								} else {
									div_shelf_index = g_combinedShelfs[currCombinationIndex][g_combinedShelfs[currCombinationIndex].length - 1].SIndex;
									curr_module = g_combinedShelfs[currCombinationIndex][g_combinedShelfs[currCombinationIndex].length - 1].MIndex;
								}
							}
						}

						var z = 0;
						//now run the loop on each item and set the new x and y and try to process validation.
						for (const objects of item_details) {
							if (z == 0 && div_object_type == "PEGBOARD") {
								//ASA-1125
								var act_x = l_final_x + objects.XDistance + 0.01;
							} else if (div_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
								var act_x = l_final_x + objects.XDistance;
							} else {
								var act_x = l_final_x + objects.XDistance;
							}
							if ((div_object_type == "PEGBOARD" && objects.ObjType == "PEGBOARD") || (div_object_type == "CHEST" && objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
								//ASA-1125
								var act_y = l_final_y - objects.YDistance;
							} else {
								var act_y = l_final_y + objects.YDistance;
							}
							objects.ItemObj[0].X = act_x;
							objects.ItemObj[0].Y = act_y;
							objects.ItemObj[0].DropY = act_y;
							z++;
						}

						g_shelf_index = div_shelf_index;
						g_module_index = curr_module;
						if (div_shelf_index == -1) {
							var newInd = -1;
							var i = 0;
							if (newInd == -1) {
								var [index, objId] = await duplicateShelf(p_camera, p_pog_index);
								shelf_obj_type = "SHELF";
								g_shelf_index = index;

								g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType = shelf_obj_type;
							} else {
								g_shelf_index = newInd;
								shelf_obj_type = div_object_type;
							}
						} else {
							shelf_obj_type = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType;
						}
						valid = "Y";
						var z = 0;
						var old_shelf_index = -1;
						var copyItemInfo = []; //ASA-1640 #6
						for (const details of item_details) {
							if (z == 0 || g_shelf_index !== old_shelf_index) {
								old_shelf_index = g_shelf_index;
								var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
								var undoObjectsInfo = [];
								undoObjectsInfo.moduleIndex = g_module_index;
								undoObjectsInfo.shelfIndex = g_shelf_index;
								undoObjectsInfo.actionType = "ITEM_DELETE";
								undoObjectsInfo.startCanvas = p_pog_index;
								undoObjectsInfo.g_present_canvas = g_start_canvas;
								undoObjectsInfo.objectID = shelfdtl.SObjID;
								undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
								undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
								undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
								g_allUndoObjectsInfo.push(undoObjectsInfo);
							}

							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.push(details.ItemObj[0]);
							g_item_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1;

							copyItemInfo.push({ MIndex: g_module_index, SIndex: g_shelf_index, IIndex: g_item_index, ItemID: details.ItemID }); //ASA-1640 #6
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].IsCopied = "Y"; //ASA-1640 #6
							

                            if (details.ItemObj[0].Item == "DIVIDER") {
                                // ASA-1862 Start
                                var rand_value = Math.floor(Math.random() * 999999);
                                details.ItemObj[0].ItemID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
                                details.ItemObj[0].ObjID = rand_value;
                                details.support_obj[0].ShelfDivObjID = rand_value;
                                details.support_obj[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);                                
                                // ASA-1862 End
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(details.support_obj[0]);
                            }

							if (g_copy_action_done == "Y" || g_cut_action_done == "Y" || g_multi_copy_done == "Y") {
								details.ItemObj[0].TopObjID = "";
								details.ItemObj[0].BottomObjID = "";
								//ASA-1150
							}
							details.ItemObj[0].DfacingUpd = "Y";
							details.ItemObj[0].ObjID = "";
							var item_width_arr = [],
								item_height_arr = [],
								item_depth_arr = [],
								item_index_arr = [],
								shelf_obj_type = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType;
							var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo;
							var itemy = 0;
							var shelfY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
							if (items_arr.length > 0) {
								if (shelf_obj_type == "SHELF" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "N") || shelf_obj_type == "BASKET" || shelf_obj_type == "PALLET") {
									itemy = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 + details.ItemObj[0].H / 2;
								} else if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
									if (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y") {
										itemy = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 - details.ItemObj[0].H / 2 - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].VertiStart;
									} else {
										itemy = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 - details.ItemObj[0].H / 2 - 0.01 - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].VertiStart;
									}
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].FromProductList = "N";
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Exists = "N";
								} else if (shelf_obj_type == "HANGINGBAR") {
									itemy = shelfY - details.ItemObj[0].H / 2;
								} else if (shelf_obj_type == "ROD") {
									itemy = shelfY - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2 - details.ItemObj[0].H / 2;
								}
								if ((typeof details.ItemObj[0].BottomObjID !== "undefined" && details.ItemObj[0].BottomObjID !== "") || (typeof details.ItemObj[0].TopObjID !== "undefined" && details.ItemObj[0].TopObjID !== "")) {
									var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemObj[g_item_index];
									update_top_bottom_xy(g_module_index, g_shelf_index, g_item_index, items_arr, p_pog_index);
								} else {
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y = itemy;
								}
								if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].FromProductList = "Y";
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Edited = "N";
								}
								var items = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
								var spread_gap = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].HorizGap;
								if (shelf_obj_type !== "PEGBOARD" && !(shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
									var new_x = get_item_xaxis(items.W, items.H, items.D, shelf_obj_type, -1, spread_gap, spread_product, spread_gap, g_module_index, g_shelf_index, g_item_index, shelf_obj_type == "PALLET" ? "N" : "Y", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length, "N", p_pog_index);
									g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X = new_x;
								}

								var CrushHoriz = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CrushHoriz;
								var CrushVert = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CrushHoriz;
								var CrushDepth = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].CrushD;
								var item_fixed = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Fixed;
								var itemH = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H;
								var itemD = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].D;

								item_width_arr.push(wpdSetFixed(details.ItemObj[0].W)); //.toFixed(3)));
								item_height_arr.push(wpdSetFixed(details.ItemObj[0].H)); //.toFixed(3)));
								item_depth_arr.push(wpdSetFixed(details.ItemObj[0].D)); //.toFixed(3)));
								item_index_arr.push(g_item_index);

								var l_edit_ind = "N";
								var return_val = "N";
								var spread_gap = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].HorizGap;
								var horiz_gap = spread_gap;
								var spread_product = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SpreadItem;
								var item_length = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length;
								var allow_crush = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].AllowAutoCrush;

								if (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y") {
									console.log("do nothing");
								} else if (shelf_obj_type !== "PEGBOARD") {
									return_val = await item_height_validation(itemH, g_module_index, g_shelf_index, g_item_index, "Y", -1, allow_crush, CrushVert, item_fixed, "Y", itemD, "N", p_pog_index);
								}
								var res = await set_auto_facings(g_module_index, g_shelf_index, g_item_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index], "B", "I", "D", p_pog_index); //ASA-1273 Prasanna
                                
								// ASA-2029  issue 4 - Handle combined shelf positioning for multi-item paste
								var shelfdtl_multi = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
								let l_x_val_multi = shelfdtl_multi.Combine == "N" ? -1 : shelfdtl_multi.Y + shelfdtl_multi.H/2;
								var currCombinationIndex_multi = -1, currShelfCombIndx_multi = -1;
								if ((shelfdtl_multi.ObjType == "SHELF" || shelfdtl_multi.ObjType == "HANGINGBAR") && shelfdtl_multi.Combine !== "N") {
									[currCombinationIndex_multi, currShelfCombIndx_multi] = getCombinationShelf(p_pog_index, shelfdtl_multi.Shelf);
								}
								if (currCombinationIndex_multi !== -1 && currShelfCombIndx_multi !== -1) {
									var pastedItem_multi = shelfdtl_multi.ItemInfo[g_item_index];
									if (typeof pastedItem_multi !== "undefined") {
										if (!pastedItem_multi.ObjID) {
											pastedItem_multi.ObjID = Math.floor(Math.random() * 999999);
										}
										var drag_details_arr_multi = [{
											MIndex: g_module_index,
											SIndex: g_shelf_index,
											IIndex: g_item_index,
											Iobjid: pastedItem_multi.ObjID
										}];
										await setCombinedShelfItems(p_pog_index, currCombinationIndex_multi, currShelfCombIndx_multi, l_x_val_multi, "Y", "N", -1, 0, drag_details_arr_multi,"Y"); //ASA-2029  Issue4 Case(c)
										if (drag_details_arr_multi.length > 0) {
											g_module_index = drag_details_arr_multi[0].MIndex;
											g_shelf_index = drag_details_arr_multi[0].SIndex;
											g_item_index = drag_details_arr_multi[0].IIndex;
											item_index_arr = [g_item_index];
										}
									}
								}
								// ASA-2029 End
								if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
									var i = 0;
									for (const fitems of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo) {
										if (fitems.ObjID == details.ItemObj[0].ObjID) {
											g_item_index = i;
											break; //return false;
										}
										i++;
									}
									var drag_item_arr = [];
									//try to validate the items with new x and y. if failed then set the valid variable to N. so that we can revert them back.
									if (return_val == "N" && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelf_obj_type, g_module_index, g_shelf_index, g_item_index, l_edit_ind, CrushHoriz, CrushVert, CrushDepth, -1, "N", "N", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
										//console.log('valid');
									} else {
										valid = "N";
										break;
									}
								}
							}
							z++;
						}

						if (p_pog_index != p_startCanvas && g_multi_cnvs_drag_conf == "Y" && valid != "N") {
							for (const items of item_details) {
								draggedItems.push(items.ItemID);
							}
							draggedItems = [...new Set(draggedItems)];
							confirm = await doItemMoveConf(draggedItems, g_pog_json, p_pog_index, copyItemInfo);
						} //ASA-1640 #6
						if (valid == "Y" && confirm != "N" /*ASA-1640 #6*/) {
							var i = 0;
							reset_auto_crush(g_module_index, g_shelf_index, -1, p_pog_index, g_module_index, g_shelf_index, p_pog_index); //ASA-1343 issue 1 //ASA-1685
							return_val = await recreate_all_items(g_module_index, g_shelf_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType, "Y", "", g_item_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
							logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
							g_allUndoObjectsInfo = [];
						} else {
							//if validation fails. revert the pasting.
							for (const details of item_details) {
								var item_ind = -1;
								var i = 0;
								for (const items of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo) {
									if (items.ObjID == details.ObjID) {
										item_ind = i;
										break; //return false;
									}
									i++;
								}
								if (item_ind > -1) {
									if (item_ind == 0) {
										g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.splice(item_ind, item_ind + 1);
									} else {
										g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.splice(item_ind, 1);
									}
								} else {
									for (const copyItem of copyItemInfo) {
										g_pog_json[p_pog_index].ModuleInfo[copyItem.MIndex].ShelfInfo[copyItem.SIndex].ItemInfo.splice(copyItem.IIndex, 1);
									}
								} //ASA-1640 #6
							}
						}
					}
				}
				g_multi_copy_done = "N";
				g_cut_copy_arr = [];
				g_cut_support_obj_arr = [];
				g_cut_loc_arr = [];
				loc_details = {};
				g_cut_action_done = "N";
				g_copy_action_done = "N";
				g_dup_action_done = "N";
				g_delete_action_done = "N";
				g_multi_delete_done = "N";
				g_multi_copy_done = "N";
				g_delete_details = [];
				g_multi_drag_shelf_arr = [];
				g_multi_drag_item_arr = [];
			} else {
				//after process collect all the deleted items to log for use in product list highlight.
				if (g_multi_delete_shelf_ind == "Y") {
					for (const details of g_delete_details) {
						var i = 0;
						for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
							if (modules.MObjID == details.MObjID) {
								g_module_index = i;
							}

							i++;
						}

						if (details.Object == "SHELF") {
							var l_shelf_details;
							for (const undo of g_cut_copy_arr) {
								if (details.ObjID == undo.SObjID && details.IsDivider == "N") {
									l_shelf_details = undo;
								} else if (details.ObjID == undo.ObjID && details.IsDivider == "Y") {
									l_shelf_details = undo;
								}
							}
							if (details.IsDivider == "Y") {
								for (const support of g_cut_support_obj_arr) {
									if (support.ObjType == "DIVIDER" && support.ShelfDivObjID == details.ObjID) {
										g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(support);
									}
								}
							} else {
								if (details.ObjType == "TEXTBOX") {
									for (const support of g_cut_support_obj_arr) {
										if (support.ParentModule !== null && support.ParentModule !== "" && support.ObjID == details.ObjID) {
											g_pog_json[p_pog_index].ModuleInfo.push(support);
										}
									}
								}
							}
						}
					}
					for (const details of g_delete_details) {
						if (details.Object == "SHELF" && details.IsDivider == "N") {
							$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
								if (modules.MObjID == details.MObjID) {
									g_module_index = i;
								}
							});
							g_shelf_index = details.SIndex;
							var l_shelf_details;
							for (const undo of g_cut_copy_arr) {
								if (details.ObjID == undo.SObjID) {
									l_shelf_details = undo;
								}
							}
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(l_shelf_details);
							var UndoShelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
							for (const details of g_delete_details) {
								if (details.ItemID !== "") {
									g_deletedItems.push(details.ItemID);
								}
							}
							let res = await deleted_items_log(g_deletedItems, "A", p_pog_index);

							var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(l_shelf_details, -1, -1, g_module_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1, "N", "Y", p_camera, "Y", "", "Y", p_pog_index);
							var details_xy = get_min_max_xy(p_pog_index);
							var details_arr = details_xy.split("###");
							set_camera_z(new_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
						}
					}
				} else {
					var shelf_ind = -1;
					var mod_ind = -1;
					var shelf_obj_type = "";
					var sorto = {
						ModuleIndex: "asc",
						ShefIndex: "asc",
						ItemIndex: "asc",
					};

					g_delete_details.keySort(sorto);
					var lookup = {};
					var items = g_delete_details;
					var UniqueID = [];

					for (var item, i = 0; (item = items[i++]); ) {
						if (item.Object == "ITEM") {
							var name = item.SIndex;

							if (!(name in lookup)) {
								lookup[name] = 1;
								UniqueID.push(name);
							}
						}
					}

					for (const details of g_delete_details) {
						if (details.Object == "ITEM") {
							g_deletedItems.push(details.ItemID);
							$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
								if (modules.MObjID == details.MObjID) {
									g_module_index = i;
								}
							});
							$.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo, function (i, shelfs) {
								if (shelfs.SObjID == details.SObjID) {
									g_shelf_index = i;
								}
							});
							var item_details;
							for (const undo of g_cut_copy_arr) {
								if (details.ObjID == undo.ObjID) {
									item_details = undo;
								}
							}
							g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.splice(details.IIndex, 0, item_details);

							if ((shelf_ind !== details.SIndex && shelf_ind !== -1) || (mod_ind !== details.MIndex && mod_ind !== -1)) {
								if (reorder_items(mod_ind, shelf_ind, p_pog_index)) {
									if (shelf_obj_type == "SHELF") {
										var returnval = reset_top_bottom_objects(mod_ind, shelf_ind, "N", p_pog_index);
									}
									return_val = recreate_all_items(mod_ind, shelf_ind, shelf_obj_type, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
								}
							}

							shelf_ind = details.SIndex;
							mod_ind = details.MIndex;
							shelf_obj_type = details.ObjType;
						}
					}
					var res = await deleted_items_log(g_deletedItems, "A", p_pog_index);
					if (UniqueID.length == 1) {
						if (reorder_items(mod_ind, shelf_ind, g_pog_json)) {
							if (shelf_obj_type == "SHELF" || shelf_obj_type == "PALLET") {
								var returnval = reset_top_bottom_objects(mod_ind, shelf_ind, "N", p_pog_index);
							}
							return_val = recreate_all_items(mod_ind, shelf_ind, shelf_obj_type, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
						}
					}
				}
				g_cut_copy_arr = [];
				g_cut_support_obj_arr = [];
				g_cut_loc_arr = [];
				loc_details = {};
				g_delete_details = [];
				g_multi_drag_shelf_arr = [];
				g_multi_drag_item_arr = [];
				g_cut_action_done = "N";
				g_copy_action_done = "N";
				g_dup_action_done = "N";
				g_delete_action_done = "N";
				g_multi_delete_done = "N";
				g_multi_copy_done = "N";
			}
			var res = await calculateFixelAndSupplyDays("N", p_pog_index);
            
			render(p_pog_index);
       		logDebug("function : context_paste", "E");
			return l_sucess;
		}
	} catch (err) {
		error_handling(err);
	}
}

//this function is used module for copy pasting or cut pastinga module, this function will basically recreate whole POG.
async function context_create_module(p_module_arr, p_camera, p_item_copy = "Y", p_pog_index, p_swap_ind) {
	logDebug("function : context_create_module", "S");
	try {
		//init will remove the objects in screen.
		init(p_pog_index);
		g_scene_objects[p_pog_index].scene = g_scene;
		g_scene_objects[p_pog_index].renderer = g_renderer;
		set_indicator_objects(p_pog_index);

		if (g_pog_json[p_pog_index].ModuleInfo.length > 0) {
			var edited_index = g_pog_json[p_pog_index].ModuleInfo.length - 1;
			var colorValue = parseInt(g_pog_json[p_pog_index].ModuleInfo[edited_index].Color.replace("#", "0x"), 16);
			var hex_decimal = new THREE.Color(colorValue);
			var mod_x = 0;
			var i = 0;
			var sum_width = 0;
			$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
				if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
					sum_width += modules.W;
				}
			});

			if (g_pog_json[p_pog_index].BaseH > 0) {
				var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
				var hex_decimal = new THREE.Color(colorValue);
				g_pog_json[p_pog_index].BaseW = sum_width;
				g_pog_json[p_pog_index].BaseX = sum_width / 2;
				var return_val = await add_base("BASE1", sum_width, g_pog_json[p_pog_index].BaseH, g_pog_json[p_pog_index].BaseD, hex_decimal, sum_width / 2, g_pog_json[p_pog_index].BaseY, "Y", p_pog_index);
			}
			var details = get_min_max_xy(p_pog_index);
			var details_arr = details.split("###");
			set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);

			g_pog_json[p_pog_index].W = sum_width;
			//this will run a loop and create shelfs one by one.
			for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
				if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
					if (p_swap_ind == "Y") {
						var colorValue = parseInt(modules.Color.replace("#", "0x"), 16);
						var hex_decimal = new THREE.Color(colorValue);
					}
					var old_mod_start = modules.X - modules.W / 2;
					if (i == 0) {
						mod_x = modules.W / 2;
					} else {
						mod_x = mod_x + modules.W / 2;
					}
					var new_mod_start = mod_x - modules.W / 2;
					var return_val = await create_final_module(modules.Module, modules.W, modules.H, modules.D, hex_decimal, modules.Y, "N", modules.VertStart, modules.VertSpacing, modules.HorzStart, modules.HorzSpacing, mod_x, i, g_peg_holes_active, p_pog_index);
					mod_x = mod_x + modules.W / 2;
					var j = 0;
					if (modules.ShelfInfo.length > 0) {
						for (const shelfs of modules.ShelfInfo) {
							if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
								//inside context shelfs, creation of items is called.
								var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(shelfs, old_mod_start, new_mod_start, i, j, "Y", "N", g_scene_objects[p_pog_index].scene.children[0], "Y", "", p_item_copy, p_pog_index);
							}
							j = j + 1;
						}
					}
				}
				i = i + 1;
			}
			var details = get_min_max_xy(p_pog_index);
			var details_arr = details.split("###");
			set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
		}
		render(p_pog_index);
		logDebug("function : context_create_module", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function will take specific shelf and create its shelf and items too.
async function context_create_shelfs(p_shelfs, p_old_mod_start, p_new_mod_start, p_mod_index, p_shelf_index, p_mod_edit_ind, p_same_location, p_camera, p_setItemXY, p_create_canvas, p_item_copy = "Y", p_pog_index, p_new_y = 0) {
	//ASA-1780 added p_merch for copy shelf
	logDebug("function : context_create_shelfs; old_mod_start : " + p_old_mod_start + "; new_mod_start : " + p_new_mod_start + "; mod_index : " + p_mod_index + "; p_shelf_index : " + p_shelf_index + "; mod_edit_ind : " + p_mod_edit_ind + "; same_location : " + p_same_location + "; setItemXY : " + p_setItemXY + "; create_canvas : " + p_create_canvas, "S");
	try {
		p_create_canvas = typeof p_create_canvas == "undefined" ? -1 : p_create_canvas;
		var colorValue = parseInt(p_shelfs.Color.replace("#", "0x"), 16); //YOGRAJ TEMP
		var hex_decimal = new THREE.Color(colorValue);
		var shelf_obj_type = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ObjType;
		var final_height = 0;
		var shelfx = 0;
		var shelfy = 0;
		var module_start = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].X - g_pog_json[p_pog_index].ModuleInfo[p_mod_index].W / 2);
		var module_end = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].X + g_pog_json[p_pog_index].ModuleInfo[p_mod_index].W / 2);
		var shelf_start = wpdSetFixed(p_shelfs.X - p_shelfs.W / 2);
		var shelf_end = wpdSetFixed(p_shelfs.X + p_shelfs.W / 2);
		//here if module is edited. we consider the module start has shelf start. else we use same x and y from shelfs. but we calculate based on the
		//module x which is now. because module location could have been changed.
		if (p_mod_edit_ind == "Y" && p_shelfs.SeqChange !== "Y") {
			//ASA-1487
			shelfx = p_new_mod_start + (p_shelfs.X - p_old_mod_start);
			shelfy = p_shelfs.Y;
		} else if (p_same_location == "N" && p_shelfs.SeqChange !== "Y") {
			//ASA-1487
            //ASA-1794 Added to get correct X,Y when Draaged
            var locationX = g_intersects[0].point.x;
			var locationY = g_intersects[0].point.y;
			var locationZ = g_intersects[0].point.z;
			var coords = new THREE.Vector3(locationX, locationY, locationZ);
			g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);
			var l_final_x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
			var l_final_y = Math.min(19, Math.max(-19, coords.y));
            if (p_new_y == -1) {
				shelfx = l_final_x;
			} else {
				shelfx = p_shelfs.X;
			}            
			//ASA-1780 Added if/else
			if (p_new_y == -1) {
                shelfy = l_final_y; //ASA-1794
            } else if (p_new_y !== 0) {
				shelfy = wpdSetFixed(p_new_y);
			} else {                
                //shelfy = l_final_y; //ASA-1794
				shelfy = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].H + g_pog_json[p_pog_index].BaseH + p_shelfs.H / 2;
			}
             

		} else {
			shelfx = p_shelfs.X;
			shelfy = p_shelfs.Y;
		}
		var l_item_fixed = "N"; //ASA-1487 issue 12a

		for (const items of p_shelfs.ItemInfo) {
			//ASA-1487 issue 12a
			if (items.Fixed == "Y") {
				l_item_fixed = "Y";
			}
		}

		for (const items of p_shelfs.ItemInfo) {
			if (p_shelfs.SpreadItem == "M" || l_item_fixed == "Y" || p_shelfs.ObjType == "PEGBOARD") {
				//ASA-1487  issue 8,/ASA-1487 issue 12a,//ASA-1487 issue 14
				items.MDistance = items.X - wpdSetFixed(p_shelfs.X - p_shelfs.W / 2);
				i++;
			}
		}

		g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].X = shelfx;
		g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].Y = shelfy;
		if (p_shelfs.ObjType == "PEGBOARD") {
			var return_val = add_pegboard(p_shelfs.Shelf, p_shelfs.W, p_shelfs.H, p_shelfs.D, hex_decimal, shelfx, p_shelfs.Y, 0.004, "N", p_shelfs.VertiStart, p_shelfs.VertiSpacing, p_shelfs.HorizStart, p_shelfs.HorizSpacing, p_mod_index, p_shelf_index, p_shelfs.Rotation, p_shelfs.Slope, "N", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
			var shelfID = return_val;
		} else if (p_shelfs.ObjType == "TEXTBOX") {
			if (p_shelfs.Color.charAt(1) == "#" && p_shelfs.ObjType == "TEXTBOX") {
				var bg_color = null;
			} else {
				var bg_color = colorValue;
			}
			if (g_show_live_image == "Y" && p_shelfs.TextImg !== "" && typeof p_shelfs.TextImg !== "undefined" && p_shelfs.TextImg !== null) {
				var return_val = await add_text_box_with_image(p_shelfs.Shelf, "TEXTBOX", p_shelfs.W, p_shelfs.H, p_shelfs.D, hex_decimal, shelfx, p_shelfs.Y, p_shelfs.Z, "N", p_mod_index, p_shelfs.InputText, bg_color, p_shelfs.WrapText, p_shelfs.ReduceToFit, p_shelfs.Color, p_shelf_index, p_shelfs.Rotation, p_shelfs.Slope, "N", p_shelfs.FStyle, p_shelfs.FSize, p_shelfs.FBold, $v("P25_NOTCH_HEAD"), p_pog_index);
				var shelfID = return_val;
			} else {
				var return_val = add_text_box(p_shelfs.Shelf, "TEXTBOX", p_shelfs.W, p_shelfs.H, p_shelfs.D, hex_decimal, shelfx, p_shelfs.Y, p_shelfs.Z, "N", p_mod_index, p_shelfs.InputText, bg_color, p_shelfs.WrapText, p_shelfs.ReduceToFit, p_shelfs.Color, p_shelf_index, p_shelfs.Rotation, p_shelfs.Slope, "N", p_shelfs.FStyle, p_shelfs.FSize, p_shelfs.FBold, 3, p_pog_index, g_pogcr_enhance_textbox_fontsize, p_shelfs.TextDirection); //ASA-1797.1
				var shelfID = return_val;
			}
		} else if (p_shelfs.ObjType == "ROD") {
			var return_val = add_rod(p_shelfs.Shelf, "SHELF", p_shelfs.W, p_shelfs.H, p_shelfs.D, hex_decimal, shelfx, p_shelfs.Y, 0.004, "N", p_mod_index, p_shelf_index, p_pog_index);
			var shelfID = return_val;
		} else if (p_shelfs.ObjType !== "BASE" && p_shelfs.ObjType !== "NOTCH" && p_shelfs.ObjType !== "DIVIDER" && (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null)) {
			if (p_shelfs.ObjType == "BASKET" || p_shelfs.ObjType == "CHEST") {
				//ASA-1125
				if (g_chest_as_pegboard == "Y" && p_shelfs.ObjType == "CHEST") {
					final_height = p_shelfs.D;
					p_shelfs.H = p_shelfs.D;
				} else {
					final_height = p_shelfs.BsktBaseH;
					p_shelfs.H = p_shelfs.BsktBaseH;
				}
			} else {
				final_height = p_shelfs.H;
			}

			var [return_val, newSelfIndex] = await add_shelf(p_shelfs.Shelf, "SHELF", p_shelfs.W, final_height, p_shelfs.D, hex_decimal, shelfx, p_shelfs.Y, 0.004, "N", p_mod_index, p_shelfs.Rotation, p_shelfs.Slope, p_shelf_index, "N", "N", "Y", p_create_canvas, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
			var shelfID = return_val;
		}
		g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].SObjID = return_val;
		//text box would need another ModuleInfo to be created for the chile Module case because the textbox having setup fixel label in the starting.
		//will be considered child module for parent(parent means the module inside the textbox is placed.)
		if (p_shelfs.ObjType == "TEXTBOX") {
			var child_module_index = -1;
			$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
				if (modules.ParentModule !== null) {
					if (modules.Module == p_shelfs.Shelf) {
						child_module_index = i;
					}
				}
			});
			if (child_module_index !== -1) {
				g_pog_json[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
				g_pog_json[p_pog_index].ModuleInfo[child_module_index].ShelfInfo[0].X = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].X;
			}
		}
		//if module was not edited. then only this shelf is pasted.
		if (p_mod_edit_ind == "N") {
			var item_width_arr = [],
				item_height_arr = [],
				item_depth_arr = [],
				item_index_arr = [];

			var shelf_width = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].W;
			var shelf_height = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].H;
			var shelf_depth = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].D;
			var basket_spread = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].BsktSpreadProduct;
			var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo;
			var p_shelfs = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index];
			var item_x = 0,
				item_y = 0;
			if (items_arr.length > 0) {
				var l_edited_item_index = 0,
					item_width_arr = [],
					item_index_arr = [];
				$.each(items_arr, function (i, items) {
					if (items.BottomObjID == "" || typeof items.BottomObjID == "undefined") {
						g_finalY = items.Y;
						var [itemx, itemy] = get_item_xy(p_shelfs, items, items.W, items.H, p_pog_index);
						if (p_setItemXY == "Y") {
							g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[i].X = itemx;
							g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[i].Y = itemy;
						}
					}
					item_width_arr.push(wpdSetFixed(items.W)); //.toFixed(3)));
					l_edited_item_index = i;
					item_index_arr.push(l_edited_item_index);
					g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[i].Exists = "E";
				});
				//if the current shelf is a combined shelf. then reset the combine items.
				var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].Shelf); //ASA--1329 KUSH
				if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
					//ASA--1329 KUSH
					await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, -1, "N", "N", -1, -1, []); //ASA-1329
				}
				reset_auto_crush(p_mod_index, p_shelf_index, i, p_pog_index, p_mod_index, p_shelf_index, p_pog_index); //ASA-1079 //ASA-1343 issue 1 //ASA-1685
				// await auto_crush_items(item_width_arr, item_index_arr, p_shelfs.ObjType, p_mod_index, p_shelf_index, l_edited_item_index, p_pog_index, "N", "Y"); //ASA-1079
				await crushItem(p_pog_index, p_mod_index, p_shelf_index, l_edited_item_index, "W", "Y", -1, -1);
				console.log("before recreate context");
				if (reorder_items(p_mod_index, p_shelf_index, p_pog_index)) {
					return_val = await recreate_all_items(p_mod_index, p_shelf_index, p_shelfs.ObjType, "Y", -1, -1, p_shelfs.ItemInfo.length, "N", "N", -1, -1, p_create_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
				}
				//capture the module is edit or not to create changed text box
				g_pog_json[p_pog_index].ModuleInfo[p_mod_index].EditFlag = "Y";
			}
		} else {
			if ((p_item_copy == "N" && g_pog_json[p_pog_index].ModuleInfo.length - 1 != p_mod_index) || p_item_copy == "Y") {
				if (p_shelfs.ItemInfo.length > 0) {
					var p_shelfs = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index];
					if (p_shelfs.ObjType !== "CHEST") {
						//ASA-1487 issue 11
						await reset_auto_crush(p_mod_index, p_shelf_index, -1, p_pog_index, p_mod_index, p_shelf_index, p_pog_index); //ASA-1079 //ASA-1343 issue 4 //ASA-1685
					}
					var i = 0;

					for (const items of p_shelfs.ItemInfo) {
						if (p_shelfs.SpreadItem == "M" || l_item_fixed == "Y" || p_shelfs.ObjType == "PEGBOARD") {
							//ASA-1487  issue 8,/ASA-1487 issue 12a,//ASA-1487 issue 14
							items.X = wpdSetFixed(p_shelfs.X - p_shelfs.W / 2) + items.MDistance;
							// crushItem(p_pog_index, p_mod_index, p_shelf_index, i, "A", "Y", [items.D], [i], 'Y'); //ASA-1487 issue 4
							// var new_x = get_item_xaxis(items.W, items.H, items.D, p_shelfs.ObjType, -1, p_shelfs.HorizGap, p_shelfs.SpreadItem, p_shelfs.HorizGap, p_mod_index, p_shelf_index, i, "Y", p_shelfs.ItemInfo.length, "N", p_pog_index);
							// items.X = new_x;
							i++;
						}
					}
					if (reorder_items(p_mod_index, p_shelf_index, p_pog_index)) {
						return_val = await recreate_all_items(p_mod_index, p_shelf_index, p_shelfs.ObjType, "Y", -1, -1, p_shelfs.ItemInfo.length, "N", "N", -1, -1, p_create_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
					}
					/*  var j = 0;
                    for (const items of p_shelfs.ItemInfo) {
                    if (items.BottomObjID == "" || typeof items.BottomObjID == "undefined") {
                    g_finalY = items.Y;
                    var [itemx, itemy] = get_item_xy(p_shelfs, items, items.W, items.H, p_pog_index);
                    g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[j].X = itemx;
                    g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[j].Y = itemy;

                    }
                    j++;
                    }
                    var j = 0;
                    for (const items of p_shelfs.ItemInfo) {
                    if (items.BottomObjID !== "" && typeof items.BottomObjID !== "undefined") {
                    var bottom_objid = get_shelf_item_ind(p_mod_index, p_shelf_index, items.BottomObjID, p_pog_index);
                    g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[j].X = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_objid].X;
                    g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[j].Y = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_objid].Y + g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_objid].H / 2 + items.H / 2;
                    }
                    j++;
                    }
                    var j = 0;
                    for (const items of p_shelfs.ItemInfo) {
                    var return_val = await context_create_items(items, p_mod_index, p_shelf_index, j, - (p_shelfs.W / 2), p_mod_edit_ind, p_shelfs.Y, p_camera, "Y", p_pog_index);
                    j = j + 1;
                    }*/
				}
			}
		}

		logDebug("function : context_create_shelfs", "E");
		return [return_val, shelfID, newSelfIndex];
	} catch (err) {
		error_handling(err);
	}
}

//this function is called from context_create_shelf or copy and paste item.
async function context_create_items(p_items, p_mod_index, p_shelf_index, p_item_index, p_shelf_start, p_mod_edit_ind, p_shelfY, p_camera, p_set_axis, p_pog_index) {
	logDebug("function : context_create_items; mod_index : " + p_mod_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; shelf_start : " + p_shelf_start + "; mod_edit_ind : " + p_mod_edit_ind + "; shelfY : " + p_shelfY, "S");
	try {
		var itemx = 0;
		var itemy = 0;
		var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index];
		var shelf_obj_type = shelf_dtl.ObjType;
		var basket_spread = shelf_dtl.BsktSpreadProduct;
		var shelfx = shelf_dtl.X;
		var shelf_width = shelf_dtl.W;
		var shelf_height = shelf_dtl.H;
		var shelfs = shelf_dtl;
		var item_dtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
		//item x and y is calculated based on the current locatioin of the shelf.
		if (p_set_axis == "Y") {
			var [itemx, itemy] = get_item_xy(shelfs, p_items, p_items.W, p_items.H, p_pog_index);
			if (p_items.BottomObjID == "" || typeof p_items.BottomObjID == "undefined") {
				item_dtl.X = itemx;
				item_dtl.Y = itemy;
			} else {
				var bottom_objid = get_shelf_item_ind(p_mod_index, p_shelf_index, p_items.BottomObjID, p_pog_index);
				item_dtl.X = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_objid].X;
				item_dtl.Y = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_objid].Y + g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_objid].H / 2 + p_items.H / 2;
				itemx = item_dtl.X;
				itemy = item_dtl.Y;
			}
		} else {
			itemx = p_items.X;
			itemy = p_items.Y;
		}
		if (g_show_live_image == "Y") {
			var details = g_orientation_json[p_items.Orientation];
			var details_arr = details.split("###");
			var objID = await add_items_with_image(p_items.ItemID, p_items.W, p_items.H, p_items.D, p_items.Color, itemx, itemy, p_items.Z, p_mod_index, p_shelf_index, p_item_index, p_items.BHoriz, p_items.BVert, p_items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", "N", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
		} else {
			if (p_items.Item == "DIVIDER") {
				var objID = add_items(p_items.ItemID, p_items.W, p_items.H, p_items.D, p_items.Color, itemx, itemy, p_items.Z, p_mod_index, p_shelf_index, p_item_index, p_items.Rotation, p_pog_index);
			} else {
				var objID = await add_items_prom(p_items.ItemID, p_items.W, p_items.H, p_items.D, p_items.Color, itemx, itemy, p_items.Z, p_mod_index, p_shelf_index, p_item_index, "N", "N", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
			}
		}
		for (const iteminfo of g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ItemInfo) {
			if (iteminfo.BottomObjID == p_items.ObjID) {
				iteminfo.BottomObjID = objID;
			}
			if (iteminfo.TopObjID == p_items.ObjID) {
				iteminfo.TopObjID = objID;
			}
		}

		item_dtl.ObjID = objID;
		var itemDimUPd = item_dtl.DimUpdate;
		var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(objID);

		//capture the module is edit or not to create changed text box
		g_pog_json[p_pog_index].ModuleInfo[p_mod_index].EditFlag = "Y";
		logDebug("function : context_create_items", "E");
	} catch (err) {
		error_handling(err);
	}
}

// this function is called when right click edit. it will check which object and open its popup.
function context_edit(p_edit = "N") {
	logDebug("function : context_edit", "S");
	try {
		if (g_carpark_item_flag == "Y") {
			g_object_hit_ind = "I";
		} else if (g_module_edit_flag == "Y") {
			g_object_hit_ind = "M";
		} else if (g_shelf_edit_flag == "Y") {
			g_object_hit_ind = "S";
		} else if (g_item_edit_flag == "Y") {
			g_object_hit_ind = "I";
			g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Exists = "E";
		} else {
			g_object_hit_ind = "B";
		}
		g_dblclick_objid = g_objectHit_id;
		g_dblclick_opened = "Y";
		open_edit_modal_popup(g_object_hit_ind, g_module_index, g_shelf_index, "N", g_pog_index, p_edit);
		logDebug("function : context_edit", "E");
	} catch (err) {
		error_handling(err);
	}
}

//duplicate is enabled for shelf when right click context menu.
function context_duplicate() {
	logDebug("function : context_duplicate", "S");
	try {
		if (g_shelf_edit_flag == "Y") {
			g_object_hit_ind = "S";
			if (g_shelf_object_type == "SHELF") {
				$("#DELETE_SHELF").css("display", "none");
			} else {
				$("#DELETE_TEXT").css("display", "none");
			}
		} else if (g_item_edit_flag == "Y" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item == "DIVIDER") {
			g_object_hit_ind = "I";
			$("#DELETE_DIVIDER").css("display", "none");
			g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Exists = "E";
		}

		g_dblclick_objid = g_objectHit_id;
		$s("P25_MODULE_DISP", g_module_index);
		g_duplicate_fixel_flag = "Y";

		open_edit_modal_popup(g_object_hit_ind, g_module_index, g_shelf_index, "Y", g_pog_index);
		logDebug("function : context_duplicate", "E");
	} catch (err) {
		error_handling(err);
	}
}

async function context_func(p_action, p_subAction) {
	//ASA-1780 Added p_subAction
	logDebug("function : context_func; action : " + p_action, "S");
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		if (p_action != "copy_pogc_image" && p_action != "zoom_selected_pogc" && g_module_edit_flag == "N" && g_shelf_edit_flag == "N" && g_item_edit_flag == "N" && p_action !== "edit" && g_multiselect !== "Y" && p_action !== "muledit") {
			//ASA-1538
			alert(get_message("NO_OBJECT_ERROR"));
		} else {
			//identify if any change in POG
			g_pog_edited_ind = "Y";

			if (p_action == "duplicate") {
				context_duplicate();
			} else if (p_action == "delete") {
				context_delete("DELETE", g_module_index, g_shelf_index, g_item_index, g_item_edit_flag, g_module_edit_flag, g_shelf_edit_flag, g_objectHit_id, "", g_delete_details, g_camera, g_pog_index, "N");
			} else if (p_action == "edit") {
				context_edit("N");
			} else if (p_action == "muledit") {
				context_edit("M");
			} else if (p_action == "cut") {
				context_cut(g_pog_index);
			} else if (p_action == "copy" && g_multiselect == "N") {
				context_copy("S", g_pog_index);
			} else if (p_action == "copy" && g_multiselect == "Y") {
				context_copy("M", g_pog_index);
			} else if (p_action == "paste" && (g_cut_action_done == "Y" || g_copy_action_done == "Y" || g_multi_copy_done == "Y")) {
				var cut_copy_action = "";
				if (g_cut_action_done == "Y") {
					cut_copy_action = "CUT";
				} else {
					cut_copy_action = "COPY";
				}
				await context_paste(cut_copy_action, g_camera, "N", "Y", g_pog_index);
				if (p_subAction == "RESET_PASTE") {
					//ASA-1780
					g_copy_action_done = "N";
				}
			} else if (p_action == "copy_pogc_image") {
				//ASA-1538
				downloadPOGImage();
			} else if (p_action == "zoom_selected_pogc") {
				//ASA-1538
				if (g_module_index == -1) {
					reset_zoom();
				} else {
					select_zoom_init();
				}
			}
		}
	}
	g_taskItemInContext = "";
	g_context_opened = "N";
	logDebug("function : context_func", "E");
}

function open_edit_location_init(p_type) {
	logDebug("function : open_edit_location_init", "S");
	open_edit_location(g_pog_index, p_type);
	logDebug("function : open_edit_location_init", "E");
}

//ASA-1300
//this function is called before opening edit location popup
function open_edit_location(p_pog_index, p_type) {
	logDebug("function : open_edit_location", "S");
	g_dblclick_opened = "Y";
	$s("P25_TYPE", p_type);
	//we open edit location for both item and fixel. for item we show only X and Y fields.
	//Please Note: for edit location we always show the start point of the item or shelf (left corner - X and bottom - Y)
	if (p_type == "I") {
		$("#P25_FIXEL_NOTCH_CONTAINER").css("display", "none");
		$("#P25_Z_LOCATION_CONTAINER").css("display", "none");
		$s("P25_X_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].W * 100) / 2).toFixed(2));
		$s("P25_Y_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H * 100) / 2).toFixed(2));
	} else {
		$("#P25_FIXEL_NOTCH").css("display", "block");
		$("#P25_Z_LOCATION").css("display", "block");
		var shelf_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2;

		//Start ASA-1318 Task-2 to update the value of Notch Position even if the Xcordinate is '-ve'.
		//user can give notch position and we calculate the Y position to be placed.
		$s("P25_FIXEL_NOTCH", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].NotchNo); //ASA-1290 KUSH
		if (shelf_start >= 0 && g_pog_json[p_pog_index].ModuleInfo[g_module_index].NotchW > 0) {
			$("#P25_FIXEL_NOTCH").removeClass("apex_disabled");
		} else {
			$("#P25_FIXEL_NOTCH").addClass("apex_disabled");
		}
		//End ASA-1318 Task-2

		if (g_item_index === "" || g_item_index === -1 || typeof g_item_index === "undefined") {
			$s("P25_X_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W * 100) / 2).toFixed(2));
			/*if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].EditNotch == "Y") {
            $s("P25_Y_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].EditNotchY * 100).toFixed(2));
            } else { ASA-1296 to be calculated everytime*/
			var newY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H * 100) / 2; //ASA-1290 show now take bottom of shelf.
			$s("P25_Y_LOCATION", newY.toFixed(2)); //toFixed(newY, 2));
			//}
			if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType !== "TEXTBOX") {
				$s("P25_Z_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].D * 100) / 2).toFixed(2)); 
                //$s("P25_Z_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z * 100).toFixed(2)); // ASA-1945.1
			} else {
				$s("P25_Z_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z * 100).toFixed(2));
                g_edit_textboxZ = ((g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z * 100).toFixed(2))/100; //ASA-2029.1.4
			}
			apex.item("P25_X_LOCATION").setFocus();
		} else {
			$s("P25_X_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].W * 100) / 2).toFixed(2));
			var newY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y * 100 - (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H * 100) / 2; //ASA-1290 show now take bottom of shelf.
			$s("P25_Y_LOCATION", newY.toFixed(2)); //toFixed(newY, 2));
			$s("P25_Z_LOCATION", (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Z * 100).toFixed(2)); //ASA-1623 Issue 3
            g_edit_textboxZ = ((g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z * 100).toFixed(2))/100; //ASA-2029.1.4
			apex.item("P25_X_LOCATION").setFocus();
		}
	}
	openInlineDialog("edit_location_modal", 40, 40);
	$s("P25_LOCATION_CNG", "N");
	logDebug("function : open_edit_location", "E");
} //ASA-1300 end

//this function is called after user do changes in edit location and click save.
async function update_edit_location(p_newX, p_newY, p_newZ, p_module_index, p_shelf_index, p_fixel_notch, p_edit_flag, p_camera, p_pog_index, p_manual_z_update = "Y") {
	logDebug("function : update_edit_location; newX : " + p_newX + "; newY : " + p_newY + "; newZ : " + p_newZ + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; fixel_notch : " + p_fixel_notch + "; edit_flag : " + p_edit_flag, "S");
	try {
		//identify if any change in POG
		g_pog_edited_ind = "Y";
		var shelfZ; // ASA-1573 Issue 2,3
		var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);
		var allow_crush = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].AllowAutoCrush;
		var g_shelf_object_type = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType;
		var curr_module = -1;
		var overlap_mod = -1;
		var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
		undoObjectsInfo = [];
		undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index])));
		var objectID = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
		var itemsDel = [];
		undoObjectsInfo.moduleIndex = p_module_index;
		undoObjectsInfo.shelfIndex = p_shelf_index;
		undoObjectsInfo.actionType = "SHELF_DRAG";
		undoObjectsInfo.startCanvas = g_start_canvas;
		undoObjectsInfo.objectID = objectID;
		undoObjectsInfo.Z = selectedObject.position.z;
		undoObjectsInfo.g_deletedItems = itemsDel;

        //ASA-2029 issue 1 Start
		var old_textbox_z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Z);
        var new_textbox_z = wpdSetFixed(p_newZ);
        var update_textbox = old_textbox_z !== new_textbox_z ? "N" : "Y";
		//var update_textbox = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Z !== p_newZ ? "N" : "Y";
        //ASA-2029 issue 1 End

		g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].EditNotch = "N";
		var shelf_start = p_newX - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
		var shelf_end = p_newX + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
		//based on the new x and y input by user we find out the module this shelf will be placed.
		$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
			if (modules.ParentModule == null || modules.ParentModule == "undefined") {
				if (p_newX > modules.X - modules.W / 2 && p_newX < modules.X + modules.W / 2) {
					curr_module = i;
					return false;
				}
			}
		});

		if (curr_module == -1) {
			$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
				if (modules.ParentModule == null || modules.ParentModule == "undefined") {
					if ((modules.X + modules.W / 2 > shelf_start && modules.X - modules.W / 2 <= shelf_start) || (modules.X - modules.W / 2 <= shelf_end && modules.X - modules.W / 2 >= shelf_start)) {
						curr_module = i;
						return false;
					}
				}
			});
			if (curr_module == -1) {
				$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
					if (modules.ParentModule == null || modules.ParentModule == "undefined") {
						curr_module = i;
						return false;
					}
				});
			}
		}
		//if user input notch No. we calculate the Y position based on the notch start and spacing and calculate how far it should be set in a module.
		if (p_fixel_notch > 0) {
			if (curr_module == -1) {
				curr_module = p_module_index;
			}

			p_newX = g_pog_json[p_pog_index].ModuleInfo[curr_module].X - g_pog_json[p_pog_index].ModuleInfo[curr_module].W / 2 + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
			p_newY = g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[curr_module].NotchStart + g_pog_json[p_pog_index].ModuleInfo[curr_module].NotchSpacing * (p_fixel_notch - 1) - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2;

			if (wpdSetFixed(p_newY + g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[p_shelf_index].H / 2) <= wpdSetFixed(g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[curr_module].NotchStart / 2)) {
				p_newY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[p_shelf_index].H / 2);
			}
			p_newZ = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[p_shelf_index].Z;
			g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[p_shelf_index].EditNotch = "Y";
			g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[p_shelf_index].EditNotchY = wpdSetFixed(p_newY - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 - g_pog_json[p_pog_index].BaseH - g_pog_json[p_pog_index].ModuleInfo[curr_module].NotchSpacing / 2);
		}
		undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[curr_module].Module;
		undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[curr_module].MObjID;
		g_allUndoObjectsInfo.push(undoObjectsInfo);
		logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
		g_allUndoObjectsInfo = [];

		var itemArr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
		var res = await set_auto_facings(p_module_index, p_shelf_index, -1, items_arr, "B", "S", "D", p_pog_index);
		if (g_shelf_object_type !== "TEXTBOX") {
			var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
			var validate_passed = validate_shelf_min_distance(curr_module, p_shelf_index, p_newY, items_arr, allow_crush, p_module_index, p_newX, "Y", shelfs, p_pog_index);
		} else {
			var validate_passed = "Y";
		}

		//if validation is passed we set the shelf to which ever module it belong and set all the items with new position.
		if (validate_passed == "Y" || validate_passed == "R") {
			var old_shelfx = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X;
			var old_shelfy = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y;
			var old_shelfz = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Z;

			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X = wpdSetFixed(p_newX);
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y = wpdSetFixed(p_newY);
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Z = wpdSetFixed(p_newZ);

			if (g_shelf_object_type == "TEXTBOX") {
				if (update_textbox == "N") {
					if (p_newZ > 0.0021) {
						shelfZ = 0.0021;
					} else if (p_newZ == 0) {
						shelfZ = 0.0006;
					} else {
						shelfZ = p_newZ;
					}
                    if (p_manual_z_update != "N") {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ManualZupdate = "Y"; 
                    }					
					shelfZ = textboxPriorityPlacing(selectedObject, p_pog_index, p_newZ); //ASA-1652
				} else {
					shelfZ = selectedObject.position.z; //0.0021;   //ASA-1652
					// g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ManualZupdate = "N"; //ASA-1652
				}
			} else if (g_shelf_object_type == "PEGBOARD") {
				shelfZ = 0.003;
			} else if (g_shelf_object_type == "DIVIDER") {
				shelfZ = 0.001;
			} else {
				//shelfZ = 0.0005; // ASA-1573 Issue 2,3
				shelfZ = nvl(shelfZ) == 0 ? 0.005 : shelfZ; // ASA-1573 Issue 2,3
			}
			var notch_space = g_pog_json[p_pog_index].ModuleInfo[curr_module].NotchSpacing > 0 ? g_pog_json[p_pog_index].ModuleInfo[curr_module].NotchSpacing / 2 : 0;

			selectedObject.position.set(p_newX, p_newY, shelfZ);
			g_scene.updateMatrixWorld();
			await set_all_items(p_module_index, p_shelf_index, p_newX, p_newY, "Y", "N", "Y", p_pog_index, p_pog_index);

			var rotation = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation;
			if (g_manual_zoom_ind == "N") {
				var details = get_min_max_xy(p_pog_index);
				var details_arr = details.split("###");
				set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
			}

			if (rotation !== 0) {
				selectedObject.quaternion.copy(p_camera.quaternion);
				selectedObject.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
				selectedObject.rotateY((rotation * Math.PI) / 180);
				if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "TEXTBOX") {
					if (rotation == 0) {
						selectedObject.rotateX(((slope / 2) * Math.PI) / 180);
					} else {
						selectedObject.rotateX((slope * Math.PI) / 180);
					}
				} else {
					selectedObject.rotateX((g_slope * Math.PI) / 180);
				}
				selectedObject.updateMatrix();
			}

			var [mod_ind, shelf_ind] = await set_shelf_after_drag(validate_passed, "Y", p_module_index, curr_module, p_shelf_index, p_newX, p_newY, "Y", update_textbox, "", "", p_pog_index, p_pog_index);
            if (g_shelf_object_type !== "TEXTBOX"){ //ASA-2041 Issue 2
			    var [newy, newx] = find_top_notch(p_module_index, p_shelf_index, p_newY, p_newX, g_drag_shelf_notch, p_pog_index); //ASA-1318 Task-2 It is added to update the notch no in the edit location screen if X, Y are updating.
            }
			g_undo_details = [];
			g_undo_obj_arr = [];
			g_undo_supp_obj_arr = [];

			g_shelf_object_type !== "PALLET" && await generateCombinedShelfs(p_pog_index, mod_ind, shelf_ind, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters //ASA-1892 Issue10

			if (g_show_max_merch == "Y" && p_edit_flag == "Y") {
				async function doSomething() {
					let result = await add_merch("N", p_pog_index);
					let result1 = await add_merch("Y", p_pog_index);
				}
				doSomething();
			}
			if (g_show_notch_label == "Y") {
				var returnval = update_single_notch_label("Y", mod_ind, shelf_ind, $v("P25_NOTCH_HEAD"), "", p_pog_index, "N"); //ASA-1292
			}
			if (g_fixel_label == "Y") {
				//ASA-1290 calling only when we are printing notch no and pos_x.
				update_single_fixel_label(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind], p_pog_index, mod_ind, shelf_ind);
			}
			//recreate the orientation view if any present
			async function recreate_view() {
				var returnval = await recreate_compare_views(g_compare_view, "N");
			}
			recreate_view();

			if (items_arr.length > 0) {
				//capture the module is edit or not to create changed text box
				g_pog_json[p_pog_index].ModuleInfo[mod_ind].EditFlag = "Y";
			}
		} else {
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].EditNotch = "N";
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].EditNotchY = "";
			var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
			let result = await set_all_items(p_module_index, p_shelf_index, shelfs.X, shelfs.Y, "Y", "E", "Y", p_pog_index, p_pog_index);
		}
		render(p_pog_index);
		if (g_show_live_image == "Y") {
			animate_all_pog();
		}
		g_context_opened = "N";
		if (p_edit_flag == "Y") {
			closeInlineDialog("edit_location_modal");
		}
		g_dblclick_opened = "N";
		logDebug("function : update_edit_location", "E");
		return "SUCESS";
	} catch (err) {
		error_handling(err);
	}
}

//this function is called from clear item and clear POG attr. which will empty all the items in a POG.
function delete_items(p_delete_obj, p_pog_index) {
	logDebug("function : delete_items; delete_obj : " + p_delete_obj, "S");
	//console.log('delete_items called');
	return new Promise(function (resolve, reject) {
		var module_details = g_pog_json[p_pog_index].ModuleInfo;
		if (p_delete_obj == "N") {
			g_pog_json[p_pog_index].POGCode = "";
			g_pog_json[p_pog_index].Name = "";
		}
		$.each(module_details, function (i, modules_info) {
			if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
				$.each(modules_info.ShelfInfo, function (j, shelf_info) {
					var div_obj = {};
					var add_div_item = "N";
					if (p_delete_obj == "Y") {
						$.each(shelf_info.ItemInfo, function (k, item_info) {
							if (item_info.Item !== "DIVIDER") {
								g_deletedItems.push(item_info.ItemID);
								var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
								g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
								if (typeof g_pog_json[p_pog_index].DeleteItems !== "undefined") {
									g_pog_json[p_pog_index].DeleteItems.push(item_info); ///ASA-1108
								}
							} else {
								div_obj = item_info;
								add_div_item = "Y";
							}
						});
					} else {
						$.each(shelf_info.ItemInfo, function (k, item_info) {
							if (item_info.Item == "DIVIDER") {
								div_obj = item_info;
								add_div_item = "Y";
							}
						});
					}
					g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo = [];
					if (add_div_item == "Y") {
						g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.push(div_obj);
					}
				});
			}
		});
		let dellog = deleted_items_log(g_deletedItems, "D", p_pog_index);
		resolve("SUCCESS");
		logDebug("function : delete_items", "E");
	});
}

// this function is called from clear POG attr.it will remove pog code, name and all items. this is used to create a template.
async function clear_pog_info() {
	logDebug("function : clear_pog_info", "S");
	//identify if any change in POG
	g_pog_edited_ind = "Y";

	$(".top_icon").removeClass("active");
	$(".left_icon").removeClass("active");
	$(".clear_pog_info").addClass("active");
	g_prev_undo_action = "CLEAR_POG_INFO";
	if (g_all_pog_flag == "Y") {
		var i = 0;
	} else {
		var i = g_pog_index;
	}
	for (pogInfo of g_pog_json) {
		if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
			var returnval = await clear_item("Y", "Y", i);

			clear_pog_att("Y", "Y", i);
		}
		if (g_all_pog_flag == "Y") {
			i++;
		} else {
			break;
		}
	}
	apex.message.showPageSuccess(g_pog_refresh_msg);
	logDebug("function : clear_pog_info", "E");
}

async function clear_item_init(p_info_called) {
	logDebug("function : clear_item_init; info_called : " + p_info_called, "S");
	if (g_all_pog_flag == "Y") {
		var i = 0;
	} else {
		var i = g_pog_index;
	}
	for (pogInfo of g_pog_json) {
		if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
			var returnval = await clear_item(p_info_called, "N", i);
		}
		if (g_all_pog_flag == "Y") {
			i++;
		} else {
			break;
		}
	}
	logDebug("function : clear_item_init", "E");
}

async function clear_item(p_info_called, p_clearInfoType, p_pog_index) {
	logDebug("function : clear_item; info_called : " + p_info_called + "; p_clearInfoType : " + p_clearInfoType, "S");
	try {
		//identify if any change in POG
		g_pog_edited_ind = "Y";

		if (p_info_called == "N") {
			$(".top_icon").removeClass("active");
			$(".left_icon").removeClass("active");
			$(".clear_item").addClass("active");
		}
		var prev_action = p_info_called == "N" ? "CLEAR_ITEM" : "CLEAR_POG_INFO";
		var module_details = g_pog_json[p_pog_index].ModuleInfo;
		g_undo_obj_arr = [];
		g_undo_details = [];
		g_undo_supp_obj_arr = [];
		var undoObjectsInfo = [];
		var g_deletedItems = [];
		if (prev_action == "CLEAR_POG_INFO") {
			var pogInfo = {};
			pogInfo["OldPOGCode"] = g_pog_json[p_pog_index].POGCode;
			pogInfo["OldPOGName"] = g_pog_json[p_pog_index].Name;
			pogInfo["OldPOGDivision"] = g_pog_json[p_pog_index].Division;
			pogInfo["OldPOGDept"] = g_pog_json[p_pog_index].Dept;
			pogInfo["OldPOGSubDept"] = g_pog_json[p_pog_index].SubDept;
			pogInfo["OldEffStartDate"] = g_pog_json[p_pog_index].EffStartDate;
		}
		$.each(module_details, function (i, modules_info) {
			if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
				//capture the module is edit or not to create changed text box
				g_pog_json[p_pog_index].ModuleInfo[i].EditFlag = "Y";

				$.each(modules_info.ShelfInfo, function (j, shelf_info) {
					if (shelf_info.ItemInfo.length > 0) {
						$.each(shelf_info.ItemInfo, function (s, itemInfo) {
							g_deletedItems.push(itemInfo.ItemID);
						});
						var objectID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].SObjID;
						undoObjectsInfo.moduleIndex = i;
						undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[i].Module;
						undoObjectsInfo.shelfIndex = j;
						undoObjectsInfo.pogInfo = pogInfo;
						undoObjectsInfo.actionType = "ITEM_DELETE";
						undoObjectsInfo.startCanvas = g_start_canvas;
						undoObjectsInfo.objectID = objectID;
						undoObjectsInfo.g_deletedItems = g_deletedItems;
						undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[i].MObjID;
						undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j])));
						g_allUndoObjectsInfo.push(undoObjectsInfo);
						undoObjectsInfo = [];
					}
				});
			}
		});

		await delete_items("Y", p_pog_index);
		logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
		g_allUndoObjectsInfo = [];
		showFixelAvailableSpace("N", "N", p_pog_index);
		render(p_pog_index);
		//recreate the orientation view if any present
		await recreate_compare_views(g_compare_view, "N");

		apex.message.showPageSuccess(g_pog_refresh_msg);
		logDebug("function : clear_item", "E");
		return "SUCCESS";
	} catch (err) {
		error_handling(err);
	}
}

function clear_pog_att_init(p_info_called) {
	logDebug("function : clear_pog_att_init; info_called : " + p_info_called, "S");
	if (g_all_pog_flag == "Y") {
		var i = 0;
	} else {
		var i = g_pog_index;
	}
	for (pogInfo of g_pog_json) {
		if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
			clear_pog_att(p_info_called, "Y", i);
		}
		if (g_all_pog_flag == "Y") {
			i++;
		} else {
			break;
		}
	}
	logDebug("function : clear_pog_att_init", "E");
}

function clear_pog_att(p_info_called, p_clearInfoType, p_pog_index) {
	logDebug("function : clear_pog_att; info_called : " + p_info_called + "; p_clearInfoType : " + p_clearInfoType, "S");
	var details = {};
	var is_divider = "N";
	try {
		//identify if any change in POG
		g_pog_edited_ind = "Y";

		if (p_info_called == "N") {
			$(".top_icon").removeClass("active");
			$(".left_icon").removeClass("active");
			$(".clear_pog_att").addClass("active");
			g_prev_undo_action = "CLEAR_POG_ATT";
		}

		$s("P25_POG_DIVISION", "");
		try {
			var module_details = g_pog_json[p_pog_index].ModuleInfo;
			$.each(module_details, function (i, modules_info) {
				if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
					g_pog_json[p_pog_index].ModuleInfo[i].OldPOGModuleSubDept = g_pog_json[p_pog_index].ModuleInfo[i].SubDept;
					g_pog_json[p_pog_index].ModuleInfo[i].SubDept = "";
				}
			});
		} catch (err) {
			error_handling(err);
		}

		details["OldPOGCode"] = g_pog_json[p_pog_index].POGCode;
		details["OldPOGName"] = g_pog_json[p_pog_index].Name;
		details["OldPOGDivision"] = g_pog_json[p_pog_index].Division;
		details["OldPOGDept"] = g_pog_json[p_pog_index].Dept;
		details["OldPOGSubDept"] = g_pog_json[p_pog_index].SubDept;
		details["OldEffStartDate"] = g_pog_json[p_pog_index].EffStartDate;

		g_pog_json[p_pog_index].POGCode = "";
		g_pog_json[p_pog_index].Name = "";
		g_pog_json[p_pog_index].Division = "";
		g_pog_json[p_pog_index].Dept = "";
		g_pog_json[p_pog_index].SubDept = "";
		g_pog_json[p_pog_index].EffStartDate = "";
		if (g_prev_undo_action == "CLEAR_POG_ATT") {
			g_undo_details.push(details);
			g_delete_details.multi_delete_shelf_ind = "N";
			g_undo_all_obj_arr = [];
			g_undo_all_obj_arr.push(g_undo_details);
			g_undo_all_obj_arr.push(g_cut_copy_arr);
			g_undo_all_obj_arr.previousAction = g_prev_undo_action;
			g_undo_all_obj_arr.clearInfoType = p_clearInfoType;
			if (g_cut_support_obj_arr.length > 0) {
				//yrc
				g_redo_all_obj_arr.hasSupportArr = "Y";
			} else {
				g_redo_all_obj_arr.hasSupportArr = "N";
			}
			g_undo_all_obj_arr.g_MultiObjects = "N";
			g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
			g_undo_final_obj_arr.push(g_undo_all_obj_arr);
			g_delete_details = [];
			g_multi_drag_shelf_arr = [];
			g_multi_drag_item_arr = [];
			g_cut_copy_arr = [];
			g_undo_details = [];
		}
		apex.message.showPageSuccess(g_pog_refresh_msg);
		logDebug("function : clear_pog_att", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function is called before saving draft, pog, template. check basic details available.
function validate_pog_detail(p_template_check, p_pog_index) {
	logDebug("function : validate_pog_detail; template_check : " + p_template_check, "S");
	var mod_valiate = "N";
	var module_details = g_pog_json[p_pog_index].ModuleInfo;
	$.each(module_details, function (i, modules_info) {
		if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
			if (modules_info.SubDept == "") {
				mod_valiate = "Y";
				return false;
			}
		}
	});
	logDebug("function : validate_pog_detail", "E");
	if (g_pog_json[p_pog_index].POGCode == "" && p_template_check == "N") {
		return "Y";
	} else if (mod_valiate == "Y" || g_pog_json[p_pog_index].Division == "" || g_pog_json[p_pog_index].Dept == "" || g_pog_json[p_pog_index].SubDept == "") {
		return "Y";
	} else {
		return "N";
	}
}

//this function is used inside update_textbox_change to check any change in module.
async function check_module_change(p_module_index, p_pog_code, p_pog_version, p_pog_index) {
	logDebug("function : check_module_change; p_module_index : " + p_module_index + "; pog_code : " + p_pog_code + "; pog_version : " + p_pog_version, "S");
	return new Promise(function (resolve, reject) {
		var POG_json = JSON.stringify(g_pog_json[p_pog_index]);
		apex.server.process(
			"CHECK_MODULE_CHANGE",
			{
				x01: p_pog_code,
				x02: p_pog_version,
				p_clob_01: POG_json,
			},
			{
				dataType: "text",
				success: function (pData) {
					if ($.trim(pData) != "") {
						logDebug("function : create_change_textbox", "E");
						resolve($.trim(pData));
					}
				},
			}
		);
	});
}

//this will create a shelfinfo and moduleinfo for change textbox.
async function create_change_textbox(p_module_change, p_module_name, p_shelfy, p_module_index, p_pog_index) {
	logDebug("function : create_change_textbox; module_change : " + p_module_change + "; module_name : " + p_module_name + "; shelfy : " + p_shelfy + "; p_module_index : " + p_module_index, "S");
	var ShelfInfo = {};   
    if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {  //ASA-2071 	
        ShelfInfo["Shelf"] = $v("P25_POGCR_MODULE_CHANGE_ID") + p_module_name.toUpperCase();
    } else {
        ShelfInfo["Shelf"] = $v("P25_POGCR_MODULE_CHANGE_ID") + p_module_name;
    }
	ShelfInfo["ObjType"] = "TEXTBOX";
	ShelfInfo["Desc"] = "";
	ShelfInfo["MaxMerch"] = 0;
	ShelfInfo["GrillH"] = 0;
	ShelfInfo["LOverhang"] = 0;
	ShelfInfo["ROverhang"] = 0;
	ShelfInfo["SpacerThick"] = 0;
	ShelfInfo["HorizGap"] = 0;
	ShelfInfo["SpreadItem"] = "L";
	ShelfInfo["Combine"] = "N";
	ShelfInfo["AllowAutoCrush"] = "N";
	ShelfInfo["H"] = 0.1;
	ShelfInfo["W"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].W;
	ShelfInfo["D"] = 0.01;
	ShelfInfo["Rotation"] = 0;
	ShelfInfo["Slope"] = 0;
	ShelfInfo["Color"] = "#FFFFFF";
	ShelfInfo["LiveImage"] = "";
	ShelfInfo["HorizSlotStart"] = 0;
	ShelfInfo["HorizSlotSpacing"] = 0;
	ShelfInfo["HorizStart"] = 0;
	ShelfInfo["HorizSpacing"] = 0;
	ShelfInfo["UOverHang"] = 0;
	ShelfInfo["LoOverHang"] = 0;
	ShelfInfo["VertiStart"] = 0;
	ShelfInfo["VertiSpacing"] = 0;
	ShelfInfo["X"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].X;
	ShelfInfo["Y"] = p_shelfy;
	ShelfInfo["Z"] = g_pog_json[p_pog_index].BackDepth / 2 + 0.005 + g_pog_json[p_pog_index].BaseD;
	ShelfInfo["InputText"] = p_module_change == "Y" ? get_message("POGCR_MOD_CHANGE_Y") : get_message("POGCR_MOD_CHANGE_N");
	ShelfInfo["WrapText"] = "Y";
	ShelfInfo["ReduceToFit"] = "Y";
    ShelfInfo["TextDirection"] = "H";
	ShelfInfo["BsktFill"] = "";
	ShelfInfo["BsktSpreadProduct"] = "";
	ShelfInfo["SnapTo"] = "";
	ShelfInfo["BsktWallH"] = 0;
	ShelfInfo["BsktBaseH"] = 0;
	ShelfInfo["BsktWallThickness"] = 0;
	ShelfInfo["DSlotStart"] = 0;
	ShelfInfo["DSlotSpacing"] = 0;
	ShelfInfo["DGap"] = 0;
	ShelfInfo["FrontOverHang"] = 0;
	ShelfInfo["BackOverHang"] = 0;
	ShelfInfo["SlotDivider"] = "";
	ShelfInfo["AllowOverLap"] = "N";
	ShelfInfo["AutoPlacing"] = "N";
	ShelfInfo["SlotOrientation"] = "";
	ShelfInfo["DividerFixed"] = "N";
	ShelfInfo["LObjID"] = -1;
	ShelfInfo["NotchLabelObjID"] = -1;
	ShelfInfo["FStyle"] = "Arial";
	ShelfInfo["FSize"] = $v("P25_POGCR_TEXT_DEFAULT_SIZE");
	ShelfInfo["FBold"] = "";
	ShelfInfo["TextImg"] = "";
	ShelfInfo["TextImgName"] = "";
	ShelfInfo["TextImgMime"] = "";
	ShelfInfo["ItemInfo"] = [];
	g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.push(ShelfInfo);
	logDebug("function : create_change_textbox", "E");
	return "SUCCESS";
}

//this function is used to create a CHANGE text box below each module with YES or No based on any changes in module or not when save POG.
async function update_textbox_change(p_new_pogjson, p_pog_index) {
	logDebug("function : update_textbox_change", "S");
	if (p_new_pogjson[p_pog_index].Version !== "" && typeof p_new_pogjson[p_pog_index].Version !== "undefined" && p_new_pogjson[p_pog_index].Version !== null && $v("P25_POGCR_MODULE_CHANGE_NEED") == "Y") {
		var details = get_min_max_xy(p_pog_index);
		var details_arr = details.split("###");
		var module_details = p_new_pogjson[p_pog_index].ModuleInfo;
		var i = 0;
		var mod_list = [];
		var change_list = await check_module_change(i, p_new_pogjson[p_pog_index].POGCode, p_new_pogjson[p_pog_index].Version, p_pog_index);
		console.log("change_list", change_list);
		try {
			mod_list = JSON.parse(change_list);
		} catch {
			console.log("errored", change_list);
		}
		var returnval;
		for (const modules of module_details) {
			if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
				for (const details of mod_list) {
					if (details.Module == modules.Module) {
						returnval = details.Value;
						break;
					}
				}

				var l_shelf_details = modules.ShelfInfo;
				var j = 0;
				var textbox_found = "N";
				console.log("returnval", returnval);
				for (const shelfs of l_shelf_details) {
					if (shelfs.ObjType == "TEXTBOX") {
						if (shelfs.Shelf.startsWith($v("P25_POGCR_MODULE_CHANGE_ID"))) {
							textbox_found = "Y";
							if (returnval == "Y") {
								shelfs.InputText = get_message("POGCR_MOD_CHANGE_Y");
							} else if (returnval == "N") {
								shelfs.InputText = get_message("POGCR_MOD_CHANGE_N");
							}
							var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
							var hex_decimal = new THREE.Color(colorValue);
							var bg_color = colorValue;
							g_shelf_index = j;
							shelfs.ManualZupdate = "Y";
							g_dblclick_objid = shelfs.SObjID;
							var return_val = await add_text_box(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, "Y", i, shelfs.InputText, bg_color, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, j, shelfs.Rotation, shelfs.Slope, "N", shelfs.FStyle, shelfs.FSize, shelfs.FBold, 2, p_pog_index, g_pogcr_enhance_textbox_fontsize,shelfs.TextDirection); //ASA-1797.1
							shelfs.SObjID = return_val;
							break;
						}
					}
					j = j + 1;
				}
				if (textbox_found == "N") {
					var returnval = await create_change_textbox(returnval, modules.Module, parseFloat(details_arr[5]) - 0.05, i, p_pog_index);
					var shelfs = p_new_pogjson[p_pog_index].ModuleInfo[i].ShelfInfo[p_new_pogjson[p_pog_index].ModuleInfo[i].ShelfInfo.length - 1];
					var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
					var hex_decimal = new THREE.Color(colorValue);
					var bg_color = colorValue;

					var return_val = add_text_box(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, "N", i, shelfs.InputText, bg_color, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, p_new_pogjson[p_pog_index].ModuleInfo[i].ShelfInfo.length - 1, shelfs.Rotation, shelfs.Slope, "N", shelfs.FStyle, shelfs.FSize, shelfs.FBold, 2, p_pog_index, g_pogcr_enhance_textbox_fontsize);
					shelfs.SObjID = return_val;
				}
			}
			i = i + 1;
		}
		render(p_pog_index);
		logDebug("function : update_textbox_change", "E");
	}
}

async function update_pog_json(p_pog_index) {
	logDebug("function : update_pog_json", "S");
	return new Promise(function (resolve, reject) {
		//update json with latest dim details and get back.
		updPog = [];
		updPog.push(g_pog_json[p_pog_index]);
		var p = apex.server.process(
			"UPDATE_JSON",
			{
				x01: g_pog_json[p_pog_index].POGCode,
				x02: g_pog_json[p_pog_index].Version,
				p_clob_01: JSON.stringify(updPog),
			},
			{
				dataType: "html",
			}
		);
		// When the process is done, set the value to the page item
		p.done(function (data) {
			logDebug("function : update_pog_json", "E");
			resolve($.trim(data));
		});
	});
}

//this function is used on save POG. it will check if any workflow exists for the Div/Dept/Subdept then it will not save the POG to tables.
//but save as draft.
async function check_workflow_setup(p_pog_code) {
	logDebug("function : check_workflow_setup; p_pog_code : " + p_pog_code, "S");
	return new Promise(function (resolve, reject) {
		//update json with latest dim details and get back.
		var p = apex.server.process(
			"WORKFLOW_CHECK",
			{
				x01: p_pog_code,
			},
			{
				dataType: "html",
			}
		);
		// When the process is done, set the value to the page item
		p.done(function (data) {
			resolve($.trim(data));
		});
		logDebug("function : check_workflow_setup", "E");
	});
}

//This function is called when click SAVE pog from screen.
async function save_pog_final(p_wip_pog) {
	logDebug("function : save_pog_final", "S");
	try {
		//ASA-1729
		if (g_show_live_image == "N") {
			await clearHighlight(); //ASA-1578 Issue 1
		}
		var new_pogjson = [];
		var new_camera;
		var new_world;
		var pog_info = {};
		var pog_list = [];
		var errorStatus = "N";
		var errorMessage;
		var workFlowPOG;
		var overhung_exists = "N"; //ASA-1412
		var overhung_failed = "N"; //ASA-1412
		g_ispog_savingerror = "N";
		g_pog_saving_error_msg = "";
		if (g_all_pog_flag == "N") {
			var z = g_pog_index;
		} else {
			var z = 0;
		}
		for (const jsonData of g_pog_json) {
			if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
				errorStatus = "N";
				errorMessage = "";
				new_pogjson[0] = g_pog_json[z];
				new_camera = g_scene_objects[z].scene.children[0];
				new_world = g_scene_objects[z].scene.children[2];
				if (typeof new_pogjson !== "undefined" && new_pogjson.length > 0) {
					$s("P25_OPEN_DRAFT", "N");
					$s("P25_PRODUCT_BTN_CLICK", "N");
					//we first check if all basic information are present.
					var returnval = validate_pog_detail("N", z);
					if (returnval == "Y") {
						g_ispog_savingerror = "Y";
						errorStatus = "Y";
						errorMessage = errorMessage = errorMessage + "</br> POG Code: " + new_pogjson[0].POGCode + " " + get_message("ENTER_MADATORY_POG_DETAIL");
						g_pog_saving_error_msg = "POG Code: " + new_pogjson[0].POGCode + " " + get_message("ENTER_MADATORY_POG_DETAIL");
					} else {
						//var return_details = await update_pog_json(z); temporary commented due to error. need to check if this is need now or not.
						//console.log('return_details',return_details);
						// new_pogjson = JSON.parse(return_details);
						var module_details = new_pogjson[0].ModuleInfo;
						var i = 0;
						var dim_check = "Y";
						for (const modules of module_details) {
							if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
								new_pogjson[0].ModuleInfo[i].Carpark = [];
								var l_shelf_details = modules.ShelfInfo;
								var j = 0;
								for (const shelfs of l_shelf_details) {
									if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
										if (shelfs.ItemInfo.length > 0) {
											var item_Details = shelfs.ItemInfo;
											var k = 0;
											for (const items of item_Details) {
												new_pogjson[0].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DimUpdate = "N";
												k = k + 1;
											}
										}
									}
									j = j + 1;
								}
							}
							i = i + 1;
						}
						//here we first collect all the items that have dimension mismatch and add in an array.
						var dim_check = "Y";
						var module_details = new_pogjson[0].ModuleInfo;
						var i = 0;
						var items_list = [];
						logDebug("function : item_validation ", "S");
						for (const modules of module_details) {
							if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
								for (const car_shelf of modules.Carpark) {
									var select_object = new_world.getObjectById(car_shelf.SObjID);
									new_world.remove(select_object);
									for (const car_items of car_shelf.ItemInfo) {
										var select_object = new_world.getObjectById(car_items.ObjID);
										new_world.remove(select_object);
									}
								}
								new_pogjson[0].ModuleInfo[i].Carpark = [];
								var l_shelf_details = modules.ShelfInfo;
								var j = 0;
								g_pog_json[z] = new_pogjson[0];
								for (const shelfs of l_shelf_details) {
									if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
										if (shelfs.ItemInfo.length > 0) {
											var item_Details = shelfs.ItemInfo;
											var k = 0;
											for (const items of item_Details) {
												if (new_pogjson[0].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DimUpdate !== "Y" && new_pogjson[0].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DimUpdate !== "E") {
													if (check_dim_difference(i, j, k, z)) {
														items.PIndex = z;
														g_errored_items.push(items);
														var item_info = {};
														item_info["MIndex"] = i;
														item_info["SIndex"] = j;
														item_info["IIndex"] = k;
														item_info["Item"] = items.Item;

														items_list.push(item_info);
													}
												} else if (new_pogjson[0].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DimUpdate == "E") {
													dim_check = "N";
												}
												k = k + 1;
											}
										}
									}
									j = j + 1;
								}
							}
							i = i + 1;
						}
						var sorto = {
							MIndex: "asc",
							SIndex: "asc",
							IIndex: "asc",
						};
						//we loop that array and reset those items and similar item with new dimension and try to validate.
						//if validation pass then we recreate those shelf. if validation fail when we raise error on screen.
						items_list.keySort(sorto);
						// var old_overhang_active = g_overhung_shelf_active; //ASA-1412-S issue 6
						// g_overhung_shelf_active = "N";//ASA-1412-S issue 6
						var prev_mod = -1,
							prev_shelf = -1;
						var j = 0;
						// Regression issue 1 20240718, Start
						var j = 0;
						for (const details of items_list) {
							var items = new_pogjson[0].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex];
							if (items.DimUpdate !== "Y" && items.DimUpdate !== "E" && details.ObjType !== "PEGBOARD") {
								var return_val = await org_dim_update_shelf(details.MIndex, details.SIndex, details.IIndex, items, details.Item, "N", z);
								if (return_val == "N") {
									dim_check = "N";
									items_list[j].RecreateShelf = "N";
								} else {
									items_list[j].RecreateShelf = "Y";
								}
							}
							j++;
						}
						for (const details of items_list) {
							if (details.RecreateShelf == "Y") {
								if ((prev_mod !== details.MIndex && prev_shelf !== details.SIndex) || (prev_mod == details.MIndex && prev_shelf !== details.SIndex)) {
									if (reorder_items(details.MIndex, details.SIndex, z)) {
										var retval = await recreate_all_items(details.MIndex, details.SIndex, new_pogjson[0].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ObjType, "Y", -1, -1, new_pogjson[0].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "N", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters ,//ASA-1412 issue 5 details.MIndex, details.SIndex
									}
								}
							}
							prev_mod = details.MIndex;
							prev_shelf = details.SIndex;
						}
						/*var shelf_check = "Y";
                        for (const details of items_list) {
                        var items = new_pogjson[0].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex];
                        if (items.DimUpdate !== "Y" && items.DimUpdate !== "E" && details.ObjType !== "PEGBOARD") {
                        var return_val = await org_dim_update_shelf(details.MIndex, details.SIndex, details.IIndex, items, details.Item, "N", z);
                        if (return_val == "N") { //when prev item validation fails next shelf is not recreated. so changed shelf_check logic.
                        dim_check = "N";
                        shelf_check = "N";
                        } else {
                        shelf_check = "Y";
                        }
                        //ASA-1412 issue 5
                        if (((prev_mod !== details.MIndex && prev_shelf !== details.SIndex) || items_list.length - 1 == j) && return_val == "Y" && shelf_check == "Y") { //(prev_mod !== details.MIndex && prev_mod > -1) || (prev_shelf !== details.SIndex && prev_shelf > -1) || || items_list.length  == j
                        if (reorder_items(details.MIndex, details.SIndex, z)) {  // ASA-1412 issue 5 prev_mod, prev_shelf
                        var retval = await recreate_all_items(details.MIndex, details.SIndex, new_pogjson[0].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ObjType, "Y", -1, -1, new_pogjson[0].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "N", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters ,//ASA-1412 issue 5 details.MIndex, details.SIndex
                        shelf_check = "Y";
                        }
                        }
                        //ASA-1412 issue E
                        }
                        prev_mod = details.MIndex;
                        prev_shelf = details.SIndex;
                        j++;
                        }*/
						// Regression issue 1 20240718, End
						// g_overhung_shelf_active = old_overhang_active;//ASA-1412-S issue 6
						render(z);

						var p = 0; //ASA-1443 issue 2 S
						for (const modules of new_pogjson[0].ModuleInfo) {
							if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
								if (modules.ShelfInfo !== null) {
									var j = 0;
									for (const shelfs of modules.ShelfInfo) {
										if (shelfs.ObjType == "BASE") {
											new_pogjson[0].ModuleInfo[p].ShelfInfo.splice(j, 1);
										}
										if (typeof g_combinedShelfs !== "undefined" && g_combinedShelfs.length > 0) {
											//ASA1247
											if (g_combinedShelfs.length > 0) {
												var k = 0; //i = 0;
												for (combination of g_combinedShelfs) {
													var l = 0;
													for (shelf_info of combination) {
														if (shelf_info.Shelf == shelfs.Shelf && z == shelf_info.PIndex) {
															shelf_info.SIndex = j;
														}
														l++;
													}
													k++; // i++
												}
											}
										} //ASA1247
										j = j + 1;
									}
								}
							}
							p = p + 1;
						} //ASA-1443 issue 2 E
						//we also verify if any items are overhung outside shelfs.
						if ($v("P25_POGCR_VALIDATE_OVERHUNG") == "Y") {
							//ASA-1412-S issue 9 S
							[overhung_exists, overhung_failed] = await identifyOverhungItems(z, "Y", "N");
						}
						if (overhung_failed == "Y" || overhung_exists == "Y") {
							//ASA-1247
							g_ispog_savingerror = "Y";
							dim_check = "N";
							errorStatus = "Y"; //ASA-1412-S issue 6
							errorMessage = errorMessage = errorMessage + "</br> POG Code: " + new_pogjson[0].POGCode + " " + get_message("POGCR_OVERHUNG_SHELF_DENY");
							g_pog_saving_error_msg = g_pog_saving_error_msg + "</br> POG Code: " + new_pogjson[0].POGCode + " " + get_message("POGCR_OVERHUNG_SHELF_DENY");
						} //ASA-1412-S issue 9 E
						else {
							//ASA-1412 issue 6
							if (dim_check == "Y") {
								//if dimension check passed. we check if renumbering needs to be done. then take basic parameters from BU param and
								//call renumbering.
								if ($v("P25_POGCR_ENBL_AUTO_NUM_ITEM") == "Y") {
									var order_type = "",
										start_one_mod = "",
										start_one_fixel = "";
									if ($v("P25_POGCR_DEFAULT_START_FIXEL") == "1") {
										order_type = 1;
										start_one_mod = "";
										start_one_fixel = 1;
									} else {
										if ($v("P25_UNQ_POG_MODULE_ITEM_LOC") == "Y") {
											order_type = 2;
											start_one_mod = 2;
											start_one_fixel = 0;
										} else {
											order_type = 1;
											start_one_mod = "";
											start_one_fixel = 0;
										}
									}
									var res = await location_numbering("LR", $v("P25_POGCR_DEFAULT_DIRECTION"), order_type, start_one_fixel, start_one_mod, z, $v("P25_PALLET_DIRECTION")); //ASA-1892 Issue7
									new_pogjson[0] = g_pog_json[z];
									console.log("after renumbering");
								}
								if ($v("P25_POGCR_AUTO_FIXEL_RENUM") == "Y") {
									// Start ASA-1129
									var params = $v("P25_POGCR_FIXEL_RENUM_PARAM").split(",");
									var default_order = params[2];
									var pog_dir = params[0];
									var mod_dir = "",
										start_one_mod = "",
										include_mod_name = "",
										separator = "",
										order_type = "";
									var ignore = params[1];
									if (default_order !== "POG") {
										order_type = "2";
										mod_dir = params[2].substring(0, 2);
										start_one_mod = params[2].substring(2, 3) == "Y" ? "2" : "";
										separator = params[2].substring(3, 4);
										include_mod_name = params[2].substring(4, 5) == "Y" ? "3" : "";
									} else {
										mod_dir = "LR";
										order_type = "1";
										start_one_mod = "2";
									}

									await fixture_numbering(mod_dir, pog_dir, ignore, order_type, start_one_mod, include_mod_name, separator, "", "", z);
									new_pogjson[0] = g_pog_json[z];
								} // End ASA-1129
								//Bug-26122 - splitting the chest when its g_pogcr_pdf_chest_split == 'Y'for printing in PDF
								await get_chest_split_details(g_pogcr_pdf_chest_split, z);
								//ASA-1446 Uncomment the god beacuse we need toupdate the GenrateCombineS on saving time
								var combine = get_combine_arr(); //asa-1353 issue 3 ,
								new_pogjson[0].GenrateCombineS = combine; //asa-1353 issue 3
								//every module will have a entry in sm_pog_fixel. but this is not used in the screen and if we hold it on screen it will create
								//problem to handle shelfinfo loop. so we add it when save POG and remove when after saving into table and then
								//save a copy of json in sm_pog_design.
								$.each(module_details, function (i, Modules) {
									console.log("inside saving loop");
									if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
										var ShelfInfo = {};
										var shelf_name;
										shelf_name = $v("P25_POGCR_BASE_FIXEL_PREFIX") + Modules.Module; // error in batch PDF for fixel_id more than 50 char
										/*if ($v("P25_POGCR_BASE_NAMING_METHOD") == "PM") {
                                        shelf_name = new_pogjson[0].POGCode + Modules.Module + "_";
                                        } else if ($v("P25_POGCR_BASE_NAMING_METHOD") == "M") {
                                        shelf_name = Modules.Module + "_";
                                        }*/

										ShelfInfo["Shelf"] = shelf_name;
										ShelfInfo["ObjType"] = "BASE";
										ShelfInfo["Desc"] = "";
										ShelfInfo["MaxMerch"] = 0;
										ShelfInfo["GrillH"] = 0;
										ShelfInfo["LOverhang"] = 0;
										ShelfInfo["ROverhang"] = 0;
										ShelfInfo["SpacerThick"] = 0;
										ShelfInfo["HorizGap"] = 0;
										ShelfInfo["SpreadItem"] = "L";
										ShelfInfo["Combine"] = "N";
										ShelfInfo["AllowAutoCrush"] = "N";
										ShelfInfo["H"] = Modules.H;
										ShelfInfo["W"] = Modules.W - Modules.NotchW * 2;
										ShelfInfo["D"] = new_pogjson[0].BackDepth;
										ShelfInfo["Rotation"] = Modules.Rotation;
										ShelfInfo["Slope"] = 0;
										ShelfInfo["Color"] = Modules.Color;
										ShelfInfo["LiveImage"] = "";
										ShelfInfo["HorizSlotStart"] = 0;
										ShelfInfo["HorizSlotSpacing"] = 0;
										ShelfInfo["HorizStart"] = Modules.HorzStart;
										ShelfInfo["HorizSpacing"] = Modules.HorzSpacing;
										ShelfInfo["UOverHang"] = 0;
										ShelfInfo["LoOverHang"] = 0;
										ShelfInfo["VertiStart"] = Modules.VertStart;
										ShelfInfo["VertiSpacing"] = Modules.VertSpacing;
										ShelfInfo["X"] = Modules.X;
										ShelfInfo["Y"] = Modules.Y;
										ShelfInfo["Z"] = Modules.Z;
										ShelfInfo["InputText"] = "";
										ShelfInfo["WrapText"] = "";
										ShelfInfo["ReduceToFit"] = "";
                                        ShelfInfo["TextDirection"] = "";
										ShelfInfo["BsktFill"] = "";
										ShelfInfo["BsktSpreadProduct"] = "";
										ShelfInfo["SnapTo"] = "";
										ShelfInfo["BsktWallH"] = 0;
										ShelfInfo["BsktBaseH"] = 0;
										ShelfInfo["BsktWallThickness"] = 0;
										ShelfInfo["DSlotStart"] = 0;
										ShelfInfo["DSlotSpacing"] = 0;
										ShelfInfo["DGap"] = 0;
										ShelfInfo["FrontOverHang"] = 0;
										ShelfInfo["BackOverHang"] = 0;
										ShelfInfo["SlotDivider"] = "";
										ShelfInfo["AllowOverLap"] = "N";
										ShelfInfo["AutoPlacing"] = "N";
										ShelfInfo["SlotOrientation"] = "";
										ShelfInfo["DividerFixed"] = "N";
										ShelfInfo["ItemInfo"] = [];

										new_pogjson[0].ModuleInfo[i].ShelfInfo.push(ShelfInfo);
									}
								});
								var details = await get_min_max_xy(z);
								var details_arr = details.split("###");
								new_pogjson[0].Cal_Width = parseFloat(details_arr[0] * 100);
								new_pogjson[0].Cal_height = parseFloat(details_arr[1] * 100);
								console.log("details", details);

								POG_json = JSON.stringify(new_pogjson[0]);
							} else {
								g_ispog_savingerror = "Y";
								errorStatus = "Y";
								errorMessage = errorMessage = errorMessage + "</br> POG Code: " + new_pogjson[0].POGCode + " " + get_message("DIM_MISMATCH_ITEMS");
								g_pog_saving_error_msg = g_pog_saving_error_msg + "</br> POG Code: " + new_pogjson[0].POGCode + " " + get_message("DIM_MISMATCH_ITEMS");
							}
						} //ASA-1412 issue 6
					}
				}                
				//this function is used on save POG. it will check if any workflow exists for the Div/Dept/Subdept then it will not save the POG to tables.
				//but save as draft.
				var workflow_check = await check_workflow_setup(new_pogjson[0].POGCode);
				if (workflow_check == "Y") {
					workFlowPOG = workFlowPOG + ", " + new_pogjson[0].POGCode;
				}

				pog_info = {};
				var tJson = [];
				new_pogjson[0].DeleteItems = [];
				tJson = JSON.stringify(new_pogjson);
				pog_info["POGCode"] = new_pogjson[0].POGCode;
				pog_info["division"] = new_pogjson[0].Division;
				pog_info["dept"] = new_pogjson[0].Dept;
				pog_info["subDept"] = new_pogjson[0].SubDept;
				pog_info["description"] = new_pogjson[0].Desc7; //ASA-1765 Added description #issue 5
				//ASA-1108
				pog_info["pogjson"] = tJson;
				pog_info["version"] = new_pogjson[0].Version;
				pog_info["saveType"] = "Y";
				pog_info["Cal_Width"] = new_pogjson[0].Cal_Width;
				pog_info["Cal_height"] = new_pogjson[0].Cal_height;
				pog_info["errorStatus"] = errorStatus;
				pog_info["errorMessage"] = errorMessage;
				pog_info["workflow_check"] = workflow_check;
				pog_info["draftInd"] = "N";

				pog_list.push(pog_info);

				if (g_all_pog_flag == "N") {
					break;
				} else {
					z++;
				}
			}
		}
		if (p_wip_pog == "Y") {
			//ASA-1356-Start
			await save_wpog(pog_list); //ASA-1694 added await
		} else {
			await saveMultiplePog(pog_list, workflow_check, workFlowPOG); //ASA-1694 added await
		} //ASA-1356-End

		//ASA-1694 Start
		if (typeof g_autofill_detail["AFVersion"] != "undefined" && !(g_wf_pog_approval_enabled == "Y" && g_pogcr_pog_approval_for_new_pog == "N")) {
			//Regression 5 20250217
			apex.server.process(
				"SAVE_AUTOFILL",
				{
					x01: g_autofill_detail["AFPOGCode"],
					x02: g_autofill_detail["AFVersion"],
					x03: g_autofill_detail["AutofillRule"],
					x04: g_autofill_detail["BlkSelType"],
					x05: g_autofill_detail["AFPOGVersion"] == "" || typeof g_autofill_detail["AFPOGVersion"] == "undefined" ? g_autofill_detail["AFVersion"] : g_autofill_detail["AFPOGVersion"],
					p_clob_01: JSON.stringify(filterAutoFillJsontag(g_autofill_detail)), //ASA-1965 TASK 1
				},
				{
					dataType: "text",
					success: function (pData) {
						var return_data = $.trim(pData).split(",");
						if (return_data[0] == "ERROR") {
							raise_error(pData);
						}
					},
				}
			);
		}
		//ASAS-1694 End
	} catch (err) {
		error_handling(err);
	}
}

async function saveMultiplePog(p_pogInfoArr, p_workflow_check, p_workFlowPOG) {
    var saveWorkflow = "N";
	var errored = "N";
	if (p_workflow_check == "Y") {
		saveWorkflow = "Y";
	}
	console.log("save pog process", p_pogInfoArr, p_workflow_check, p_workFlowPOG);
	for (const jsonData of p_pogInfoArr) {
		if (jsonData.errorStatus == "Y") {
			errored = "Y";
			break;
		}
	}
	if (errored == "N") {
		//this ajax will save the details in tables sm_pog,sm_pog_module,sm_pog_fixel,sm_pog_item_position and sm_pog_item
		apex.server.process(
			"SAVE_FINAL_POG",
			{
				p_clob_01: JSON.stringify(p_pogInfoArr),
			},
			{
				dataType: "text",
				success: function (pData) {
					console.log("pData", pData);
					var retPog = JSON.parse(pData);

					var i = 0;
					//there could be errors when saving pog coming from PL/SQL process.if errors we need to show error on screen and not save draft.
					for (pog of retPog.POGs) {
						//for (
						var x = 0;
						for (p of p_pogInfoArr) {
							if ((x !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
								if (pog.ErrorMessage != "N" && p.POGCode == pog.POGCode) {
									p_pogInfoArr[x].errorMessage = pog.ErrorMessage;
									p_pogInfoArr[x].errorStatus = "Y";
								}
								if (p.POGCode == pog.POGCode) {
									p_pogInfoArr[x].workflowId = pog.workflowId;
									p_pogInfoArr[x].Version = pog.POGVersion; //ASA-1330 - Prod issue. version is blank as ajax is have "version"
									var loc_pog = JSON.parse(p_pogInfoArr[x].pogjson);
									loc_pog[0].Version = pog.POGVersion;
									p_pogInfoArr[x].pogjson = JSON.stringify(loc_pog);
								}
							}
							x++;
						}
						if (pog.ErrorMessage !== "N") {
							g_pog_saving_error_msg = g_pog_saving_error_msg + "</br>" + pog.ErrorMessage;
							g_ispog_savingerror = "Y";
						} else {
							g_ispog_savingerror = "N";
						}
						var k = 0;
						for (p of g_pog_json) {
							if (p.POGCode == pog.POGCode) {
								g_pog_json[k].Version = pog.POGVersion;
							}
							k++;
						}
						i++;
					}
					//check mod change and update change textbox, if there is any change in the module by user. we create a textbox below each
					//module as CHANGE: YES or NO.
					async function doSomething() {
						if (g_ispog_savingerror == "N") {
							//ASA-1277-S // For update the IN POGINFO ARRAY
							var module_details = [];
							var i = 0;
							if (g_all_pog_flag == "Y") {
								//ASA-1331 KUSH  issue 1
								var l = 0;
							} else {
								var l = g_pog_index;
							}

							for (const pInfo of p_pogInfoArr) {
								if ((l !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
									var pogjson = JSON.parse(pInfo.pogjson);
									//ASA-1559
									// pogjson[0].MassUpdate = 'N'; //--20240415 Rregression issue 12
									module_details = pogjson[0].ModuleInfo;
									for (const modules of module_details) {
										if (modules.ShelfInfo.length > 0) {
											$.each(modules.ShelfInfo, function (k, shelfs) {
												if (typeof shelfs !== "undefined") {
													//remove the BASE shelfinfo added for saving purpose.
													if (shelfs.ObjType == "BASE") {
														if (k == 0) {
															pogjson[0].ModuleInfo[i].ShelfInfo.splice(k, k + 1);
														} else {
															pogjson[0].ModuleInfo[i].ShelfInfo.splice(k, 1);
														}
													}
												}
											});
										}
										i = i++;
									}
									g_world = g_scene_objects[l].scene.children[2]; //ASA-1331 KUSH addedto update the world from scene
									var returnval = await update_textbox_change(g_pog_json, l);
									var tJson = [];
									g_pog_json[l].MassUpdate = "N"; //ASA-1559
									tJson = JSON.stringify([g_pog_json[l]]);
									pInfo.pogjson = tJson;
								}
								if (g_all_pog_flag == "Y") {
									//ASA-1331 KUSH  issue 1
									l++;
								} else {
									break;
								}
							}
						} //ASA-1277-E //
						//when no error in saving POG we send that json to sm_pog_design for future user as user_draf_ind = 'N'.
						apex.server.process(
							"SAVE_DRAFT",
							{
								p_clob_01: JSON.stringify(p_pogInfoArr),
							},
							{
								dataType: "text",
								success: function (pData) {
                                    const returnData  = $.trim(pData); 
                                    if (returnData.startsWith("ERROR")) { // Additional validation during POG save for Draft Save
                                        raise_error(returnData);
                                    }
                                    else{
                                        retPog = JSON.parse(pData);
                                        //if there is any error in saving draft log it on screen.
                                        for (pog of retPog.POGs) {
                                            //for (
                                            var x = 0;
                                            for (p of p_pogInfoArr) {
                                                if (pog.ErrorMessage != "N" && p.POGCode == pog.POGCode) {
                                                    p_pogInfoArr[x].errorMessage = pog.ErrorMessage;
                                                    p_pogInfoArr[x].errorStatus = "Y";
                                                }
                                                if (p.POGCode == pog.POGCode) {
                                                    p_pogInfoArr[x].seqId = pog.seqId;
                                                }
                                                x++;
                                            }
                                            if (pog.ErrorMessage != "N") {
                                                g_pog_saving_error_msg = g_pog_saving_error_msg + "</br>" + pog.ErrorMessage;
                                                g_ispog_savingerror = "Y";
                                            }
                                        }
                                        g_pog_edited_ind = "N";
                                        console.log("save", $v("P25_SAVE_WITH_PDF"));
                                        //we have 2 options while saving POG. with PDF or Without PDF. if select with PDF. we need to generate a PDF and
                                        //update in sm_pog table with that PDF file.
                                        if ($v("P25_SAVE_WITH_PDF") == "Y") {
                                            async function generate_pdf() {
                                                g_combinedShelfs = []; // Regression-29 issue
                                                if (g_all_pog_flag == "Y") {
                                                    // start ASA-1117
                                                    var x = 0;
                                                    for (p of p_pogInfoArr) {
                                                        if ((x !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                                                            if (p.errorStatus == "N") {
                                                                var workflow_draft = typeof p.workflowId !== "undefined" && p.workflowId > 0 && p.seqId !== "" ? "Y" : "N";
                                                                var new_camera = g_scene_objects[x].scene.children[0];
                                                                g_world = g_scene_objects[x].scene.children[2];
                                                                var p_pog_details = {
                                                                    SeqNo: "",
                                                                    POGCode: p.POGCode,
                                                                    POGVersion: p.Version,
                                                                    POGModule: "",
                                                                    Selection_Type: workflow_draft == "Y" ? "D" : "E",
                                                                    Print_Type: "P",
                                                                    SequenceId: p.seqId,
                                                                    TemplateId: $v("P25_PDF_TEMPLATE").split("-")[0],
                                                                    TemplateDetails: $v("P25_PDF_TEMPLATE"),
                                                                };
                                                                //this function will create a PDF and save in the table sm_pog
                                                                //ASA-1870 passed values from $v("P25_POGCR_ENHANCE_PDF_IMG") to $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE") to set_scene
                                                                await create_pdf(p_pog_details, $v("P25_SAVE_WITH_PDF"), "Y", new_camera, workflow_draft == "Y" ? "D" : "E", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_NOTCH_HEAD"), "Y", x, "Y", g_all_pog_flag, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), workflow_draft, p.seqId, g_hide_show_dos_label,'',
                                                                $v("P25_POGCR_ENHANCE_PDF_IMG"), $v("P25_POGCR_PDF_IMG_ENHANCE_RATIO"), $v("P25_POGCR_PDF_CANVAS_SIZE"), $v("P25_VDATE"), $v("P25_POG_POG_DEFAULT_COLOR"), $v("P25_POG_MODULE_DEFAULT_COLOR"),$v("P25_POGCR_DFT_SPREAD_PRODUCT"), $v("P25_PEGB_DFT_HORIZ_SPACING"),$v("P25_PEGBOARD_DFT_VERT_SPACING"), $v("P25_BASKET_DFT_WALL_THICKNESS"), $v("P25_CHEST_DFT_WALL_THICKNESS"), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"),$v("P25_POGCR_TEXT_DEFAULT_SIZE"), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"),$v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"),$v("P25_POGCR_DFT_BASKET_FILL"),$v("P25_POGCR_DFT_BASKET_SPREAD"),$v("P25_POGCR_BAY_LIVE_IMAGE"),$v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                                                            }
                                                        }
                                                        x++;
                                                    }

                                                    if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function") {
                                                        removeLoadingIndicator(regionloadWait);
                                                    }
                                                } else {
                                                    if (p_pogInfoArr[0].errorStatus == "N") {
                                                        var workflow_draft = typeof p_pogInfoArr[0].workflowId !== "undefined" && p_pogInfoArr[0].workflowId > 0 && p_pogInfoArr[0].seqId !== "" ? "Y" : "N";
                                                        var new_camera = g_scene_objects[g_pog_index].scene.children[0];
                                                        var p_pog_details = {
                                                            SeqNo: "",
                                                            POGCode: p_pogInfoArr[0].POGCode,
                                                            POGVersion: p_pogInfoArr[0].Version,
                                                            POGModule: "",
                                                            Selection_Type: workflow_draft == "Y" ? "D" : "E",
                                                            Print_Type: "P",
                                                            SequenceId: p_pogInfoArr[0].seqId,
                                                            TemplateId: $v("P25_PDF_TEMPLATE").split("-")[0],
                                                            TemplateDetails: $v("P25_PDF_TEMPLATE"),
                                                        };

                                                        //ASA-1870 passed values from $v("P25_POGCR_ENHANCE_PDF_IMG") to $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE") to set_scene
                                                        await create_pdf(p_pog_details, $v("P25_SAVE_WITH_PDF"), "Y", new_camera, workflow_draft == "Y" ? "D" : "E", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_NOTCH_HEAD"), "Y", g_pog_index, "Y", g_all_pog_flag, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), workflow_draft, p_pogInfoArr[0].seqId, g_hide_show_dos_label, '',
                                                        $v("P25_POGCR_ENHANCE_PDF_IMG"), $v("P25_POGCR_PDF_IMG_ENHANCE_RATIO"), $v("P25_POGCR_PDF_CANVAS_SIZE"), $v("P25_VDATE"), $v("P25_POG_POG_DEFAULT_COLOR"), $v("P25_POG_MODULE_DEFAULT_COLOR"), $v("P25_POGCR_DFT_SPREAD_PRODUCT"), $v("P25_PEGB_DFT_HORIZ_SPACING"), $v("P25_PEGBOARD_DFT_VERT_SPACING"), $v("P25_BASKET_DFT_WALL_THICKNESS"), $v("P25_CHEST_DFT_WALL_THICKNESS"), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"), $v("P25_POGCR_TEXT_DEFAULT_SIZE"), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DFT_BASKET_FILL"), $v("P25_POGCR_DFT_BASKET_SPREAD"), $v("P25_POGCR_BAY_LIVE_IMAGE"), $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                                                    }
                                                    if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function") {
                                                        removeLoadingIndicator(regionloadWait);
                                                    }
                                                }
                                                show_errors_final_pog(p_pogInfoArr);
                                            }
                                            generate_pdf();
                                            logDebug("function : save_pog_final", "E");
                                        } else {
                                            show_errors_final_pog(p_pogInfoArr);
                                        }
                                        if (g_all_pog_flag == "Y") {
                                            var z = 0;
                                        } else {
                                            var z = g_pog_index;
                                        }

                                        for (const pogJson of g_pog_json) {
                                            var i = 0;
                                            for (const modules of g_pog_json[z].ModuleInfo) {
                                                if (modules.ShelfInfo.length > 0) {
                                                    $.each(modules.ShelfInfo, function (k, shelfs) {
                                                        if (typeof shelfs !== "undefined") {
                                                            if (shelfs.ObjType == "BASE") {
                                                                g_pog_json[z].ModuleInfo[i].ShelfInfo.splice(k, 1);
                                                            }
                                                        }
                                                    });
                                                }
                                                i++;
                                            }
                                            if (g_all_pog_flag == "Y") {
                                                z++;
                                            } else {
                                                break;
                                            }
                                        }
                                    }
								},
							}
						);
					}
					doSomething();
				},
			}
		);
	} else {
		var erroMsg = "Failed POG: ";
		for (p of p_pogInfoArr) {
			if (p.errorMessage != "") {
				hasFailedRec = "Y";
				erroMsg = erroMsg + "</br>" + p.errorMessage;
			}
		}
		raise_error(erroMsg);
		//Regression Issue 9 20250303
		// try {
		//     raise_error(erroMsg);
		// } catch {

		//     if (typeof regionloadWait !== "undefined" && regionloadWait !== null) {
		//     removeLoadingIndicator(regionloadWait);

		//     }

		//     // removeLoadingIndicator(regionloadWait);
		// }
	}
}

//this function is used to set background color in product list Grid. deleted items will have red and added item will have green.
function set_grid_background_color() {
	logDebug("function : set_grid_background_color", "S");
	try {
		var model = apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model;
		model.forEach(function (record) {
			var details = [];
			var code = model.getValue(record, "EXISTING");
			var itemId = model.getValue(record, "ITEM");
			var itemCount = $("#draggable_table [data-id=" + itemId + "]").length;
			if (itemCount > 1) {
				//Task_21773
				for (var i = 0; i < itemCount; i++) {
					var elm = $("#draggable_table [data-id=" + itemId + "]")[i];
					var elmCode = $("> .existing", elm)[0].innerHTML;
					if (elmCode == "Y") {
						$(elm).children("td").css("color", "green");
					} else if (elmCode == "R") {
						$(elm).children("td").css("color", "red");
					}
				}
			} else {
				if (code == "Y") {
					$("#draggable_table [data-id=" + itemId + "] td").css("color", "green");
				} else if (code == "R") {
					$("#draggable_table [data-id=" + itemId + "] td").css("color", "red");
				}
			}
		});
		logDebug("function : set_grid_background_color", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function is called when click save template from screen.
async function save_final_template(p_pog_index, p_pog_code) {
	logDebug("function : save_final_template", "S");
	try {
		if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
			//basic pog information is validated.
			var returnval = validate_pog_detail("Y", p_pog_index);
			var templateName;
			if (returnval == "Y" && g_is_pog_template_open != "Y") {
				//ASA 1694 issue 3 added g_is_pog_template_open condition.
				alert(get_message("ENTER_MADATORY_POG_DETAIL"));
			} else {
				var json_array = [];
				json_array.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index])));
				var returnval = await save_delete_items(json_array, "N", p_pog_index);
				//ASA 1694 added g_is_pog_template_open condition.
				if (g_is_pog_template_open != "Y") {
					templateName = $v("P25_TEMPLATE_NAME") + " " + p_pog_code;
				} else {
					templateName = $v("P25_TEMPLATE_NAME");
				}
				apex.server.process(
					"TEMPLATE_DUP_CHECK",
					{
						x01: templateName,
					},
					{
						dataType: "text",
						success: function (pData) {
							if ($.trim(pData) == "Y") {
								//Task_29818 - Start
								// ax_message.set({
								//     labels: {
								//         ok: get_message("SHCT_YES"),
								//         cancel: get_message("SHCT_NO"),
								//     },
								// });

								// ax_message.set({
								//     buttonReverse: true,
								// });
								// ax_message.confirm(get_message("POG_TEMPLATE_ALREADY_EXISTS"), function (e) {
								//     if (e) {
								//         var temp_json = JSON.stringify(json_array);
								//         $(".top_icon").removeClass("active");
								//         $(".left_icon").removeClass("active");
								//         $(".save_draft").addClass("active");

								//         apex.server.process(
								//             "SAVE_TEMPLATE", {
								//             x01: $v("P25_TEMPLATE_NAME") + " " + p_pog_code,
								//             x02: "U",
								//             p_clob_01: temp_json,
								//         }, {
								//             dataType: "text",
								//             success: function (pData) {
								//                 var return_data = $.trim(pData).split(",");
								//                 if (return_data[0] == "ERROR") {
								//                     raise_error(pData);
								//                 } else {
								//                     //identify if any change in POG
								//                     g_pog_edited_ind = "N";
								//                     apex.message.showPageSuccess(get_message("TEMPLATE_SAVED"));
								//                     closeInlineDialog("save_as_template");
								//                     logDebug("function : save_final_template", "E");
								//                 }
								//             },
								//             loadingIndicatorPosition: "page",
								//         });
								//     }
								// });

								confirm(get_message("POG_TEMPLATE_ALREADY_EXISTS"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
									var temp_json = JSON.stringify(json_array);
									$(".top_icon").removeClass("active");
									$(".left_icon").removeClass("active");
									$(".save_draft").addClass("active");
									apex.server.process(
										"SAVE_TEMPLATE",
										{
											x01: templateName, //ASA-1694
											x02: "U",
											p_clob_01: temp_json,
										},
										{
											dataType: "text",
											success: function (pData) {
												var return_data = $.trim(pData).split(",");
												if (return_data[0] == "ERROR") {
													raise_error(pData);
												} else {
													//identify if any change in POG
													//ASA-1694 #23 Start
													if (typeof g_autofill_detail["AFVersion"] != "undefined") {
														//Regression 5 20250217
														g_autofill_detail["AFPOGCode"] = $v("P25_TEMPLATE_NAME") + " " + p_pog_code;
														g_autofill_detail["AFPOGVersion"] = "";
														apex.server.process(
															"SAVE_AUTOFILL",
															{
																x01: g_autofill_detail["AFPOGCode"],
																x02: g_autofill_detail["AFVersion"],
																x03: g_autofill_detail["AutofillRule"],
																x04: g_autofill_detail["BlkSelType"],
																x05: g_autofill_detail["AFPOGVersion"],
																p_clob_01: JSON.stringify(filterAutoFillJsontag(g_autofill_detail)), //ASA-1965 TASK 1
															},
															{
																dataType: "text",
																success: function (pData) {
																	var return_data = $.trim(pData).split(",");
																	if (return_data[0] == "ERROR") {
																		raise_error(pData);
																	} else {
																		g_pog_edited_ind = "N";
																		apex.message.showPageSuccess(get_message("TEMPLATE_SAVED"));
																		closeInlineDialog("save_as_template");
																		logDebug("function : save_final_template", "E");
																	}
																},
															}
														);
													} else {
														g_pog_edited_ind = "N";
														apex.message.showPageSuccess(get_message("TEMPLATE_SAVED"));
														closeInlineDialog("save_as_template");
														logDebug("function : save_final_template", "E");
													}
													//ASAS-1694 #23 End
												}
											},
											loadingIndicatorPosition: "page",
										}
									);
								});
								//Task_29818 - End
							} else {
								var temp_json = JSON.stringify(json_array);
								$(".top_icon").removeClass("active");
								$(".left_icon").removeClass("active");
								$(".save_draft").addClass("active");
								apex.server.process(
									"SAVE_TEMPLATE",
									{
										x01: templateName, //ASA-1694
										x02: "C",
										p_clob_01: temp_json,
									},
									{
										dataType: "text",
										success: function (pData) {
											var return_data = $.trim(pData).split(",");
											if (return_data[0] == "ERROR") {
												raise_error(pData);
											} else {
												//identify if any change in POG
												//ASA-1694 Start
												if (typeof g_autofill_detail["AFVersion"] != "undefined") {
													//Regression 5 20250217
													g_autofill_detail["AFPOGCode"] = $v("P25_TEMPLATE_NAME") + " " + p_pog_code;
													g_autofill_detail["AFPOGVersion"] = "";
													apex.server.process(
														"SAVE_AUTOFILL",
														{
															x01: g_autofill_detail["AFPOGCode"],
															x02: g_autofill_detail["AFVersion"],
															x03: g_autofill_detail["AutofillRule"],
															x04: g_autofill_detail["BlkSelType"],
															x05: g_autofill_detail["AFPOGVersion"],
															p_clob_01: JSON.stringify(filterAutoFillJsontag(g_autofill_detail)), //ASA-1965 TASK 1
														},
														{
															dataType: "text",
															success: function (pData) {
																var return_data = $.trim(pData).split(",");
																if (return_data[0] == "ERROR") {
																	raise_error(pData);
																} else {
																	g_pog_edited_ind = "N";
																	apex.message.showPageSuccess(get_message("TEMPLATE_SAVED"));
																	closeInlineDialog("save_as_template");
																	logDebug("function : save_final_template", "E");
																}
															},
														}
													);
												} else {
													g_pog_edited_ind = "N";
													apex.message.showPageSuccess(get_message("TEMPLATE_SAVED"));
													closeInlineDialog("save_as_template");
													logDebug("function : save_final_template", "E");
												}
												//ASAS-1694 End
											}
										},
										loadingIndicatorPosition: "page",
									}
								);
							}
						},
						loadingIndicatorPosition: "page",
					}
				);
			}
		}
	} catch (err) {
		error_handling(err);
	}
}

//the removed items list is saved in deleted items log to highlight in product list as red background
function save_delete_items(p_json_arry, p_delete_obj, p_pog_index) {
	logDebug("function : delete_items; delete_obj : " + p_delete_obj, "S");
	//console.log('delete_items called');
	return new Promise(function (resolve, reject) {
		var module_details = g_pog_json[p_pog_index].ModuleInfo;
		if (p_delete_obj == "N") {
			p_json_arry[0].POGCode = "";
			p_json_arry[0].Name = "";
			p_json_arry[0].Version = "";
		}
		$.each(module_details, function (i, modules_info) {
			if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
				$.each(modules_info.ShelfInfo, function (j, shelf_info) {
					var div_obj = {};
					var add_div_item = "N";
					if (p_delete_obj == "Y") {
						$.each(shelf_info.ItemInfo, function (k, item_info) {
							if (item_info.Item !== "DIVIDER") {
								g_deletedItems.push(item_info.ItemID);
								var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
								g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
							} else {
								div_obj = item_info;
								add_div_item = "Y";
							}
						});
					} else {
						$.each(shelf_info.ItemInfo, function (k, item_info) {
							if (item_info.Item == "DIVIDER") {
								div_obj = item_info;
								add_div_item = "Y";
							}
						});
					}
					p_json_arry[0].ModuleInfo[i].ShelfInfo[j].ItemInfo = [];
					if (add_div_item == "Y") {
						p_json_arry[0].ModuleInfo[i].ShelfInfo[j].ItemInfo.push(div_obj);
					}
				});
			}
		});
		let dellog = deleted_items_log(g_deletedItems, "D", p_pog_index);
		resolve("SUCCESS");
		logDebug("function : delete_items", "E");
	});
}

//this function is called from open fixel popup after use changes the fixel details and click save.
function fixel_update(p_model, p_camera, p_pog_index) {
    logDebug("function : fixel_update", "S");    
	try {
		return new Promise(function (resolve, reject) {
			//identify if any change in POG
			g_pog_edited_ind = "Y";

			var upd_mod_ind = -1,
				upd_shelf_index = -1,
				upd_item_index = -1;
			//running the loop on the IG data and getting details of all the fixel and run the process
			p_model.forEach(async function (record) {
				//ASA-1446 issue 5
				var mod_ind = parseInt(p_model.getValue(record, "MODULE_INDEX"));
				var shelf_ind = parseInt(p_model.getValue(record, "SHELF_INDEX"));
				g_shelf_index = shelf_ind;
				g_module_index = mod_ind;
				var l_valid = "N"; //Bug-26122 - splitting the chest

				var l_object_type = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ObjType;
                const current_z_loc = (g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Z * 100) - ((g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].D * 100) / 2); //ASA-1945 Issue1
				var width = parseFloat(p_model.getValue(record, "SHELF_WIDTH")) / 100,
					height = parseFloat(p_model.getValue(record, "SHELF_HEIGHT")) / 100,
					depth = parseFloat(p_model.getValue(record, "SHELF_DEPTH")) / 100;

				var x = parseFloat(p_model.getValue(record, "SHELF_X")) / 100 + parseFloat(p_model.getValue(record, "SHELF_WIDTH")) / 2 / 100;
				var y = parseFloat(p_model.getValue(record, "SHELF_Y")) / 100 + parseFloat(p_model.getValue(record, "SHELF_HEIGHT")) / 2 / 100; //ASA-1678 Issue 1 + g_pog_json[p_pog_index].BaseH;
				var z;
				if (p_model.getValue(record, "OBJECT_TYPE") == "Textbox") {
					z = parseFloat(p_model.getValue(record, "SHELF_Z")) / 100;
				} else {
					// z = parseFloat(p_model.getValue(record, "SHELF_Z")) / 100 + parseFloat(p_model.getValue(record, "SHELF_DEPTH")) / 2 / 100;
                    z = typeof g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Z == "undefined" || g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Z == "" ? g_pog_json[p_pog_index].BackDepth / 2 + (parseFloat(p_model.getValue(record, "SHELF_DEPTH")) / 2) / 100 : (current_z_loc / 100) + (parseFloat(p_model.getValue(record, "SHELF_DEPTH") / 2) / 100); //ASA-1945 Issue1
				} //ASA-1652 #12
				var items_arr = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo;
				//Update all items x and y before validation.
				$.each(items_arr, function (i, items) {
					items.OldX = items.X;
					items.OldY = items.Y;
					items.OldZ = items.Z;
				});
				var colorValue = parseInt(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Color.replace("#", "0x"), 16);
				var hex_decimal = new THREE.Color(colorValue);
				var item_width_arr = [],
					item_height_arr = [],
					item_depth_arr = [],
					item_index_arr = [];
				$.each(items_arr, function (i, items) {
					item_width_arr.push(wpdSetFixed(items.W)); //.toFixed(3)));
					item_height_arr.push(wpdSetFixed(items.H)); //.toFixed(3)));
					item_depth_arr.push(wpdSetFixed(items.D)); //.toFixed(3)));
					item_index_arr.push(i);
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[i].Exists = "E";
				});

				//when only depth is updated we no need to recreate the shelf. but we need to do items validation if any item depth is more then shelf depth.
				if (p_model.getValue(record, "DEPTH_UPDATE_FLAG") == "Y") {
					g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].D = parseFloat(p_model.getValue(record, "SHELF_DEPTH")) / 100;
   					g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z = z; //ASA-1945 Issue1

					var drag_item_arr = [];
					if (!validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, l_object_type, mod_ind, shelf_ind, -1, "N", 0, 0, 0, -1, "N", "Y", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
						p_model.setValue(record, "SHELF_DEPTH", p_model.getValue(record, "SHELF_DEPTH_OLD"));
						console.log("SHELF_DEPTH_OLD" + p_model.getValue(record, "SHELF_DEPTH_OLD") / 100);
						// g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].D = parseFloat(p_model.getValue(record, "SHELF_DEPTH_OLD")) / 100;
						if (items_arr.length > 0) {
							//capture the module is edit or not to create changed text box
							g_pog_json[p_pog_index].ModuleInfo[mod_ind].EditFlag = "Y";
						}
					} else {
						//Bug-26122 - splitting the chest
						l_valid = "Y";
					}
				}
				//if Z axis is updated we don't have any impact on items. so just update the detail
				if (p_model.getValue(record, "LOC_Z_UPDATE_FLAG") == "Y") {
					var new_z;
					if (p_model.getValue(record, "OBJECT_TYPE") == "Textbox") {
						new_z = parseFloat(p_model.getValue(record, "SHELF_Z")) / 100;
					} else {
						new_z = parseFloat(p_model.getValue(record, "SHELF_Z")) / 100 + parseFloat(p_model.getValue(record, "SHELF_DEPTH")) / 2 / 100;
					} //ASA-1652 #12
                   	// if (g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z == "" || typeof g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z == "undefined") {
					// 	g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z = new_z;
					// } else {
				    //     const current_z_loc = (g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z == "" || typeof g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z  * 100) - (g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z == "" || typeof g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].D * 100 / 2); // ASA-1945.1 
				    //     g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z = (current_z_loc / 100) + (g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].D / 2);
					// }
					g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Z = new_z;

					if (p_model.getValue(record, "OBJECT_TYPE") == "Textbox") {
						g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].ManualZupdate = "N"; //ASA-2000.1
						var selectecObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].SObjID);
						selectecObj["ShelfInfo"] = g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))];
						textboxPriorityPlacing(selectecObj, p_pog_index, new_z);
					} //ASA-1652 #12
					if (items_arr.length > 0) {
						//capture the module is edit or not to create changed text box
						g_pog_json[p_pog_index].ModuleInfo[mod_ind].EditFlag = "Y";
					}
					l_valid = "Y"; //Bug-26122 - splitting the chest
                    //ASA-1945 Issue2 Start
   				    if (p_model.getValue(record, "OBJECT_TYPE") !== "Textbox") {
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(parseInt(p_model.getValue(record, "SHELF_OBJID")));
                        selectedObject.Z = p_model.getValue(record, "SHELF_Z");
                    }
                    //ASA-1945 Issue2 End
				}
				//if fixel name is updated we need to update few things
				//undo redo array
				//combineshelfs array
				//shelf object FixelID, which will show in status bar.
				if (p_model.getValue(record, "FIXEL_UPDATE_FLAG") == "Y") {
					var old_shelf_name = g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Shelf;
					if (old_shelf_name !== p_model.getValue(record, "SHELF_ID")) {
						[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, old_shelf_name);
						if (currShelfCombIndx !== -1) {
							updateObjID(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ObjID, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ObjID, "S", old_shelf_name, p_model.getValue(record, "SHELF_ID"));
						}
					}
					if (p_model.getValue(record, "OBJECT_TYPE") == "Divider") {
						//ASA-1530 issue 1 S
						if (g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].ObjType == "DIVIDER") {
							var l_shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo;
							var i = 0;
							for (var shelfdivider of l_shelf_dtl) {
								var j = 0;
								for (var item_divider of shelfdivider.ItemInfo) {
									if (item_divider.Item == "DIVIDER" && item_divider.ObjID == g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].ShelfDivObjID) {
										item_divider.ItemID = p_model.getValue(record, "SHELF_ID");
										item_divider.Desc = p_model.getValue(record, "SHELF_DESC");
										break;
									}
									j++;
								}
								i++;
							}
						}
					} //ASA-1530 issue 1 E
					g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Shelf = p_model.getValue(record, "SHELF_ID");
					g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].Desc = p_model.getValue(record, "SHELF_DESC");
					if (p_model.getValue(record, "OBJECT_TYPE") !== "Divider") {
						var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].SObjID);
						selectedObject.FixelID = p_model.getValue(record, "SHELF_ID");
                        selectedObject.Desc = p_model.getValue(record, "SHELF_DESC"); //ASA-2029.1.1
					} else {
						$.each(g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo, function (i, shelf) {
							$.each(shelf.ItemInfo, function (j, items) {
								if (items.ObjID == parseInt(p_model.getValue(record, "SHELF_OBJID"))) {
									upd_mod_ind = parseInt(p_model.getValue(record, "MODULE_INDEX"));
									upd_shelf_index = i;
									upd_item_index = j;
									var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].ObjID);
									selectedObject.FixelID = p_model.getValue(record, "SHELF_ID");
                                    selectedObject.Desc = p_model.getValue(record, "SHELF_DESC"); //ASA-2029.1.1
									return false;
								}
							});
						});
					}
					l_valid = "Y"; //Bug-26122 - splitting the chest
					show_fixel_labels("Y", p_pog_index);
				}

				if (p_model.getValue(record, "OBJECT_TYPE") == "Divider" && (p_model.getValue(record, "LOC_UPDATE_FLAG") == "Y" || p_model.getValue(record, "DIM_UPDATE_FLAG") == "Y")) {
					$.each(g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo, function (i, shelf) {
						$.each(shelf.ItemInfo, function (j, items) {
							if (items.ObjID == parseInt(p_model.getValue(record, "SHELF_OBJID"))) {
								upd_mod_ind = parseInt(p_model.getValue(record, "MODULE_INDEX"));
								upd_shelf_index = i;
								upd_item_index = j;
								return false;
							}
						});
					});
				}
				//this is the update of fixel dimensions. if dimensions are updated. we set those values to shelf and run shelf validation and
				//item validation. if pass we set the new values or we set back old values.
				if (p_model.getValue(record, "DIM_UPDATE_FLAG") == "Y") {
					g_dblclick_objid = parseInt(p_model.getValue(record, "SHELF_OBJID"));

					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].W = width;
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].H = height;
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].D = depth;
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].X = x;
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Y = y;
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Z = z;

					var shelfZ;
					if (l_object_type == "TEXTBOX") {
						shelfZ = 0.0021;
					} else if (l_object_type == "PEGBOARD") {
						shelfZ = 0.003;
					} else if (l_object_type == "DIVIDER") {
						shelfZ = 0.001;
					} else {
						shelfZ = 0.0005;
					}

					if (l_object_type !== "DIVIDER") {
						var drag_item_arr = [];
						//if item validation pass we recreate shelf with new dim.
						if (validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, l_object_type, mod_ind, shelf_ind, -1, "N", 0, 0, 0, -1, "N", "Y", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
							async function update_fixel_dtl() {
								var items_arr = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo;
								var shelfs = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
								$.each(items_arr, function (i, items) {
									var [itemx, itemy] = get_item_xy(shelfs, items, items.W, items.H, p_pog_index);
									items.X = itemx;
									items.Y = itemy;
								});

								if (l_object_type == "PEGBOARD") {
									var return_val = add_pegboard(p_model.getValue(record, "SHELF_ID"), width, height, depth, hex_decimal, x, y, shelfZ, "Y", g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].VertiStart, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].VertiSpacing, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].HorizStart, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].HorizSpacing, mod_ind, shelf_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Rotation, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Slope, "Y", $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
								} else if (l_object_type == "ROD") {
									var return_val = add_rod(p_model.getValue(record, "SHELF_ID"), l_object_type, width, height, depth, hex_decimal, x, y, shelfZ, "Y", mod_ind, shelf_ind, p_pog_index);
								} else if (l_object_type == "TEXTBOX") {
									//ASA-1507 #4 Start
									if ($v("P25_POG_FIXEL_SHOW_TEXT_BOX_DESC") == "Y") {
										g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].InputText = p_model.getValue(record, "TEXTFIELD"); //ASA-1507 #4
									}
									//ASA-1507 #4 End
									ShelfInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
									var module_arr = g_pog_json[p_pog_index].ModuleInfo;
									$.each(module_arr, function (i, modules) {
										if (modules.ObjID == g_dblclick_objid) {
											ModuleInfo = g_pog_json[p_pog_index].ModuleInfo[i];
											child_module_index = i;
											return;
										}
									});
									if (g_show_live_image == "Y" && g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].TextImg !== "" && typeof g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].TextImg !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].TextImg !== null) {
										var return_val = await add_text_box_with_image(p_model.getValue(record, "SHELF_ID"), "SHELF", width, height, depth, hex_decimal, x, y, shelfZ, "Y", mod_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].InputText, colorValue, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].WrapText, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ReduceToFit, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Color, shelf_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Rotation, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Slope, "Y", g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].FStyle, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].FSize, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].FBold, $v("P25_NOTCH_HEAD"), p_pog_index);
									} else {
										var return_val = add_text_box(p_model.getValue(record, "SHELF_ID"), "SHELF", width, height, depth, hex_decimal, x, y, shelfZ, "Y", mod_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].InputText, colorValue, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].WrapText, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ReduceToFit, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Color, shelf_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Rotation, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Slope, "Y", g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].FStyle, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].FSize, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].FBold, 2, p_pog_index, g_pogcr_enhance_textbox_fontsize, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].TextDirection); //ASA-1797.1
									}
									g_pog_json[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
									//ASA-1652 #12 Start
									g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))].ManualZupdate = "N"; //ASA-2000.1
									var selectecObj = g_world.getObjectById(return_val);
									selectecObj["ShelfInfo"] = g_pog_json[p_pog_index].ModuleInfo[parseInt(p_model.getValue(record, "MODULE_INDEX"))].ShelfInfo[parseInt(p_model.getValue(record, "SHELF_INDEX"))];
									textboxPriorityPlacing(selectecObj, p_pog_index, z);
									//ASA-1652 #12 End
								} else {
									//  ASA-1446
									var [return_val, shelf_cnt] = await add_shelf(p_model.getValue(record, "SHELF_ID"), l_object_type, width, height, depth, hex_decimal, x, y, shelfZ, "Y", mod_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Rotation, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Slope, shelf_ind, "Y", "N", "Y", -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
									// var [return_val, shelf_cnt] = await add_shelf(p_model.getValue(record, "SHELF_ID"), l_object_type, width, height, depth, hex_decimal, x, y, shelfZ, "Y", mod_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Rotation, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Slope, shelf_ind, "Y", "N", "Y", -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
								}
								g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].SObjID = return_val;
								if (items_arr.length > 0) {
									//capture the module is edit or not to create changed text box
									g_pog_json[p_pog_index].ModuleInfo[mod_ind].EditFlag = "Y";
								}
								l_valid = "Y"; //Bug-26122 - splitting the chest
							}
							await update_fixel_dtl(); //ASA-1446 issue 5
						} else {
							p_model.setValue(record, "SHELF_WIDTH", p_model.getValue(record, "SHELF_WIDTH_OLD"));
							p_model.setValue(record, "SHELF_HEIGHT", p_model.getValue(record, "SHELF_HEIGHT_OLD"));
							p_model.setValue(record, "SHELF_DEPTH", p_model.getValue(record, "SHELF_DEPTH_OLD"));
							//If the validate_items function raises an error then place the shelf and items to the old position

							/*Start ASA-1318 Task 5 */
							var old_x = parseFloat(p_model.getValue(record, "SHELF_X_OLD")) / 100 + parseFloat(p_model.getValue(record, "SHELF_WIDTH_OLD")) / 2 / 100;
							var old_y = parseFloat(p_model.getValue(record, "SHELF_Y_OLD")) / 100 + parseFloat(p_model.getValue(record, "SHELF_HEIGHT_OLD")) / 2 / 100; //ASA-1678 Issue 1 + g_pog_json[p_pog_index].BaseH;
							var old_z;
							if (p_model.getValue(record, "OBJECT_TYPE") == "Textbox") {
								old_z = parseFloat(p_model.getValue(record, "SHELF_Z_OLD")) / 100;
							} else {
								old_z = parseFloat(p_model.getValue(record, "SHELF_Z_OLD")) / 100 + parseFloat(p_model.getValue(record, "SHELF_DEPTH_OLD")) / 2 / 100;
							} //ASA-1652 #12
							p_model.setValue(record, "SHELF_X", p_model.getValue(record, "SHELF_X_OLD"));
							p_model.setValue(record, "SHELF_Y", p_model.getValue(record, "SHELF_Y_OLD"));
							p_model.setValue(record, "SHELF_Z", p_model.getValue(record, "SHELF_Z_OLD"));

							g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].W = p_model.getValue(record, "SHELF_WIDTH_OLD") / 100;
							g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].H = p_model.getValue(record, "SHELF_HEIGHT_OLD") / 100;
							g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].D = p_model.getValue(record, "SHELF_DEPTH_OLD") / 100;
							g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].X = old_x;
							g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Y = old_y;
							g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Z = old_z;

							async function doSomething() {
								// var old_shelfx, old_shelfy;
								let result = await set_all_items(mod_ind, shelf_ind, old_x, old_y, "Y", "E", "Y", p_pog_index, p_pog_index);
							}
							/*End ASA-1318 Task 5 */
							doSomething();
						}
					} else {
						//if fixel is a divider. we need to check recreate divider inside shelf.
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].W = width;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].H = height;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].D = depth;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].RW = width;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].RH = height;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].RD = depth;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].OW = width;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].OH = height;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].OD = depth;
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].Y = g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].H / 2 + height / 2;

						var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_dblclick_objid);
						g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
						render(p_pog_index);

						var oBjID = add_items(p_model.getValue(record, "SHELF_ID"), width, height, depth, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Color, g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].X, g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].Y, shelfZ, upd_mod_ind, upd_shelf_index, upd_item_index, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Rotation, "Y", p_pog_index);
						g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].ObjID = oBjID;
						g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ShelfDivObjID = oBjID;
					}
				}
				//if X,Y is update for fixel even its divider or not. we are checking with new X,Y the shelf or divider will collide on any other
				//object or not. if not then set the new position.
				if (p_model.getValue(record, "LOC_UPDATE_FLAG") == "Y" && ((p_model.getValue(record, "DIM_UPDATE_FLAG") == "N" && p_model.getValue(record, "OBJECT_TYPE") !== "Divider") || p_model.getValue(record, "OBJECT_TYPE") == "Divider")) {
					var newX = parseFloat(p_model.getValue(record, "SHELF_X")) / 100 + parseFloat(p_model.getValue(record, "SHELF_WIDTH")) / 2 / 100;
					var newY = parseFloat(p_model.getValue(record, "SHELF_Y")) / 100 + parseFloat(p_model.getValue(record, "SHELF_HEIGHT")) / 2 / 100; //ASA-1678 Issue 1 + g_pog_json[p_pog_index].BaseH;
					// ASA-2000 Issue 1
                    if (p_model.getValue(record, "OBJECT_TYPE") == "Textbox") {
                        var newZ = parseFloat(p_model.getValue(record, "SHELF_Z")) / 100;
                    }
                    else{
                        var newZ = parseFloat(p_model.getValue(record, "SHELF_Z")) / 100 + parseFloat(p_model.getValue(record, "SHELF_DEPTH")) / 2 / 100;
                    }
                    // ASA-2000 Issue 1 End
					var old_mod_index = parseInt(p_model.getValue(record, "MODULE_INDEX"));
					var old_shelf_ind = parseInt(p_model.getValue(record, "SHELF_INDEX"));
					if (p_model.getValue(record, "OBJECT_TYPE") == "Divider") {
						if (p_model.getValue(record, "SHELF_Y") !== p_model.getValue(record, "SHELF_Y_OLD")) {
							var module_details = g_pog_json[p_pog_index].ModuleInfo;
							var mod_ind = -1,
								shelf_ind = -1,
								new_object_type,
								spread_product;
							$.each(module_details, function (j, Modules) {
								if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
									$.each(Modules.ShelfInfo, function (k, Shelf) {
										if (typeof Shelf !== "undefined") {
											if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "TEXTBOX" && Shelf.ObjType !== "DIVIDER") {
												if (wpdSetFixed(newY) == wpdSetFixed(wpdSetFixed(Shelf.Y) + Shelf.H / 2 + parseFloat(p_model.getValue(record, "SHELF_HEIGHT")) / 100 / 2)) {
													mod_ind = j;
													shelf_ind = k;
													new_object_type = Shelf.ObjType;
													spread_product = Shelf.SpreadItem;
												}
											}
										}
									});
								}
							});
							if (shelf_ind !== -1) {
								var collide_error = "N";
								var item_details = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo;
								$.each(item_details, function (i, items) {
									var item_start = items.Itemx - items.W / 2;
									var item_end = items.X + items.W / 2;
									if (newX > item_start && newX < item_end) {
										collide_error = "Y";
										return false;
									}
								});

								if (newX > g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].X - g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].W / 2 && newX < g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].X + g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].W / 2) {
									if (collide_error == "N") {
										var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(parseInt(p_model.getValue(record, "SHELF_OBJID")));
										g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].X = newX;
										g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].Y = newY;
										g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].Z = newZ;
										g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].X = newX;
										g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].Y = newY;
										g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].Z = newZ;
										var ItemInfo = g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index];

										if (upd_item_index == 0) {
											g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo.splice(upd_item_index, upd_item_index + 1);
										} else {
											g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo.splice(upd_item_index, 1);
										}

										if (mod_ind !== upd_mod_ind) {
											ShelfInfo = g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind];
											if (upd_shelf_index == 0) {
												g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo.splice(upd_shelf_index, upd_shelf_index + 1);
											} else {
												g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo.splice(upd_shelf_index, 1);
											}
											g_pog_json[p_pog_index].ModuleInfo[mod_ind].push(ShelfInfo);
										}

										var item_info = g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index];
										var [new_item_index, bottom_item_ind, bottom_item_flag] = get_nearest_item(mod_ind, shelf_ind, newX, upd_item_index, "Y", -1, g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].W, g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].D, g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].Fixed, g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].CapStyle, g_pog_json[p_pog_index].ModuleInfo[old_mod_index].ShelfInfo[old_shelf_ind].H, "B", mod_ind, shelf_ind, item_info, p_pog_index);

										var l_edited_item_index = set_item_after_drag(new_object_type, spread_product, mod_ind, shelf_ind, new_item_index, ItemInfo, p_pog_index);

										selectedObject.position.set(newX, newY, 0.001 + g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].D / 1000);
										l_valid = "Y"; //Bug-26122 - splitting the chest
									} else {
										alert(get_message("COLLIDE_X_AXIS"));
									}
								} else {
									alert(get_message("X_AXIS_ERROR"));
								}
							} else {
								alert(get_message("Y_AXIS_ERROR"));
							}
						} else {
							if (newX > g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].W / 2 && newX < g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].X + g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].H / 2) {
								var collide_error = "N";
								var item_details = g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo;
								$.each(item_details, function (i, items) {
									var item_start = items.Itemx - items.W / 2;
									var item_end = items.X + items.W / 2;
									if (newX > item_start && newX < item_end && i !== upd_item_index) {
										collide_error = "Y";
										return false;
									}
								});

								if (collide_error == "N") {
									g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].X = newX;
									g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].Y = newY;
									g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].ItemInfo[upd_item_index].Z = newZ;
									var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(parseInt(p_model.getValue(record, "SHELF_OBJID")));
									selectedObject.position.set(newX, newY, 0.001 + g_pog_json[p_pog_index].ModuleInfo[upd_mod_ind].ShelfInfo[upd_shelf_index].D / 1000);
								} else {
									alert(get_message("COLLIDE_X_AXIS"));
								}
							} else {
								alert(get_message("X_AXIS_ERROR"));
							}
						}
					} else {
						var items_arr = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo;
						$.each(items_arr, function (i, items) {
							items.X = items.OldX;
							items.Y = items.OldY;
							items.Z = items.OldZ;
						});
						console.log(" newx ", g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Shelf, newX, newY, newZ, parseInt(p_model.getValue(record, "MODULE_INDEX")), parseInt(p_model.getValue(record, "SHELF_INDEX")));
						var returnval = update_edit_location(newX, newY, newZ, parseInt(p_model.getValue(record, "MODULE_INDEX")), parseInt(p_model.getValue(record, "SHELF_INDEX")), 0, "N", p_camera, p_pog_index,"N");
					}
				}
				if (l_valid == "Y" && g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
					//Bug-26122 - splitting the chest)
					g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ChestEdit = "Y";
				}

				async function reset_combine() {
					if (p_model.getValue(record, "OBJECT_TYPE") == "SHELF") {
						await generateCombinedShelfs(p_pog_index, mod_ind, shelf_ind, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,ASA-1353
					}
				}
				reset_combine();
			});
			//recreate the orientation view if any present
			async function recreate_view() {
				await recreate_compare_views(g_compare_view, "N");
			}
			recreate_view();
			if (g_show_notch_label == "Y") {
				show_notch_labels("Y", $v("P25_NOTCH_HEAD"), "N", p_pog_index);
			}
			resolve("SUCCESS");
			logDebug("function : fixel_update", "E");
		});
	} catch (err) {
		error_handling(err);
	}
}

//X button on the right corner of screen will navigate back.
function nav_back() {
	logDebug("function : nav_back", "S");
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
		//Task_29818 - Start
		// ax_message.set({
		//     labels: {
		//         ok: get_message("SHCT_YES"),
		//         cancel: get_message("SHCT_NO"),
		//     },
		// });

		// ax_message.set({
		//     buttonReverse: true,
		// });

		// ax_message.confirm(get_message("POGCR_CHANGE_REVERT_WARN"), function (e) {
		//     if (e) {
		//         sessionStorage.removeItem("POGJSON");
		//         sessionStorage.setItem("POGExists", "N");
		//         back_clicked = "Y";
		//         apex.navigation.redirect("f?p=" + $v("pFlowId") + ":161:" + $v("pInstance") + ":::");
		//     }
		// });

		confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
			sessionStorage.removeItem("POGJSON");
			sessionStorage.setItem("POGExists", "N");
			back_clicked = "Y";
			apex.navigation.redirect("f?p=" + $v("pFlowId") + ":161:" + $v("pInstance") + ":::");
		});
		//Task_29818 - End
		logDebug("function : nav_back", "E");
	} else {
		sessionStorage.removeItem("POGJSON");
		sessionStorage.setItem("POGExists", "N");
		back_clicked = "Y";
		apex.navigation.redirect("f?p=" + $v("pFlowId") + ":161:" + $v("pInstance") + ":::");
	}
}

//this function is called in update spread_product_final. to set X,Y based on new spread product select from context menu.
function set_item_xy(p_shelf_info, p_module_index, p_shelf_index, p_pog_index) {
	logDebug("function : set_item_xy; shelf_info : " + p_shelf_info + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
	return new Promise(function (resolve, reject) {
		if (p_shelf_info.SpreadItem !== "R") {
			$.each(p_shelf_info.ItemInfo, function (k, item_arr) {
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].OldItemX = item_arr.X;
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].OldItemY = item_arr.Y;
				var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, p_shelf_info.ObjType, -1, p_shelf_info.HorizGap, p_shelf_info.SpreadItem, p_shelf_info.HorizGap, p_module_index, p_shelf_index, k, "Y", p_shelf_info.ItemInfo.length, "N", p_pog_index);
				var [itemx, itemy] = get_item_xy(p_shelf_info, item_arr, item_arr.W, item_arr.H, p_pog_index);
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].Y = itemy;
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].X = new_x;
			});
		} else {
			var item_arr = p_shelf_info.ItemInfo;
			for (var k = item_arr.length - 1; k >= 0; k--) {
				var new_x = get_item_xaxis(item_arr[k].W, item_arr[k].H, item_arr[k].D, p_shelf_info.ObjType, -1, p_shelf_info.HorizGap, p_shelf_info.SpreadItem, p_shelf_info.HorizGap, p_module_index, p_shelf_index, k, "Y", p_shelf_info.ItemInfo.length, "N", p_pog_index);
				var [itemx, itemy] = get_item_xy(p_shelf_info, item_arr[k], item_arr[k].W, item_arr[k].H, p_pog_index);
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].OldItemX = item_arr[k].X;
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].OldItemY = item_arr[k].Y;
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].Y = itemy;
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].X = new_x;
			}
		}
		resolve("SUCCESS");
		logDebug("function : set_item_xy", "E");
	});
}

function update_spread_product(p_spread_type) {
	logDebug("function : update_spread_product; spread_type : " + p_spread_type, "S");
	var new_pogjson = get_canvas_json("LABEL");
	var new_world = get_canvas_world("LABEL");
	update_spread_product_final(p_spread_type, g_module_index, g_shelf_index, g_pog_index);
	logDebug("function : update_spread_product", "E");
}

//this function is called from context menu spread product. it can be multi select or single select.
async function update_spread_product_final(p_spread_type, p_module_index, p_shelf_index, p_pog_index) {
	logDebug("function : update_spread_product_final; spread_type : " + p_spread_type + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
	if (g_keyCode == 89 || g_keyCode == 90) {
	} else {
		g_redo_all_obj_arr = [];
		g_redo_final_obj_arr = [];
		undoType = "U";
		g_undoRedoAction = "REDO";
	}
	var finalAction;
	if (g_undoRedoAction == "REDO") {
		finalAction = "U";
	} else {
		finalAction = "R";
	}
	try {
         
		//identify if any change in POG
		g_pog_edited_ind = "Y";
		//here for multi select or single select. we reset the items with new spread product and recreate the shelfs.
		if (g_multiselect == "N") {
			g_undo_details = [];
			g_undo_obj_arr = [];
			g_undo_supp_obj_arr = [];
			var undoObjectsInfo = [];
			var g_deletedItems = [];
			var item_width_arr = [],
				item_index_arr = [];
			var objectID = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
			var shelf_top = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2);
			var l_edited_item_index = 0;
			undoObjectsInfo.moduleIndex = p_module_index;
			undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
			undoObjectsInfo.shelfIndex = p_shelf_index;
			undoObjectsInfo.actionType = "ITEM_DELETE";
			undoObjectsInfo.startCanvas = g_start_canvas;
			undoObjectsInfo.objectID = objectID;
			undoObjectsInfo.g_deletedItems = g_deletedItems;
			undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[p_module_index].MObjID;
			undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index])));
			g_allUndoObjectsInfo.push(undoObjectsInfo);
			logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
			g_allUndoObjectsInfo = [];
			if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "SHELF" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "HANGINGBAR") {
				var old_spread = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
				var old_comb_spread = -1;
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem = p_spread_type;
				[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf);
				if (currShelfCombIndx == 0) {
					//Task_26627
					old_comb_spread = g_combinedShelfs[currCombinationIndex].SpreadItem;
					g_combinedShelfs[currCombinationIndex].SpreadItem = p_spread_type;
				}

				var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
				$.each(items_arr, function (i, items) {
					if (old_spread == "F" || items.CrushHoriz > 0) {
						g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].W = items.RW;
					}
					item_width_arr.push(wpdSetFixed(items.W));
					l_edited_item_index = i;
					item_index_arr.push(l_edited_item_index);
				});
				$.each(items_arr, function (i, items) {
					if (wpdSetFixed(items.Y - items.H / 2) == shelf_top) {
						item_width_arr.push(wpdSetFixed(items.W));
					}
				});
				if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "HANGINGBAR") {
					await crushItem(p_pog_index, p_module_index, p_shelf_index, l_edited_item_index, "W", "Y", -1, -1); //ASA-1970 Issue2
					if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
						var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
						var returnval = await set_item_xy(shelfs, p_module_index, p_shelf_index, p_pog_index);
						var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
						var validate_passed = validate_shelf_min_distance(p_module_index, p_shelf_index, shelfs.Y, items_arr, shelfs.AllowAutoCrush, p_module_index, shelfs.X, "Y", shelfs, p_pog_index);
						if (validate_passed == "Y" || validate_passed == "R") {
							recreate_all_items(p_module_index, p_shelf_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
						} else {
							g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem = old_spread;
							$.each(shelfs.ItemInfo, function (k, item_arr) {
								g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].X = item_arr.OldItemX;
								g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].Y = item_arr.OldItemY;
							});
							if (old_comb_spread > -1) {
								g_combinedShelfs[currCombinationIndex].SpreadItem = old_comb_spread;
							}
						}
					}
				} else {
					await crushItem(p_pog_index, p_module_index, p_shelf_index, l_edited_item_index, "W", "Y", -1, -1);
					//  await auto_crush_items(item_width_arr, item_index_arr, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType, p_module_index, p_shelf_index, l_edited_item_index, p_pog_index, "N", "Y"); //ASA-1079
					if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
						var return_val = recreate_all_items(p_module_index, p_shelf_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
					}
				}

				if (items_arr.length > 0) {
					//capture the module is edit or not to create changed text box
					g_pog_json[p_pog_index].ModuleInfo[p_module_index].EditFlag = "Y";
				}
			}
		} else {
			g_undo_details = [];
			g_undo_obj_arr = [];
			g_undo_supp_obj_arr = [];
			//if multi select g_delete_details will be holding the list of shelfs selected.
			for (const objects of g_delete_details) {
				if (objects.Object == "SHELF" && (objects.ObjType == "SHELF" || objects.ObjType == "HANGINGBAR") && objects.Item != "DIVIDER") {
					//ASA-1579 #2
					var undoObjectsInfo = [];
					var g_deletedItems = [];
					var objectID = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SObjID; //ASA-1361  g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
					undoObjectsInfo.moduleIndex = p_module_index;
					undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Module; //ASA-1361g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
					undoObjectsInfo.shelfIndex = p_shelf_index;
					undoObjectsInfo.actionType = "ITEM_DELETE";
					undoObjectsInfo.startCanvas = g_start_canvas;
					undoObjectsInfo.objectID = objectID;
					undoObjectsInfo.g_deletedItems = g_deletedItems;
					undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].MObjID; //ASA-1361 g_pog_json[p_pog_index].ModuleInfo[p_module_index].MObjID;
					undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex]))); //ASA-1361 g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index]
					g_allUndoObjectsInfo.push(undoObjectsInfo);
					logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
					g_allUndoObjectsInfo = [];
					items_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                    var old_spread = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SpreadItem; // ASA-2041 issue 1 (R)
					$.each(items_arr, function (i, items) {
						g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[i].W = items.RW;
					});
					g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SpreadItem = p_spread_type;
					var old_comb_spread = -1;
					g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SpreadItem = p_spread_type;
					[currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf);
					// if (currCombinationIndex == 0) {
                    if (currCombinationIndex !== -1 && currShelfCombIndx !== -1 && typeof g_combinedShelfs[currCombinationIndex] !== "undefined") { // ASA-2041 issue 1 (R)
						old_comb_spread = g_combinedShelfs[currCombinationIndex].SpreadItem;
						g_combinedShelfs[currCombinationIndex].SpreadItem = p_spread_type;
                        g_combinedShelfs[currCombinationIndex][currShelfCombIndx].SpreadItem = p_spread_type; // ASA-2041 issue 1 (R)

					}

					if (g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType == "HANGINGBAR") {
						if (reorder_items(objects.MIndex, objects.SIndex, p_pog_index)) {
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];

							var returnval = await set_item_xy(shelfs, objects.MIndex, objects.SIndex, p_pog_index);

							var items_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
							var validate_passed = validate_shelf_min_distance(objects.MIndex, objects.SIndex, shelfs.Y, items_arr, shelfs.AllowAutoCrush, objects.MIndex, shelfs.X, "Y", shelfs, p_pog_index);
							if (validate_passed == "Y" || validate_passed == "R") {
								await recreate_all_items(objects.MIndex, objects.SIndex, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters   //ASA-1681 added await
							} else {
								g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SpreadItem = old_spread;
								$.each(shelfs.ItemInfo, function (k, item_arr) {
									g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[k].X = item_arr.OldItemX;
									g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[k].Y = item_arr.OldItemY;
								});
                                if (old_comb_spread > -1) { // ASA-2041 issue 1 (R) 
									g_combinedShelfs[currCombinationIndex].SpreadItem = old_comb_spread;
								} // ASA-2041 issue 1 (R)
								break;
							}
						}
					} else {
						if (reorder_items(objects.MIndex, objects.SIndex, p_pog_index)) {
							var return_val = await recreate_all_items(objects.MIndex, objects.SIndex, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters  //ASA-1681 added await
						}
						if (items_arr.length > 0) {
							//capture the module is edit or not to create changed text box
							g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].EditFlag = "Y";
						}
					}
				}
			}
			g_mselect_drag = "N";
			g_delete_details = [];
			g_multi_drag_shelf_arr = [];
			g_multi_drag_item_arr = [];
			g_multiselect = "N";
		}
		render(p_pog_index);
		if (g_show_live_image == "Y") {
			animate_all_pog();
		}

		//recreate the orientation view if any present
		async function recreate_view() {
			var returnval = await recreate_compare_views(g_compare_view, "N");
		}
		recreate_view();
		logDebug("function : update_spread_product_final", "E");
	} catch (err) {
		error_handling(err);
	}
   
}

function open_edit_facings() {
	logDebug("function : open_edit_facings", "S");
	g_module_index = g_incre_mod_index;
	g_shelf_index = g_incre_shelf_index;
	g_item_index = g_incre_item_index;
	$s("P25_HORIZ_FACING", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BHoriz);
	$s("P25_VERT_FACING", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BVert);
	$s("P25_DEPTH_FACING", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BaseD);

	openInlineDialog("edit_facings", 25, 20);
	g_dblclick_opened = "Y";
	logDebug("function : open_edit_facings", "E");
}

//this function is called both increment or decrement facings using context menu.
async function update_item_facings(p_module_index, p_shelf_index, p_item_index, p_horiz_facing, p_vert_facing, p_depth_facing, p_fieldName, p_close_modal, p_recreate, p_pog_index, p_set_facing = "Y", p_decrement_value = "N") { //ASA-1858 Issue 2 Added new parameter p_decrement_value 
	logDebug("function : update_item_facings; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; horiz_facing : " + p_horiz_facing + "; vert_facing : " + p_vert_facing + "; depth_facing : " + p_depth_facing + "; fieldName : " + p_fieldName + "; close_modal : " + p_close_modal + "; recreate : " + p_recreate, "S");
	if (g_keyCode == 89 || g_keyCode == 90) {
	} else {
		g_redo_all_obj_arr = [];
		g_redo_final_obj_arr = [];
		undoType = "U";
		g_undoRedoAction = "REDO";
	}
	var finalAction;
	if (g_undoRedoAction == "REDO") {
		finalAction = "U";
	} else {
		finalAction = "R";
	}
	try {
		g_pog_edited_ind = "Y";
		var item_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
		var old_horiz_facing = item_dtl.OldItemBaseHoriz;
		var old_vert_facing = item_dtl.OldItemBaseVert;
		var old_depth_facing = item_dtl.OldItemBaseDepth;
		var items = item_dtl;
		var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
		var objectID = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
		var remarks = "";
		if (typeof item_dtl.Remarks != "undefined") {
			remarks = item_dtl.Remarks;
		}
		var [select_width, select_height, select_depth] = get_select_dim(items);
		//set the RW to the W because spread product facings will have a gap between each facing based on item gap. we need to revert it for processing.
		if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem == "F") {
			items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
			$.each(items_arr, function (i, item_info) {
				item_info.W = item_info.RW;
			});
		}
		items.Exists = "N";
		var old_horiz_facing = item_dtl.BHoriz, //Task_27720
			old_vert_facing = item_dtl.BVert, //Task_27720
			old_depth_facing = item_dtl.BaseD; //Task_27720
		item_dtl.BHoriz = p_horiz_facing; //ASA-1398 issue 4-s
		item_dtl.BVert = p_vert_facing;
		item_dtl.BaseD = p_depth_facing; //ASA-1398 issue 4-E
		//this function will set the new dim and facing and try to crush, cap and validate the item. if pass will send back dim else send as ERROR.
		const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(p_module_index, p_shelf_index, p_item_index, select_width, select_height, select_depth, items.ItemNesting, items.NVal, p_horiz_facing, p_vert_facing, p_depth_facing, items.Orientation, items.OrgCWPerc, items.OrgCHPerc, items.OrgCDPerc, "N", "Y", "Y", p_pog_index, p_set_facing, p_decrement_value);  //ASA-1858 Issue 2

		if (item_width !== "ERROR") {
			//If the edited item is a top/bottom item and depth facing is increased and now depth of that item is greater then below or top item throw error.
			if (p_fieldName == "depthfacing" && typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
				var bottom_index = get_shelf_item_ind(p_module_index, p_shelf_index, items.BottomObjID, p_pog_index);
				if (item_depth > g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[bottom_index].D) {
					alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf));
					return false;
				}
			} else if (p_fieldName == "depthfacing" && typeof items.TopObjID !== "undefined" && items.TopObjID !== "") {
				var top_index = get_shelf_item_ind(p_module_index, p_shelf_index, items.TopObjID, p_pog_index);
				if (item_depth < g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[top_index].D) {
					alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf));
					return false;
				}
			}
			var [itemx, itemy] = get_item_xy(shelfs, items, item_width, item_height, p_pog_index);
			// item_dtl.X = itemx; //Regression issue 13 comment beacuse x is set to previous item x and we didnot change the previous item x and reset_top_bottom_objects function has set wrong Y
			item_dtl.Y = itemy;
			item_dtl.Exists = "E";
			item_dtl.W = item_width;
			item_dtl.H = item_height;
			item_dtl.D = item_depth;
			item_dtl.RW = real_width;
			item_dtl.RH = real_height;
			item_dtl.RD = real_depth;
			item_dtl.DfacingUpd = "Y";
			item_dtl.OldItemBaseHoriz = p_horiz_facing;
			item_dtl.OldItemBaseVert = p_vert_facing;
			item_dtl.OldItemBaseDepth = p_depth_facing;
			var items = item_dtl;
			update_top_bottom_xy(p_module_index, p_shelf_index, p_item_index, items, p_pog_index);
			//async function dosomething() {
			//if horiz and vert facings change then recreate the shelf.
			if (p_fieldName !== "depthfacing" && p_recreate == "Y") {
				if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
					var return_txt = await recreate_all_items(p_module_index, p_shelf_index, g_shelf_object_type, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
				}
			} else if (p_fieldName == "depthfacing") {
				var selectObjects = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
				if (typeof selectObjects !== "undefined") {
					selectObjects.DFacing = p_depth_facing;
				}
			}
			var selectobj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
			if (p_close_modal) {
				g_dblclick_opened = "N";
				closeInlineDialog("edit_facings");
			}
			//recreate the orientation view if any present
			await recreate_compare_views(g_compare_view, "N");
			logDebug("function : update_item_facings", "E");
			return true;
		} else {
			var item_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index]; //Task_27720
			item_dtl.BHoriz = old_horiz_facing; //Task_27720
			item_dtl.BVert = old_vert_facing; //Task_27720
			item_dtl.BaseD = old_depth_facing; //Task_27720
			logDebug("function : update_item_facings", "E");
			return false;
		}
	} catch (err) {
		error_handling(err);
	}
}

function update_top_bottom_xy(p_module_index, p_shelf_index, p_item_index, p_items, p_pog_index) {
	logDebug("function : update_top_bottom_xy; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index, "S");
	if ((typeof p_items.BottomObjID !== "undefined" && p_items.BottomObjID !== "") || (typeof p_items.TopObjID !== "undefined" && p_items.TopObjID !== "")) {
		items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
		$.each(items_arr, function (i, item_info) {
			var new_y = -1;
			if (wpdSetFixed(p_items.X) == wpdSetFixed(item_info.X) && item_info.Y > new_y && typeof item_info.TopObjID !== "undefined" && item_info.TopObjID !== "") {
				var top_index = get_shelf_item_ind(p_module_index, p_shelf_index, item_info.TopObjID, p_pog_index);
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[top_index].Y = wpdSetFixed(item_info.Y + item_info.H / 2 + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[top_index].H / 2);
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[top_index].X = wpdSetFixed(item_info.X);
				new_y = wpdSetFixed(item_info.Y);
			}
		});
	}
	logDebug("function : update_top_bottom_xy", "E");
}

//this function is called when increasing the value in edit facings
async function incrementValue(p_event, p_facingType, p_facingNo) {
	logDebug("function : incrementValue; facingType : " + p_facingType + "; facingNo : " + p_facingNo, "S");
	console.log(" start", p_event, p_facingType, p_facingNo);
	var fieldName;
	var currentVal = -1;
	//if using shortcut shift + V/H + [1-9] (called from incrementFacingsFromKey) then we will get p_facingtype. if not we can get the number from the context menu where user
	//press + button.
	if (typeof p_facingType == "undefined") {
		p_event.preventDefault();
		var fieldName = $(p_event.target).data("field");
		console.log("flname ", fieldName, $(p_event.target).data("field"));
		var currentVal = -1;
		var parent = $(p_event.target).closest("div");
		console.log("parent", parent, $(p_event.target));
		if (typeof fieldName == "undefined") {
			fieldName = "horizfacing";
			currentVal = parseInt(parent.find("input[name=" + fieldName + "]").val(), 10);
		} else {
			currentVal = parseInt(parent.find("input[name=" + fieldName + "]").val(), 10) + 1;
		}
	} else {
		fieldName = p_facingType;
		currentVal = p_facingNo;
		g_incre_mod_index = g_module_index;
		g_incre_shelf_index = g_shelf_index;
		g_incre_item_index = g_item_index;
		console.log("else ", fieldName, currentVal, g_incre_mod_index, g_incre_shelf_index, g_incre_item_index);
	}
	var horiz_facing = 0,
		vert_facing = 0,
		depth_facing = 0;
	g_prev_undo_action = "FACING_CHANGE";
	g_undo_obj_arr = [];
	g_undo_details = [];
	var item_err = []; //ASA-1450
	var l_error_item = "N"; //ASA-1450
	var ItemsDel = [];
	var mindex = -1,
		sindex = -1; //ASA-1258
	var i = 0;
	var l_module = -1; //Bug_26027 kush
	if (g_delete_details.length > 0) {
		for (const det of g_delete_details) {
			if (l_module !== det.MIndex && det.SIndex == sindex && det.Object == "ITEM") {
				//Bug_26027 kush
				sindex = -1;
			}
			if (mindex !== det.MIndex && det.SIndex !== sindex && det.Object == "ITEM") {
				//ASA-1258
				var objectID = g_pog_json[g_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].SObjID;
				var undoObjectsInfo = [];
				undoObjectsInfo.moduleIndex = det.MIndex;
				undoObjectsInfo.module = g_pog_json[g_pog_index].ModuleInfo[det.MIndex].Module;
				undoObjectsInfo.shelfIndex = det.SIndex;
				undoObjectsInfo.actionType = "ITEM_DELETE";
				undoObjectsInfo.startCanvas = g_start_canvas;
				undoObjectsInfo.objectID = objectID;
				undoObjectsInfo.g_deletedItems = ItemsDel;
				undoObjectsInfo.moduleObjectID = g_pog_json[g_pog_index].ModuleInfo[det.MIndex].MObjID;
				undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[g_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex])));
				var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[g_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].ItemInfo));
				g_allUndoObjectsInfo.push(undoObjectsInfo);
				mindex = det.MIndex; //ASA-1258
				sindex = det.SIndex; //ASA-1258
				l_module = det.MIndex;

				if (mindex == det.MIndex) {
					//ASA-1258
					mindex = -1;
				}
			}
			i++;
		}
	} else {
		var objectID = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].SObjID;
		var undoObjectsInfo = [];
		undoObjectsInfo.moduleIndex = g_incre_mod_index;
		undoObjectsInfo.module = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].Module;
		undoObjectsInfo.shelfIndex = g_incre_shelf_index;
		undoObjectsInfo.actionType = "ITEM_DELETE";
		undoObjectsInfo.startCanvas = g_start_canvas;
		undoObjectsInfo.objectID = objectID;
		undoObjectsInfo.g_deletedItems = ItemsDel;
		undoObjectsInfo.moduleObjectID = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].MObjID;
		undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index])));
		var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo));
		g_allUndoObjectsInfo.push(undoObjectsInfo);
	}
	if (g_delete_details.length == 0 || typeof g_delete_details == "undefined") {
		var item_inx_dtl = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index];
		console.log("g_incre_shelf_index", g_incre_mod_index, g_incre_shelf_index, g_incre_item_index);
		console.log("item_inx_dtl", item_inx_dtl, fieldName);
		if (!isNaN(currentVal)) {
			if (fieldName == "horizfacing") {
				horiz_facing = currentVal;
				vert_facing = item_inx_dtl.BVert;
				depth_facing = item_inx_dtl.BaseD;
			} else if (fieldName == "vertfacing") {
				horiz_facing = item_inx_dtl.BHoriz;
				if (item_inx_dtl.CapStyle !== 3) {
					vert_facing = currentVal;
				} else {
					vert_facing = 1;
				}
				depth_facing = item_inx_dtl.BaseD;
			} else {
				horiz_facing = item_inx_dtl.BHoriz;
				vert_facing = item_inx_dtl.BVert;
				depth_facing = currentVal;
			}
			if (item_inx_dtl.CapStyle == 3 && fieldName == "vertfacing") {
				//console.log('capstyle');
			} else {
				//console.log('increment values00', currentVal);
				if (typeof p_facingType == "undefined") {
					parent.find("input[name=" + fieldName + "]").val(currentVal);
				}
				var items = item_inx_dtl;
				//ASA-1408 -S
				var l_max_hfacing = nvl(items.MPogHorizFacings) > 0 ? items.MPogHorizFacings : items.MHorizFacings;
				var l_max_vfacing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings;
				var l_max_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings;
				//ASA-1408 -E

				if ((fieldName == "horizfacing" && horiz_facing > l_max_hfacing && l_max_hfacing > -1) || (fieldName == "vertfacing" && vert_facing > l_max_vfacing && l_max_vfacing > -1) || (fieldName == "depthfacing" && depth_facing > l_max_dfacing && l_max_dfacing > -1)) {
					//ASA-1408
					//ASA-874
					alert(get_message("POGCR_MAX_FACING_REACH"));
				} else {
					console.log("horiz_facing", horiz_facing, vert_facing, depth_facing);
					if (await update_item_facings(g_incre_mod_index, g_incre_shelf_index, g_incre_item_index, horiz_facing, vert_facing, depth_facing, fieldName, false, "Y", g_pog_index, "N")) {
						// regression 13 adding await because function is not waiting  and below code give error
						if (fieldName == "depthfacing") {
							update_cap_depth(items, g_incre_mod_index, g_incre_shelf_index, g_incre_item_index, g_pog_index); //ASA-1273 Prasanna
						}
						if (fieldName == "horizfacing" || fieldName == "depthfacing") {
							var res = await calculateFixelAndSupplyDays("N", g_pog_index);
						}
					}
				}
			}
		} else {
			if (typeof p_facingType == "undefined") {
				parent.find("input[name=" + fieldName + "]").val(1);
			}
		}
		var selectedobj = g_scene_objects[g_pog_index].scene.children[2].getObjectById(item_inx_dtl.ObjID);
		var item_info = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index];
		var cap_capacity = item_info.CapFacing * item_info.CapDepth * item_info.CapHorz; //ASA-1273 Prasanna
		selectedobj.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
		item_info.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1398 issue 4 //Task_27720 found existing issue. giving error as this variable is not declared
		g_intersected.push(selectedobj); //ASA-1107
	} else {
		g_mselect_drag = "N";
		g_multiselect = "N";
		var lookup = {};
		var items = g_delete_details;
		var UniqueID = [];
		var details_arr = [];

		for (var item, i = 0; (item = items[i++]); ) {
			if (item.Object == "ITEM") {
				var name = "abc";
				name = item.SIndex + "-" + item.MIndex;
				if (!(name in lookup)) {
					lookup[name] = 1;
					UniqueID.push(name);
					var details = {};
					details["SIndex"] = item.SIndex;
					details["MIndex"] = item.MIndex;
					details["ObjType"] = item.ObjType;
					details_arr.push(details);
				}
			}
		}
		var error_log = "N";
		var shelf_obj, shelf_name; //ASA-1327
		g_combineItemModf = []; //ASA-1327 blinking to capture current item
		for (const objects of g_delete_details) {
			if (objects.Object == "ITEM") {
				var item_obj_dtl = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex];
				var horiz_facing = (vert_facing = depth_facing = 1);
				var facing_error = "";
				shelf_obj = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType; //ASA-1327
				shelf_name = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf;
				//get the type of facing and add the value to current value.
				if (typeof p_facingType == "undefined") {
					if (fieldName == "horizfacing") {
						facing_error = "Horizontal";
						horiz_facing = item_obj_dtl.BHoriz + 1;
						vert_facing = item_obj_dtl.BVert;
						depth_facing = item_obj_dtl.BaseD;
					} else if (fieldName == "vertfacing") {
						facing_error = "Vertical";
						horiz_facing = item_obj_dtl.BHoriz;
						if (item_obj_dtl.CapStyle !== 3) {
							vert_facing = item_obj_dtl.BVert + 1;
						} else {
							vert_facing = 1;
						}
						depth_facing = item_obj_dtl.BaseD;
					} else {
						facing_error = "Depth";
						horiz_facing = item_obj_dtl.BHoriz;
						vert_facing = item_obj_dtl.BVert;
						depth_facing = item_obj_dtl.BaseD + 1;
					}
				} else {
					if (p_facingType == "horizfacing") {
						facing_error = "Horizontal";
						horiz_facing = p_facingNo;
						vert_facing = item_obj_dtl.BVert;
						depth_facing = item_obj_dtl.BaseD;
					} else if (p_facingType == "vertfacing") {
						facing_error = "Vertical";
						vert_facing = p_facingNo;
						horiz_facing = item_obj_dtl.BHoriz;
						depth_facing = item_obj_dtl.BaseD;
					} else if (p_facingType == "depthfacing") {
						facing_error = "Depth";
						depth_facing = p_facingNo;
						vert_facing = item_obj_dtl.BVert;
						horiz_facing = item_obj_dtl.BHoriz;
					}
				}
				//when capstyle 3 (max cap) we don't allow to increase vertical facings. because when setting cap. we set vert facing to 1.
				if (item_obj_dtl.CapStyle == 3 && fieldName == "vertfacing") {
					//console.log('capstyle');
				} else {
					if (typeof parent !== "undefined") {
						parent.find("input[name=" + fieldName + "]").val(currentVal);
					}
					var items = item_obj_dtl;
					//ASA-1408 -S
					var l_max_hfacing = nvl(items.MPogHorizFacings) > 0 ? items.MPogHorizFacings : items.MHorizFacings;
					var l_max_vfacing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings;
					var l_max_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings;
					//ASA-1408 -E
					//if the added facing is more the max facing from BU. then throw error.
					if ((fieldName == "horizfacing" && horiz_facing > l_max_hfacing && l_max_hfacing > -1) || (fieldName == "vertfacing" && vert_facing > l_max_vfacing && l_max_vfacing > -1) || (fieldName == "depthfacing" && depth_facing > l_max_dfacing && l_max_dfacing > -1)) {
						//ASA-1408
						//ASA-874
						item_err.push(items.Item); //ASA-1450 S
						l_error_item = "Y";
						if (g_delete_details.length == 1) {
							l_error_item = "N";
							alert(get_message("POGCR_MAX_FACING_REACH"));
							break;
						} //ASA-1450 E
					} else {
						var info = {};
						info["NewMIndex"] = objects.MIndex; //ASA-1327
						info["NewSIndex"] = objects.SIndex;
						info["OldMIndex"] = objects.MIndex;
						info["OldSIndex"] = objects.SIndex;
						info["OldIIndex"] = objects.IIndex;
						info["OldObjID"] = item_obj_dtl.ObjID;
						g_combineItemModf.push(info);
						//ASA-1165
						var retval = await update_item_facings(objects.MIndex, objects.SIndex, objects.IIndex, horiz_facing, vert_facing, depth_facing, fieldName, false, "N", g_pog_index, "N");
						if (!retval) {
							error_log = "Y";
						} else {
							update_cap_depth(items, objects.MIndex, objects.SIndex, objects.IIndex, g_pog_index); //ASA-1273 Prasanna
							console.log("success incrment");
						}
					}
				}
				var item_info = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex]; //ASA-1398 ISSUE 3-S
				var selectedobj = g_scene_objects[g_pog_index].scene.children[2].getObjectById(item_info.ObjID);
				var cap_capacity = item_info.CapFacing * item_info.CapDepth * item_info.CapHorz; //ASA-1273 Prasanna
				selectedobj.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1398 ISSUE 3-E
				item_info.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1398 issue 4 //ASA-1398 issue 4 //Task_27720 found existing issue. giving error as this variable is not declared
			}
		}
		if (l_error_item == "Y") {
			//ASA-1450
			alert(get_message("POGCR_MAX_FACING_REACH") + " " + item_err);
		}
		if (error_log == "Y") {
			if (g_error_category == "W") {
				//ASA-1327
				facing_error = "Horizontal";
			} else if (g_error_category == "H") {
				facing_error = "Vertical";
			} else if (g_error_category == "D") {
				facing_error = "Depth";
			}
			if (shelf_obj == "CHEST" && g_chest_as_pegboard == "Y") {
				alert(get_message("POGC_CHEST_SPACE_VALID", shelf_name));
			} else {
				alert(get_message("INCREMENT_ERROR", facing_error));
			}
			document.getElementById("context-menu").classList.remove("active"); //Task_27720
		} else {
			//Task_27720
			for (const details of details_arr) {
				if (reorder_items(details.MIndex, details.SIndex, g_pog_index)) {
					if (details.ObjType == "SHELF" || details.ObjType == "PALLET") {
						var returnval = reset_top_bottom_objects(details.MIndex, details.SIndex, "N", g_pog_index);
					}
					return_val = await recreate_all_items(details.MIndex, details.SIndex, details.ObjType, "Y", -1, -1, g_pog_json[g_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", g_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
				}
			}
		} //Task_27720

		if (error_log == "N") {
			//Task_27720
			for (const objects of g_delete_details) {
				//ASA-1107
				g_intersected = [];
				if (objects.Object == "ITEM") {
					var l_edited_item_index = -1; //ASA-1327 after items are rearranged. its getting wrong item for blink
					var modfIndx = -1;
					if (g_combineItemModf.length > 0) {
						for (var mf = 0; mf < g_combineItemModf.length; mf++) {
							if (g_combineItemModf[mf].OldMIndex == objects.MIndex && g_combineItemModf[mf].OldSIndex == objects.SIndex) {
								modfIndx = mf;
								break;
							}
						}
					}
					var checkShelf = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex]; //ASA-1327
					var item_details = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
					if (checkShelf.ObjType !== "PEGBOARD" && !(checkShelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
						//ASA-1327
						var sorto = {
							X: "asc",
							Y: "asc",
						};
						item_details.keySort(sorto);
					}

					if (modfIndx !== -1) {
						var itemIndex = 0;
						for (item of item_details) {
							if (item.ObjID == g_combineItemModf[modfIndx].NewObjID) {
								l_edited_item_index = itemIndex;
							}
							itemIndex++;
						}
					}
					var iteminfo = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex]; //ASA-1398 issue 4 l_edited_item_index -->objects.IIndex
					var selectedobj = g_scene_objects[g_pog_index].scene.children[2].getObjectById(iteminfo.ObjID);
					var cap_capacity = iteminfo.CapFacing * iteminfo.CapDepth * iteminfo.CapHorz; //ASA-1273 Prasanna
					selectedobj.Cpct = iteminfo.BHoriz * iteminfo.BVert * iteminfo.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1273 Prasanna
					iteminfo.Cpct = iteminfo.BHoriz * iteminfo.BVert * iteminfo.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1398 issue 4
					g_intersected.push(selectedobj);
				}
			}

			if (g_allUndoObjectsInfo.length > 0) {
				logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
				g_allUndoObjectsInfo = [];
				//  g_delete_details = [];
			}
		}
		g_combineItemModf = []; //ASA-1327 blinking to capture current item //Task_27720
	}
	render_animate_selected(); //Task_27720
	logDebug("function : incrementValue", "E");
}
//this function is called when decreasing the value in edit facings
async function decrementValue(p_event) {
	logDebug("function : decrementValue", "S");
	p_event.preventDefault();
	var fieldName = $(p_event.target).data("field");
	var parent = $(p_event.target).closest("div");
	var currentVal = parseInt(parent.find("input[name=" + fieldName + "]").val(), 10);
	var horiz_facing = 0,
		vert_facing = 0,
		depth_facing = 0;
	g_prev_undo_action = "FACING_CHANGE";
	g_undo_obj_arr = [];
	g_undo_details = [];
	var item_err = []; //ASA-1450
	var l_error_item = "N"; //ASA-1450
	if (g_delete_details.length == 0 || typeof g_delete_details == "undefined") {
		if (!isNaN(currentVal) && currentVal > 1) {
			var item_inx_dtl = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index];
			parent.find("input[name=" + fieldName + "]").val(currentVal - 1);
			var facing_error = "";
			if (fieldName == "horizfacing") {
				var facing_error = "Horizontal";
				horiz_facing = currentVal - 1;
				vert_facing = item_inx_dtl.BVert;
				depth_facing = item_inx_dtl.BaseD;
			} else if (fieldName == "vertfacing") {
				var facing_error = "Vertical";
				horiz_facing = item_inx_dtl.BHoriz;
				vert_facing = currentVal - 1;
				depth_facing = item_inx_dtl.BaseD;
			} else {
				var facing_error = "Depth";
				horiz_facing = item_inx_dtl.BHoriz;
				vert_facing = item_inx_dtl.BVert;
				depth_facing = currentVal - 1;
			}
			if (item_inx_dtl.CapStyle == 3 && fieldName == "vertfacing") {
				//console.log('capstyle');
			} else {
				//ASA-1408-S
				var items = item_inx_dtl;
				var l_max_hfacing = nvl(items.MPogHorizFacings) > 0 ? items.MPogHorizFacings : items.MHorizFacings;
				var l_max_vfacing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings;
				var l_max_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings;
				//ASA-1408-E
				//if currently decremented value is more then max facings set then throw error.
				if ((fieldName == "horizfacing" && horiz_facing > l_max_hfacing && l_max_hfacing > -1) || (fieldName == "vertfacing" && vert_facing > l_max_vfacing && l_max_vfacing > -1) || (fieldName == "depthfacing" && depth_facing > l_max_dfacing && l_max_dfacing > -1)) {
					//ASA-1408
					//ASA-874
					alert(get_message("POGCR_MAX_FACING_REACH"));
				} else {
					//ASA-1165
					var retval = await update_item_facings(g_incre_mod_index, g_incre_shelf_index, g_incre_item_index, horiz_facing, vert_facing, depth_facing, fieldName, false, "Y", g_pog_index, "N","Y"); //ASA-1858 Issue 2
					if (retval) {
						if (fieldName == "depthfacing") {
							update_cap_depth(items, g_incre_mod_index, g_incre_shelf_index, g_incre_item_index, g_pog_index); //ASA-1273 Prasanna
						}
						//console.log('minus');
						if (fieldName == "horizfacing" || fieldName == "depthfacing") {
							var res = await calculateFixelAndSupplyDays("N", g_pog_index);
						}
					} else {
						if (g_error_category == "W") {
							//ASA-1327
							facing_error = "Horizontal";
						} else if (g_error_category == "H") {
							facing_error = "Vertical";
						} else if (g_error_category == "D") {
							facing_error = "Depth";
						}
						if (g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
							alert(get_message("POGC_CHEST_SPACE_VALID", g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].Shelf));
						} else {
							alert(get_message("INCREMENT_ERROR", facing_error));
						}
					}
				}
			}
		} else {
			parent.find("input[name=" + fieldName + "]").val(1);
		}
		var selectedobj = g_scene_objects[g_pog_index].scene.children[2].getObjectById(item_inx_dtl.ObjID);
		var item_info = g_pog_json[g_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index]; //ASA-1273 Prasanna
		var cap_capacity = item_info.CapFacing * item_info.CapDepth * item_info.CapHorz; //ASA-1273 Prasanna
		selectedobj.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1273 Prasanna
		g_intersected.push(selectedobj); //ASA-1107
	} else {
		g_mselect_drag = "N";
		g_multiselect = "N";
		var lookup = {};
		var items = g_delete_details;
		var UniqueID = [];
		var details_arr = [];

		for (var item, i = 0; (item = items[i++]); ) {
			if (item.Object == "ITEM") {
				var name = "abc";
				name = item.SIndex + "-" + item.MIndex;
				if (!(name in lookup)) {
					lookup[name] = 1;
					UniqueID.push(name);
					var details = {};
					details["SIndex"] = item.SIndex;
					details["MIndex"] = item.MIndex;
					details["ObjType"] = item.ObjType;
					details_arr.push(details);
				}
			}
		}
		var error_log = "N";
		var shelf_obj, shelf_name; //ASA-1327
		g_combineItemModf = []; //ASA-1327 blinking to capture current item
		for (const objects of g_delete_details) {
			if (objects.Object == "ITEM") {
				var item_inx_dtl = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex];
				var horiz_facing = (vert_facing = depth_facing = 1);
				var facing_error = "";
				shelf_obj = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType; //ASA-1327
				shelf_name = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf;
				if (fieldName == "horizfacing") {
					facing_error = "Horizontal";
					if (item_inx_dtl.BHoriz > 1) {
						horiz_facing = item_inx_dtl.BHoriz - 1;
					} else {
						horiz_facing = 1;
					}
					vert_facing = item_inx_dtl.BVert;
					depth_facing = item_inx_dtl.BaseD;
				} else if (fieldName == "vertfacing") {
					facing_error = "Vertical";
					horiz_facing = item_inx_dtl.BHoriz;
					if (item_inx_dtl.CapStyle !== 3) {
						if (item_inx_dtl.BVert > 1) {
							vert_facing = item_inx_dtl.BVert - 1;
						} else {
							vert_facing = 1;
						}
					} else {
						vert_facing = 1;
					}
					depth_facing = item_inx_dtl.BaseD;
				} else {
					facing_error = "Depth";
					horiz_facing = item_inx_dtl.BHoriz;
					vert_facing = item_inx_dtl.BVert;
					if (item_inx_dtl.BaseD > 1) {
						depth_facing = item_inx_dtl.BaseD - 1;
					} else {
						depth_facing = 1;
					}
				}
				if (item_inx_dtl.CapStyle == 3 && fieldName == "vertfacing") {
					//console.log('capstyle');
				} else {
					if (typeof parent !== "undefined") {
						if (currentVal != 1) {
							//ASA-1193
							parent.find("input[name=" + fieldName + "]").val(currentVal - 1);
						}
					}
					var items = item_inx_dtl;
					//ASA-1408-S
					var l_max_hfacing = nvl(items.MPogHorizFacings) > 0 ? items.MPogHorizFacings : items.MHorizFacings;
					var l_max_vfacing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings;
					var l_max_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings;
					//ASA-1408-E
					if ((fieldName == "horizfacing" && horiz_facing > l_max_hfacing && l_max_hfacing > -1) || (fieldName == "vertfacing" && vert_facing > l_max_vfacing && l_max_vfacing > -1) || (fieldName == "depthfacing" && depth_facing > l_max_dfacing && l_max_dfacing > -1)) {
						//ASA-1408
						//ASA-874
						item_err.push(items.Item); //ASA-1450 S
						l_error_item = "Y";
						if (g_delete_details.length == 1) {
							l_error_item = "N";
							alert(get_message("POGCR_MAX_FACING_REACH"));
							break;
						} //ASA-1450 E
					} else {
						var info = {};
						info["NewMIndex"] = objects.MIndex; //ASA-1327
						info["NewSIndex"] = objects.SIndex;
						info["OldMIndex"] = objects.MIndex;
						info["OldSIndex"] = objects.SIndex;
						info["OldIIndex"] = objects.IIndex;
						info["OldObjID"] = item_inx_dtl.ObjID;
						g_combineItemModf.push(info);
						var retval = await update_item_facings(objects.MIndex, objects.SIndex, objects.IIndex, horiz_facing, vert_facing, depth_facing, fieldName, false, "N", g_pog_index, "N","Y"); //ASA-1858 Issue 2 //ASA-1165
						if (!retval) {
							error_log = "Y";
						} else {
							update_cap_depth(items, objects.MIndex, objects.SIndex, objects.IIndex, g_pog_index); //ASA-1273 Prasanna
							console.log("success incrment");
						}
					}
				}
			}
		}
		if (l_error_item == "Y") {
			//ASA-1450
			alert(get_message("POGCR_MAX_FACING_REACH"));
		}
		if (error_log == "Y") {
			if (g_error_category == "W") {
				//ASA-1327
				facing_error = "Horizontal";
			} else if (g_error_category == "H") {
				facing_error = "Vertical";
			} else if (g_error_category == "D") {
				facing_error = "Depth";
			}
			if (shelf_obj == "CHEST" && g_chest_as_pegboard == "Y") {
				alert(get_message("POGC_CHEST_SPACE_VALID", shelf_name));
			} else {
				alert(get_message("INCREMENT_ERROR", facing_error));
			}
			document.getElementById("context-menu").classList.remove("active"); //Task_27720
		} else {
			//Task_27720
			for (const details of details_arr) {
				if (reorder_items(details.MIndex, details.SIndex, g_pog_index)) {
					if (details.ObjType == "SHELF" || details.ObjType == "PALLET") {
						var returnval = reset_top_bottom_objects(details.MIndex, details.SIndex, "N", g_pog_index);
					}
					return_val = await recreate_all_items(details.MIndex, details.SIndex, details.ObjType, "Y", -1, -1, g_pog_json[g_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", g_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
				}
			}
		} //Task_27720
		//setting blinking back to the same item till do other action.
		if (error_log == "N") {
			//Task_27720
			for (const objects of g_delete_details) {
				g_intersected = [];
				if (objects.Object == "ITEM") {
					var l_edited_item_index = -1; //ASA-1327 after items are rearranged. its getting wrong item for blink
					var modfIndx = -1;
					if (g_combineItemModf.length > 0) {
						for (var mf = 0; mf < g_combineItemModf.length; mf++) {
							if (g_combineItemModf[mf].OldMIndex == objects.MIndex && g_combineItemModf[mf].OldSIndex == objects.SIndex) {
								modfIndx = mf;
								break;
							}
						}
					}
					var checkShelf = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex]; //ASA-1327
					var item_details = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
					if (checkShelf.ObjType !== "PEGBOARD" && !(checkShelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
						//ASA-1327
						var sorto = {
							X: "asc",
							Y: "asc",
						};
						item_details.keySort(sorto);
					}
					if (modfIndx !== -1) {
						var itemIndex = 0;
						for (item of item_details) {
							if (item.ObjID == g_combineItemModf[modfIndx].NewObjID) {
								l_edited_item_index = itemIndex;
							}
							itemIndex++;
						}
					}
					var iteminfo = g_pog_json[g_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[l_edited_item_index];
					var selectedobj = g_scene_objects[g_pog_index].scene.children[2].getObjectById(iteminfo.ObjID);
					var cap_capacity = iteminfo.CapFacing * iteminfo.CapDepth * iteminfo.CapHorz; //ASA-1273 Prasanna
					selectedobj.Cpct = iteminfo.BHoriz * iteminfo.BVert * iteminfo.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0); //ASA-1273 Prasanna
					g_intersected.push(selectedobj);
				}
			}
		}
		g_combineItemModf = []; //ASA-1327 blinking to capture current item //Task_27720
	} //Task_27720
	render_animate_selected(); //ASA-1107 //Task_27720
	logDebug("function : decrementValue", "E");
}
//1273 Prasanna Start
function update_cap_depth(p_item, p_module_index, p_shelf_index, p_item_index, p_pog_index) {
	var p_item = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
	if (p_item.CapStyle > 0) {
		var cap_orientation = p_item.CapOrientaion == "" ? "4" : p_item.CapOrientaion;
		var [cap_width, cap_height, cap_depth] = get_cap_dim(p_item);
		var CapDepthChanged = p_item.CapDepthChanged; //ASA-1273

		var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);
		if (CapDepthChanged == "N" || typeof CapDepthChanged == "undefined") {
			//ASA-1273
			var depth_cap = Math.trunc(p_item.RD / cDepth);
			p_item.CapDepth = depth_cap;
			/*if (depth_cap == 0) {
            p_item.CapFacing = 0;
            }*/
		}
	}
} //ASA-1273 End

//this is a common function used to set the new values of an item and check if with new values validation will pass. then it will return the details.
function set_dim_validate_item(p_module_index, p_shelf_index, p_item_index, p_item_width, p_item_height, p_item_depth, p_nesting, p_nesting_value, p_horiz_facing, p_vert_facing, p_depth_facing, p_orientation, p_crush_width_perc, p_crush_height_perc, p_crush_depth_perc, p_raise_alert, p_validate, p_facing_edit, p_pog_index, p_set_facing = "Y", p_decrement_value = "N") { //ASA-1858 Issue 2 Added new parameter p_decrement_value 
	logDebug("function : set_dim_validate_item; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; item_width : " + p_item_width + "; item_height : " + p_item_height + "; item_depth : " + p_item_depth + "; nesting : " + p_nesting + "; nesting_value : " + p_nesting_value + "; horiz_facing : " + p_horiz_facing + "; vert_facing : " + p_vert_facing + "; depth_facing : " + p_depth_facing + "; orientation : " + p_orientation + "; crush_width_perc : " + p_crush_width_perc + "; crush_height_perc : " + p_crush_height_perc + "; crush_depth_perc : " + p_crush_depth_perc + "; raise_alert : " + p_raise_alert + "; validate : " + p_validate + "; facing_edit : " + p_facing_edit, "S");
	try {
		console.log(" validate update", p_module_index, p_shelf_index, p_item_index, p_item_width, p_item_height, p_item_depth, p_nesting, p_nesting_value, p_horiz_facing, p_vert_facing, p_depth_facing, p_orientation, p_crush_width_perc, p_crush_height_perc, p_crush_depth_perc, p_raise_alert, p_validate, p_facing_edit, p_pog_index);
		var item_depth_arr = [],
			item_height_arr = [],
			item_width_arr = [];
		var item_index_arr = [],
			real_width = 0,
			real_height = 0,
			real_depth = 0,
			item_info = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
		//save all the old values in variables so that we can revert back if validation error.
		var old_real_width = 0,
			old_real_height = 0,
			old_real_depth = 0;
		old_real_width = item_info.RW;
		old_real_height = item_info.RH;
		old_real_depth = item_info.RD;
		old_x = item_info.X;
		old_y = item_info.Y;
		var old_width = 0,
			old_height = 0,
			old_depth = 0;
		var old_width = item_info.W,
			old_height = item_info.H,
			old_depth = item_info.D;
		//var depth = item_info.D; //ASA-1273 Commented Prasanna
		//var p_depth_facing = item_info.BaseD; //ASA-1273 Commented Prasanna
		//var p_item_height = item_info.RH; //ASA-1273 Commented Prasanna
		var CapDepthChanged = item_info.CapDepthChanged; //ASA-1273

		var spread_product = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
		var ShelfhorizGap = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].HorizGap;
		var ItemHorizGap = item_info.HorizGap;
		var ItemVertGap = item_info.VertGap;

		var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
		var modules = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
		//ASA-1438
		// if (item_info.MHorizCrushed == "N") {
		//     item_info.CrushHoriz = 0;
		// }
		//get dimensions based on orientation.
		if (p_orientation == "1" || p_orientation == "3" || p_orientation == "13" || p_orientation == "15") {
			//ASA-1476 issue 2
			var new_width = p_item_width;
			var new_height = p_item_height;
			p_item_height = new_width;
			p_item_width = new_height;
			p_item_depth = p_item_depth;
		} else if (p_orientation == "4" || p_orientation == "6" || p_orientation == "16" || p_orientation == "18") {
			var new_depth = p_item_depth;
			var new_height = p_item_height;
			p_item_width = p_item_width;
			p_item_height = new_depth;
			p_item_depth = new_height;
		} else if (p_orientation == "5" || p_orientation == "7" || p_orientation == "17" || p_orientation == "19") {
			var new_depth = p_item_depth;
			var new_height = p_item_height;
			var new_width = p_item_width;
			p_item_height = new_width;
			p_item_width = new_depth;
			p_item_depth = new_height;
		} else if (p_orientation == "8" || p_orientation == "10" || p_orientation == "20" || p_orientation == "22") {
			var new_depth = p_item_depth;
			var new_width = p_item_width;
			p_item_width = new_depth;
			p_item_height = p_item_height;
			p_item_depth = new_width;
		} else if (p_orientation == "9" || p_orientation == "11" || p_orientation == "21" || p_orientation == "23") {
			var new_depth = p_item_depth;
			var new_height = p_item_height;
			var new_width = p_item_width;
			p_item_width = new_height;
			p_item_height = new_depth;
			p_item_depth = new_width;
		}
		//if nesting is setup for that item get the set the nesting to the dimension.
		//Note: nesting and capping cannot be together. if there is nesting capping will be removed.
		if (spread_product !== "F" && ShelfhorizGap == 0 && ItemHorizGap == 0 && p_nesting_value !== 0) {
			if (p_nesting_value < 0) {
				p_nesting_value = p_nesting_value * -1;
			}
			//nesting is basically an item is placed insid another. Ex. stack of plastic cups. which will be placed inside another.
			//so we decide how many facing are there and how much of cms should be shown outside. imagine remaining dimension will be inside.
			if (p_nesting == "H") {
				var nest_value = (p_vert_facing - 1) * p_nesting_value;
				p_item_height = p_item_height + nest_value;
				p_item_width = p_item_width * p_horiz_facing;
				p_item_depth = p_item_depth * p_depth_facing;
			} else if (p_nesting == "W") {
				var nest_value = (p_horiz_facing - 1) * p_nesting_value;
				p_item_width = p_item_width + nest_value;
				p_item_height = p_item_height * p_vert_facing;
				p_item_depth = p_item_depth * p_depth_facing;
			} else if (p_nesting == "D") {
				p_item_depth = p_item_depth + (p_depth_facing - 1) * p_nesting_value;
				p_item_width = p_item_width * p_horiz_facing;
				p_item_height = p_item_height * p_vert_facing;
			}
			real_width = p_item_width + (ItemHorizGap / 100) * (p_horiz_facing - 1);
			real_height = p_item_height + (ItemVertGap / 100) * (p_vert_facing - 1);
			real_depth = p_item_depth;
		} else {
			var item_horiz_gap = item_info.HorizGap;
			var item_vert_gap = item_info.VertGap;

			var crush_vert = item_info.CrushVert;
			var crush_horiz = item_info.CrushHoriz;
			var crush_depth = item_info.CrushD;
			real_width = p_item_width * p_horiz_facing + (item_horiz_gap / 100) * (p_horiz_facing - 1);
			real_height = p_item_height * p_vert_facing + (item_vert_gap / 100) * (p_vert_facing - 1);
			real_depth = p_item_depth * p_depth_facing;
			//ASA-1410 issue 13 20240624
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W = real_width; //p_item_width  Task_28479 Issue 4
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H = real_height; //p_item_height Task_28479 Issue 4
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D = real_depth; //p_item_depth  Task_28479 Issue 4
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RW = real_width;
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH = real_height;
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RD = real_depth;
			//ASA-1410 issue 13 20240624
			//var l_max_merch = get_max_merch(p_module_index, p_shelf_index, p_item_index, "Y", -1, p_pog_index) //ASA-1273
			var l_max_merch = get_cap_max_merch(p_module_index, p_shelf_index, modules, shelfs, p_pog_index, g_dft_max_merch); //20240415 - Regression Issue 8//ASA-1273 Prasanna
			var items = item_info;
			//capping is the stacking on item on top of another item. Ex. there are corn flacks box. first we keep it standing on behind another
			//on top of that box there is some space left. so we keep same boxes in sleeping position. this is called capping.
			if ((items.CapStyle == "1" || items.CapStyle == "2" || items.CapStyle == "3") && l_max_merch > p_item_height) {
				//ASA-1410
				set_item_capping(p_pog_index, p_module_index, p_shelf_index, p_item_index, "N", "Y"); //ASA-1410 issue 10 20240625 //ASA-1412 issue 1 20240628 //ASA-1476 Issue 5
				// set_item_capping(p_pog_index, p_module_index, p_shelf_index, p_item_index, 'N', g_max_facing_enabled == "Y" ? "N" : "Y"); //ASA-1410 issue 10 20240625 //ASA-1412 issue 1 20240628 //ASA-1476 Issue 5
				p_item_height = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H;
				p_item_width = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W;
				p_item_depth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;

				/*
                var items_cnt = -1;
                var orignal_height = p_item_height;
                var cap_max_high = items.CapMaxH;
                var new_height = p_item_height * p_vert_facing + (items.VertGap / 100) * (p_vert_facing - 1); //ASA-1170 : - crush_height;

                // ASA-1170, Start
                var cap_width = 0,
                cap_height = 0,
                cap_depth = 0;
                var cap_merch = items.CapMerch == "" ? "0" : items.CapMerch;
                var cap_orientation = items.CapOrientaion == "" ? "4" : items.CapOrientaion;
                var [cap_width, cap_height, cap_depth] = get_cap_dim(items); //ASA-1273 Prasanna
                var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);
                //ASA-1179, Start
                var orgCapDepth = cap_height;
                var mCapDepthCount = items.CapDepth !== "" && items.CapDepth > 1 ? parseInt(items.CapDepth) : 1;
                var mCapDepth = orgCapDepth * mCapDepthCount;
                if (mCapDepth > new_depth) {
                items.CapDepth = Math.trunc(real_depth / cDepth); //ASA-1273 Prasanna
                //alert(get_message('CAP_FACING_ERR_DEPTH'));
                //return;
                }
                //ASA-1179, End
                if (capActualHeight == "W") {
                cap_height = cap_width;
                } else {
                cap_height = cap_depth;
                }
                // ASA-1170, End
                var mCapCount = items.CapFacing !== "" && items.CapFacing > 0 && items.CapFacing > cap_max_high && cap_max_high > 0 ? parseInt(cap_max_high) : parseInt(items.CapFacing);
                if (items.CapStyle == "1") {
                l_max_merch = l_max_merch - new_height;
                // items_cnt = Math.trunc(l_max_merch / item_depth); //ASA-1170
                items_cnt = Math.trunc(l_max_merch / cap_height); //ASA-1170
                if (real_depth < cDepth) {
                items_cnt = 0;
                }
                if (items_cnt > 0) { //ASA-1179 x31
                items_cnt = 1;
                p_item_height = new_height + cap_height * items_cnt; //ASA-1170, new_depth;
                }
                } else if (items.CapStyle == "2") {
                l_max_merch = l_max_merch - new_height;
                items_cnt = Math.trunc(l_max_merch / cap_height); //ASA-1170
                if (items.MaxHCapStyle == "2" && items_cnt > cap_max_high && cap_max_high > 0) {
                items_cnt = cap_max_high;
                }
                items_cnt = items.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : items_cnt;
                if (real_depth < cDepth) {
                items_cnt = 0;
                }
                if (items_cnt > 0) { //ASA-1179 x31
                p_item_height = new_height + cap_height * items_cnt; //ASA-1170
                }
                } else if (items.CapStyle == "3") {
                l_max_merch = l_max_merch - orignal_height;
                items_cnt = Math.trunc(l_max_merch / cap_height); //ASA-1170
                if (items.MaxHCapStyle == "3" && items_cnt > cap_max_high && cap_max_high > 0) {
                items_cnt = cap_max_high;
                }
                items_cnt = items.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : items_cnt;
                if (real_depth < cDepth) {
                items_cnt = 0;
                }
                if (items_cnt > 0) { //ASA-1179 x31
                p_item_height = p_item_height + cap_height * items_cnt;
                $s("P25_ITEM_BASE_VERT", 1);
                }
                }
                if (items_cnt > 0) { //ASA-1179 x31
                var capHorzCount = items.BHoriz;
                var capCount = items_cnt * capHorzCount * mCapDepthCount;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapFacing = items_cnt; //ASA-1170;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapMerch = cap_merch; //ASA-1170
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapOrientaion = cap_orientation; //ASA-1170
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHeight = cap_height; //ASA-1170
                var [itemx, itemy] = get_item_xy(shelfs, items, p_item_width, p_item_height, p_pog_index);
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y = itemy;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].MCapTopFacing = items.MCapTopFacing; //ASA-1170

                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount = items_cnt; //ASA-1170;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHorz = capHorzCount; //ASA-1179
                if (CapDepthChanged == "N" || typeof CapDepthChanged == 'undefined') { //ASA-1273 Prasanna
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth = Math.trunc(real_depth / cDepth); //ASA-1273 Prasanna//
                } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth = mCapDepthCount; //ASA-1179
                }
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapTotalCount = capCount; //ASA-1179
                } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount = 0; //
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapMerch = ""; //ASA-1170
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHorz = 0; //ASA-1179
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth = 0; //ASA-1179
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapTotalCount = 0; //ASA-1179
                items.CapStyle = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle;
                p_item_height = p_item_height * p_vert_facing + (ItemVertGap / 100) * (p_vert_facing - 1); // - crush_height;
                }
                items.CapCount = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount;
                items.CapFacing = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapFacing;
                items.CapMerch = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapMerch;
                items.CapOrientaion = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapOrientaion;
                items.CapHeight = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHeight;
                items.CapHorz = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHorz; //ASA-1179
                items.CapDepth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth; //ASA-1179
                items.CapTotalCount = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapTotalCount; //ASA-1179


                var [itemx, itemy] = get_item_xy(shelfs, items, p_item_width, p_item_height, p_pog_index); //ASA-1282 3A prasanna
                items.Y = itemy; //ASA-1282 3A prasanna
                p_item_width = p_item_width * p_horiz_facing + (items.HorizGap / 100) * (p_horiz_facing - 1); //ASA-1170 : - crush_width;
                p_item_depth = p_item_depth * p_depth_facing; //ASA-1170 : - crush_depth;
                 */
			} else {
				//else set normal values to the variables.
				var item_info = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
				item_info.CapFacing = 0; //ASA-1170;
				item_info.CapMerch = ""; //ASA-1170
				item_info.CapOrientaion = ""; //ASA-1170
				item_info.CapHeight = 0; //ASA-1170

				//ASA-1300 when manual crush then preserve it.
				p_item_width = p_item_width * p_horiz_facing + (item_horiz_gap / 100) * (p_horiz_facing - 1); // - crush_width;
				p_item_height = p_item_height * p_vert_facing + (ItemVertGap / 100) * (p_vert_facing - 1); // - crush_height;
				p_item_depth = p_item_depth * p_depth_facing; // - crush_val_depth;
				item_info.H = p_item_height;
				item_info.W = p_item_width;
				item_info.D = p_item_depth;
				item_info.RH = p_item_height;
				item_info.RW = p_item_width;
				item_info.RD = p_item_depth;
				item_depth_arr.push(wpdSetFixed(p_item_depth)); //.toFixed(3)));
				item_index_arr.push(p_item_index);
				//only try to crush when objectype is chest or manually crushed by user on edit.
				if (shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "Y" && (item_info.MVertCrushed == "Y" || item_info.MHorizCrushed == "Y" || item_info.MDepthCrushed == "Y")) {
					crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "A", "Y", item_depth_arr, item_index_arr);
					p_item_height = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H;
					p_item_width = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W;
					p_item_depth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;
				} else if (shelfs.AllowAutoCrush == "Y") {
					if (item_info.MVertCrushed == "Y") {
						crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "H", "Y", item_depth_arr, item_index_arr);
						p_item_height = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H;
					}

					if (item_info.MHorizCrushed == "Y") {
						crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "W", "Y", item_depth_arr, item_index_arr);
						p_item_width = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W;
					}

					if (item_info.MDepthCrushed == "Y") {
						crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "D", "Y", item_depth_arr, item_index_arr);
						p_item_depth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;
					}
				} else if (shelfs.AllowAutoCrush == "N") {
					item_info.CrushHoriz = 0;
					item_info.CrushVert = 0;
					item_info.CrushD = 0; //Task_26973
					item_info.MHorizCrushed = "N"; //ASA-1386 Issue 15
					item_info.MVertCrushed = "N"; //ASA-1386 Issue 15
					item_info.MDepthCrushed = "N"; //ASA-1386 Issue 15
				}

				//ASA-1300
				if (typeof item_info.BottomObjID == "undefined" || item_info.BottomObjID == "") {
					var [itemx, itemy] = get_item_xy(shelfs, items, p_item_width, p_item_height, p_pog_index); //issue 3b prasanna
					item_info.Y = itemy; //issue 3b prasanna
				}
			}
		}
		console.log("after setting", p_item_height, p_item_width, p_item_depth);

		if (p_validate == "Y") {
			item_info.RW = real_width;
			item_info.RH = real_height;
			item_info.RD = real_depth;

			if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PEGBOARD" || (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
				var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
				var items = item_info;
				var [itemx, itemy] = get_item_xy(shelfs, items, p_item_width, p_item_height, p_pog_index);
				item_info.X = itemx;
				item_info.Y = itemy;
			}

			var return_val = "N";
			var spread_gap = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].HorizGap;
			var horiz_gap = spread_gap;
			var item_length = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length;
			var allow_crush = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].AllowAutoCrush;
			var CrushVert = item_info.CrushVert;
			var item_fixed = item_info.Fixed;
			var g_shelf_object_type = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType;
			var item_objid = item_info.ObjID;
			//ASA-1582
			if (g_combinedShelfs.length > 0) {
				var [currCombinationIndex, curShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf);
				if (currCombinationIndex !== -1) {
					allow_crush = g_combinedShelfs[currCombinationIndex][0].AllowAutoCrush;
				}
			}
			if (item_objid !== "" && typeof item_objid !== "undefined") {
				$.each(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo, function (i, fitems) {
					if (fitems.ObjID == item_objid) {
						p_item_index = i;
						return false;
					}
				});
			}
			var old_item_depth = item_info.D;
			item_info.D = p_item_depth;
			//need to set facings again when dim is changed and may be there is no enough space ASA-1292
			if ((typeof item_info.BottomObjID == "undefined" || item_info.BottomObjID == "") && item_info.Item !== "DIVIDER") {
				if (p_set_facing == "Y") {
					var res = set_auto_facings(p_module_index, p_shelf_index, p_item_index, item_info, "B", "I", "D", p_pog_index);
					//ASA-1476 Issue 1
					if (g_max_facing_enabled == "Y" && shelf_info.ObjType == "SHELF") {
						p_item_height = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H; //values will be changed after auto facing so need to update new value for valdation
						real_height = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH; //ASA-1343 --Depth facings wrong
					}
					p_item_depth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;
					real_depth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RD; //ASA-1343 --Depth facings wrong
				}
			}
			item_info.W = p_item_width; //values will be changed after auto facing so need to update new value for valdation. so added after auto facings.
			item_info.H = p_item_height;
			item_info.D = p_item_depth;

			var dim_type = item_info.DimT;
			(item_depth_arr = []), (item_width_arr = []), (item_height_arr = []), (item_index_arr = []); //ASA-1327
			item_width_arr.push(wpdSetFixed(p_item_width)); //.toFixed(4)));
			item_height_arr.push(wpdSetFixed(p_item_height)); //.toFixed(4)));
			item_depth_arr.push(wpdSetFixed(p_item_depth)); //.toFixed(4)));
			item_index_arr.push(p_item_index);

			if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "BASKET" && item_info.Item == "DIVIDER") {
				console.log("no validaation");
			} else if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType !== "PEGBOARD" && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType !== "CHEST") {
				return_val = item_height_validation(p_item_height, p_module_index, p_shelf_index, p_item_index, "Y", item_info.X, allow_crush, CrushVert, item_fixed, p_raise_alert, p_item_depth, p_facing_edit, p_pog_index,"N",p_decrement_value); //ASA-1858 Issue 2 added p_decrement_value
			}

			var drag_item_arr = [];
			//do item width and depth validation here. it will try to crush also if validation fails. but even after crush it fails. it will return false.
			if (return_val == "N" && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, g_shelf_object_type, p_module_index, p_shelf_index, p_item_index, "Y", crush_horiz, crush_vert, crush_depth, item_info.X, item_fixed, "N", p_raise_alert, "N", p_facing_edit, drag_item_arr, "Y", "Y", "Y", p_pog_index, "N" , "N", p_decrement_value)) {  //ASA-1858 Issue 2
				var items = item_info;

				if (typeof items.HChanged !== "undefined" && items.HChanged == "Y") {
					p_item_height = item_info.H;
					real_height = item_info.RH; //ASA-1582
					// real_height = p_item_height;
				}
				if (typeof items.WChanged !== "undefined" && items.WChanged == "Y") {
					p_item_width = item_info.W;
					real_width = item_info.RW;
				}
				if (typeof items.DChanged !== "undefined" && items.DChanged == "Y") {
					p_item_depth = item_info.D;
					real_depth = item_info.RD; //ASA-1582
					// real_depth = p_item_depth;
				}
				logDebug("function : set_dim_validate_item", "E");
				return [p_item_width, p_item_height, p_item_depth, real_width, real_height, real_depth];
			} else {
				//if the validation fails that means system has tried to crush the item and also reduce facings, but all failed so it will return false.
				//now we need to reset the iteminfo to old details and send error back.
				item_info.D = old_item_depth;
				item_info.RW = old_real_width;
				item_info.RH = old_real_height;
				item_info.RD = old_real_depth;
				item_info.W = old_width;
				item_info.H = old_height;
				item_info.D = old_depth;
				item_info.X = old_x; //ASA-1300
				item_info.Y = old_y;
				if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PEGBOARD" || (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
					item_info.X = old_x;
				}
				logDebug("function : set_dim_validate_item", "E");
				return ["ERROR", "ERROR", "ERROR", "ERROR", "ERROR", "ERROR"];
			}
		} else {
			logDebug("function : set_dim_validate_item", "E");
			return [p_item_width, p_item_height, p_item_depth, real_width, real_height, real_depth];
		}
	} catch (err) {
		error_handling(err);
	}
}

//ASA-1273 Start Prasanna
function get_cap_dim(p_items) {
	var cap_width = 0,
		cap_height = 0,
		cap_depth = 0;
	var cap_merch = p_items.CapMerch == "" ? "0" : p_items.CapMerch;
	if (cap_merch == "0") {
		if (wpdSetFixed(p_items.UW) !== wpdSetFixed(p_items.OrgUW) || wpdSetFixed(p_items.UH) !== wpdSetFixed(p_items.OrgUH) || wpdSetFixed(p_items.UD) !== wpdSetFixed(p_items.OrgUD)) {
			cap_width = p_items.OrgUW;
			cap_height = p_items.OrgUH;
			cap_depth = p_items.OrgUD;
		} else {
			cap_width = p_items.UW;
			cap_height = p_items.UH;
			cap_depth = p_items.UD;
		}
	} else if (cap_merch == "2") {
		if (wpdSetFixed(p_items.CW) !== wpdSetFixed(p_items.OrgCW) || wpdSetFixed(p_items.CH) !== wpdSetFixed(p_items.OrgCH) || wpdSetFixed(p_items.CD) !== wpdSetFixed(p_items.OrgCD)) {
			cap_width = p_items.OrgCW;
			cap_height = p_items.OrgCH;
			cap_depth = p_items.OrgCD;
		} else {
			cap_width = p_items.CW;
			cap_height = p_items.CH;
			cap_depth = p_items.CD;
		}
	} else if (cap_merch == "1") {
		if (wpdSetFixed(p_items.TW) !== wpdSetFixed(p_items.OrgTW) || wpdSetFixed(p_items.TH) !== wpdSetFixed(p_items.OrgTH) || wpdSetFixed(p_items.TD) !== wpdSetFixed(p_items.OrgTD)) {
			cap_width = p_items.OrgTW;
			cap_height = p_items.OrgTH;
			cap_depth = p_items.OrgTD;
		} else {
			cap_width = p_items.TW;
			cap_height = p_items.TH;
			cap_depth = p_items.TD;
		}
	} else if (cap_merch == "3") {
		if (wpdSetFixed(p_items.DW) !== wpdSetFixed(p_items.OrgDW) || wpdSetFixed(p_items.DH) !== wpdSetFixed(p_items.OrgDH) || wpdSetFixed(p_items.DD) !== wpdSetFixed(p_items.OrgDD)) {
			cap_width = p_items.OrgDW;
			cap_height = p_items.OrgDH;
			cap_depth = p_items.OrgDD;
		} else {
			cap_width = p_items.DW;
			cap_height = p_items.DH;
			cap_depth = p_items.DD;
		}
	}
	return [cap_width, cap_height, cap_depth];
} //ASA-1273 End

function auto_position() {
	logDebug("function : auto_position", "S");
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		if (g_auto_position_ind == "N") {
			g_auto_position_ind = "Y";
			$(".auto_position").addClass("auto_position_active");
		} else {
			g_auto_position_ind = "N";
			$(".auto_position").removeClass("auto_position_active");
		}
	}
	logDebug("function : auto_position", "E");
}

//setting X axis of the shelf automatically. finding out which side of the module shelf should move.
//if shelf is more than center of the module it will move right side and vice versa.
function update_position_loc(p_shelfs, p_modules, p_shelf_index, p_curr_module, p_module_index, p_camera, p_pog_index, p_world, p_considerSubshelf) {
	logDebug("function : update_position_loc; p_shelf_index : " + p_shelf_index + "; p_module_index : " + p_module_index, "S");
	try {
		var new_shelfX = -1;
		var new_shelfY = p_shelfs.Y;
		var notchUpdated = false;
		var newNotch = -1;
		var subShelfPerc = $v("P25_POGCR_SUBSHELF_W_PERC");
        var autoPositionXY = $v("P25_ALIGN_BOTH_XY_POSITION"); //ASA-1797
		if ((p_shelfs.ObjType == "HANGINGBAR" || p_shelfs.ObjType == "SHELF") && p_considerSubshelf == "N" && wpdSetFixed(p_shelfs.W / p_modules.ModWidth) * 100 < 100 - parseFloat(subShelfPerc)) {
			return ["N", p_shelfs.X, new_shelfY];
		}
		//here we check if shelf X is less than or more then module X. then we decide to place it left or right corner.
		if (p_shelfs.X <= p_modules.ModX) {
			new_shelfX = p_modules.ModX - p_modules.ModWidth / 2 + p_shelfs.W / 2;
		} else {
			new_shelfX = p_modules.ModX + p_modules.ModWidth / 2 - p_shelfs.W / 2;
		}

		//ASA-1628
		if ((p_shelfs.ObjType == "HANGINGBAR" || p_shelfs.ObjType == "SHELF") && autoPositionXY == 'Y'){ //ASA-1797 add and condition.
			[new_shelfY, notchUpdated, newNotch] = autoPositionShelfVertically(p_pog_index, p_module_index, p_shelf_index, new_shelfX, p_shelfs.Y, p_shelfs.ObjType, subShelfPerc, p_considerSubshelf);
		}
		//ASA-1659, Start
		// g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X = new_shelfX;
		// g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y = new_shelfY;
		// if (notchUpdated) {
		//     g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].NotchNo = newNotch;
		// }
		//ASA-1659, End

		//text box dont need validation as it can be placed anywhere even on top of shelf or item.
		if (p_shelfs.ObjType !== "TEXTBOX") {
			var validate_passed = validate_shelf_min_distance(p_curr_module, p_shelf_index, new_shelfY, p_shelfs.ItemInfo, p_shelfs.AllowAutoCrush, p_module_index, new_shelfX, "N", p_shelfs, p_pog_index, "Y"); //ASA-1628 Issue 1, sending "Y" as pAutoPosition
		} else {
			var validate_passed = "Y";
		}
		if (validate_passed == "Y" || validate_passed == "R") {
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X = new_shelfX;
			g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y = new_shelfY; //ASA-1628
			//ASA-1628 Issue 9
			if (notchUpdated) {
				g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].NotchNo = newNotch;
			}
			var selectedObject = p_world.getObjectById(p_shelfs.SObjID);

			//ASA-1628
			/*var shelfz = -1;
            if (p_shelfs.ObjType !== "TEXTBOX") {
                if (p_shelfs.Z == g_pog_json[p_pog_index].BackDepth) {
                    shelfz = 0.001;
                } else {
                    shelfz = shelfz > 0.0021 ? 0.0021 : p_shelfs.Z == 0 ? 0.0006 : p_shelfs.Z;
                }
            } else {
                shelfz = 0.0005;
            }
            if (g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                //ASA-1125
                shelfz = 0.00115;
            } else if (g_shelf_object_type == "ROD") {
                shelfz = 0.005;
            } else if (g_shelf_object_type !== "TEXTBOX") {
                shelfz = 0.0005;
            }*/

			//ASA-1628 Issue 12, Start
			selectedObject.position.set(new_shelfX, new_shelfY, wpdSetFixed(selectedObject.position.z)); //ASA-1628 p_shelfs.Y
			var rotation = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation;
			var slope = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Slope;
			if (rotation !== 0) {
				selectedObject.quaternion.copy(p_camera.quaternion);
				selectedObject.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
				selectedObject.rotateY((rotation * Math.PI) / 180);
			}
			if (slope !== 0) {
				if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "TEXTBOX") {
					if (rotation == 0) {
						selectedObject.rotateX(((slope / 2) * Math.PI) / 180);
					} else {
						selectedObject.rotateX((slope * Math.PI) / 180);
					}
				} else {
					selectedObject.rotateX((slope * Math.PI) / 180);
				}
			}
			selectedObject.updateMatrix();

			g_scene.updateMatrixWorld();
			async function doSomething() {
				await set_all_items(p_module_index, p_shelf_index, new_shelfX, new_shelfY, "Y", "N", "Y", p_pog_index, p_pog_index,"Y"); //ASA-1898 Divider is showing in the front of the textbox
			}
			doSomething();
			//ASA-1628 Issue 12, End

			//ASA-1628 Issue 9
			if (p_shelfs.ObjType == "HANGINGBAR" || p_shelfs.ObjType == "SHELF") {
				if (g_show_notch_label == "Y") {
					var returnval = update_single_notch_label("Y", p_module_index, p_shelf_index, $v("P25_NOTCH_HEAD"), "", p_pog_index, "N"); //ASA-1292
				}
				if (g_fixel_label == "Y") {
					update_single_fixel_label(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index], p_pog_index, p_module_index, p_shelf_index);
				}
			}
		}
		logDebug("function : update_position_loc", "E");
		return [validate_passed, new_shelfX, new_shelfY];
	} catch (err) {
		error_handling(err);
	}
}



function auto_position_all_init(pConsiderSubShelf) {
	logDebug("function : auto_position_all_init", "S");
	auto_position_all(g_camera, g_pog_index, g_pog_index, $v("P25_POGCR_AUTO_POSITION_TEXT"), pConsiderSubShelf);
	logDebug("function : auto_position_all_init", "E");
}

//this is the main function which is called for undo and redo (Ctrl + Z(undo), Ctrl + Y (redo))
//Note: we have 2 different array for undo(g_undo_final_obj_arr) and redo(g_redo_final_obj_arr) --this will have all the actions performed by user
//from POG opened. Note: when there are multiple canvas then switching canvas will remove all the actions.
//logFinalUndoObjectsInfo will log the action into those arrays in most of the function.
//after doing undo we will remove the entry from g_undo_final_obj_arr and log the entry in g_redo_final_obj_arr at the same time when doing undo.
async function undo_actions_not_delete(p_action, p_camera, p_pog_index) {
	logDebug("function : undo_actions_not_delete; action : " + p_action, "S");
	try {
		addLoadingIndicator();
		console.log("undo actions", p_action, p_camera, p_pog_index);
		g_undo_details = []; /*yograj*/
		g_cut_copy_arr = [];
		g_cut_support_obj_arr = [];
		g_undoRedoAction = p_action;
		//first find what was the previous action before use do undo or redo.
		//Note: these 2 function below will check what is the previous action and populate the g_delete_details if the previous action was multi select
		//if not multi select g_undo_details, g_cut_copy_arr, g_cut_support_obj_arr (will have data if divider or text box is involved)
		if (p_action == "REDO") {
			g_prev_undo_action = last_redo_action();
		} else {
			g_prev_undo_action = await last_action();
		}
		console.log("g_prev_undo_action", g_prev_undo_action);
		if (typeof g_prev_undo_action !== "undefined") {
			//previously item was dragged from product list. so now remove.
			if (g_prev_undo_action == "CREATE_ITEM") {
				var valid_values = ["SHELF", "CHEST", "PALLET", "HANGINGBAR", "PEGBOARD", "ROD", "BASKET", "CHEST"];
				if (g_delete_details.length > 0) {
					await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
				} else {
					var res = await delete_item(g_undo_details[0].ObjID, g_undo_details[0].MIndex, g_undo_details[0].SIndex, g_undo_details[0].IIndex, g_prev_undo_action, "N", p_pog_index);
				}
				if (typeof g_clearInfoType !== "undefined" && g_clearInfoType == "Y") {
					if (p_action == "REDO") {
						//02092021
						g_prev_undo_action = last_redo_action();
					} else {
						g_prev_undo_action = await last_action();
					}
				}
			}
			//clear pog info would remove some attr of POG and its images. now revert back.
			if (g_prev_undo_action == "CLEAR_POG_INFO") {
				//01092021
				undo_clear_pog_info(p_pog_index);
			}
			if (g_prev_undo_action == "CLEAR_POG_ATT") {
				var details = {};
				var is_driver = "N";
				var finalAction;
				if (g_undoRedoAction == "REDO") {
					finalAction = "U";
				} else {
					finalAction = "R";
				}

				details["OldPOGCode"] = g_pog_json[p_pog_index].POGCode;
				details["OldPOGName"] = g_pog_json[p_pog_index].Name;
				details["OldPOGDivision"] = g_pog_json[p_pog_index].Division;
				details["OldPOGDept"] = g_pog_json[p_pog_index].Dept;
				details["OldPOGSubDept"] = g_pog_json[p_pog_index].SubDept;
				details["OldEffStartDate"] = g_pog_json[p_pog_index].EffStartDate;

				g_pog_json[p_pog_index].POGCode = g_undo_details[0].OldPOGCode;
				g_pog_json[p_pog_index].Name = g_undo_details[0].OldPOGName;
				g_pog_json[p_pog_index].Division = g_undo_details[0].OldPOGDivision;
				g_pog_json[p_pog_index].Dept = g_undo_details[0].OldPOGDept;
				g_pog_json[p_pog_index].SubDept = g_undo_details[0].OldPOGSubDept;
				g_pog_json[p_pog_index].EffStartDate = g_undo_details[0].OldEffStartDate;

				$s("P25_POG_DIVISION", "");
				var module_details = g_pog_json[p_pog_index].ModuleInfo;
				$.each(module_details, function (i, modules_info) {
					if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
						g_pog_json[p_pog_index].ModuleInfo[i].SubDept = g_pog_json[p_pog_index].ModuleInfo[i].OldPOGModuleSubDept;
						g_pog_json[p_pog_index].ModuleInfo[i].OldPOGModuleSubDept = "";
					}
				});

				g_undo_details = [];
				g_undo_details.push(details);
				if (finalAction == "U") {
					g_delete_details.multi_delete_shelf_ind = "N";
					g_undo_all_obj_arr = [];

					g_undo_all_obj_arr.push(g_undo_details);
					g_undo_all_obj_arr.push(g_cut_copy_arr);
					g_undo_all_obj_arr.previousAction = g_prev_undo_action;
					g_undo_all_obj_arr.clearInfoType = g_clearInfoType;
					if (g_cut_support_obj_arr.length > 0) {
						//yrc
						g_undo_all_obj_arr.hasSupportArr = "Y";
					} else {
						g_undo_all_obj_arr.hasSupportArr = "N";
					}
					g_undo_all_obj_arr.g_MultiObjects = "N";
					g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
					g_undo_final_obj_arr.push(g_undo_all_obj_arr);
					g_delete_details = [];
					g_multi_drag_shelf_arr = [];
					g_multi_drag_item_arr = [];
					g_cut_copy_arr = [];
					g_undo_details = [];
				} else {
					g_delete_details.multi_delete_shelf_ind = "N";
					g_redo_all_obj_arr = [];
					g_redo_all_obj_arr.push(g_undo_details);
					g_redo_all_obj_arr.push(g_cut_copy_arr);
					g_redo_all_obj_arr.previousAction = g_prev_undo_action;
					g_redo_all_obj_arr.clearInfoType = g_clearInfoType;
					if (g_cut_support_obj_arr.length > 0) {
						//yrc
						g_redo_all_obj_arr.hasSupportArr = "Y";
					} else {
						g_redo_all_obj_arr.hasSupportArr = "N";
					}
					g_redo_all_obj_arr.g_MultiObjects = "N";
					g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
					g_redo_final_obj_arr.push(g_redo_all_obj_arr);
					g_delete_details = [];
					g_multi_drag_shelf_arr = [];
					g_multi_drag_item_arr = [];
					g_cut_copy_arr = [];
					g_undo_details = [];
				}
				if (typeof g_clearInfoType !== "undefined" && g_clearInfoType == "Y") {
					if (g_prev_undo_action == "CLEAR_POG_INFO" || g_prev_undo_action == "CLEAR_POG_ATT") {
						if (p_action == "REDO") {
							g_prev_undo_action = last_redo_action();
						} else {
							g_prev_undo_action = await last_action();
						}
					}
				}
			}
			//adding back all the items that were removed when click on clear item.
			if (g_prev_undo_action == "CLEAR_ITEM") {
				var clear_final = [];
				var counter = 0;
				clear_final.push(g_undo_details); //Y0GRAJ

				for (const details of g_delete_details) {
					if (details.Object == "ITEM") {
						$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
							if (modules.MObjID == details.MObjID) {
								g_module_index = i;
							}
						});
						$.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo, function (i, shelfs) {
							if (shelfs.SObjID == details.SObjID) {
								g_shelf_index = i;
							}
						});
						var item_details;
						for (const undo of g_cut_copy_arr) {
							if (details.ObjID == undo.ObjID) {
								item_details = undo;
							}
						}
						g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.push(item_details);
						var shelf_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2;
						var shelfY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
						var res = reset_top_bottom_objects(g_module_index, g_shelf_index, "Y", p_pog_index);
						var return_val = await context_create_items(item_details, g_module_index, g_shelf_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1, shelf_start, "N", shelfY, p_camera, "Y", p_pog_index);

						g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[details.IIndex])));
						var newObjId = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[details.IIndex].ObjID;
						async function doSomething() {
							var res = await fill_undo_detail_arr(newObjId, g_module_index, g_shelf_index, details.IIndex, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType, details.Item, g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID, details.Item, "", "", "", "SHELF");
						}
						doSomething();
						g_deletedItems.push(details.ItemID);
					}
					counter++;
				}
				var res = await deleted_items_log(g_deletedItems, "A", p_pog_index);
				g_delete_details.multi_delete_shelf_ind = "N";
				g_redo_all_obj_arr = [];
				g_redo_all_obj_arr.push(g_undo_details);
				g_redo_all_obj_arr.push(g_cut_copy_arr);
				g_redo_all_obj_arr.previousAction = "CREATE_ITEM";
				if (counter > 1) {
					g_redo_all_obj_arr.g_MultiObjects = "Y";
				} else {
					g_redo_all_obj_arr.g_MultiObjects = "N";
				}
				g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
				g_redo_final_obj_arr.push(g_redo_all_obj_arr);
				g_delete_details = [];
				g_multi_drag_shelf_arr = [];
				g_multi_drag_item_arr = [];
				g_cut_copy_arr = [];
				g_undo_details = [];
				g_redo_all_obj_arr = [];
				g_cut_support_obj_arr = [];
				g_undoRedoAction = p_action;
				render(p_pog_index);
			} else if (g_prev_undo_action == "FACING_CHANGE") {
				if (g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseHoriz !== "" && typeof g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseHoriz !== "undefined") {
					var horiz_facing = g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseHoriz;
					var vert_facing = g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseVert;
					var depth_facing = g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseDepth;
					g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseHoriz = "";
					g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseVert = "";
					g_pog_json[p_pog_index].ModuleInfo[g_incre_mod_index].ShelfInfo[g_incre_shelf_index].ItemInfo[g_incre_item_index].OldItemBaseDepth = "";

					//ASA-1165
					//calling the same function which is used when edit facings. but pass the old value.
					var retval = await update_item_facings(g_incre_mod_index, g_incre_shelf_index, g_incre_item_index, horiz_facing, vert_facing, depth_facing, "VertiFacing", false, "Y", g_world, "Y");
				}
				//currently this DRAG_ITEM logging for undo is only used in update_item_edit_pallet. this function will allow drag of items in edit pallet view
				//and refresh item position in actual view. as we can see the condition only allow comviewindex.
			} else if (g_prev_undo_action == "DRAG_ITEM") {
				if (g_compare_pog_flag == "Y" && g_ComViewIndex == g_curr_canvas) {
					if (g_delete_details.length > 0) {
						if (typeof g_delete_details[0].g_drag_items_arr !== "undefined" && g_compare_view == "EDIT_PALLET") {
							//ASA-1085
							for (const obj of g_delete_details[0].g_drag_items_arr) {
								var i = 0;
								var edit_item_ind = -1;
								for (const items of g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo) {
									if (items.ObjID == obj.ObjID) {
										edit_item_ind = i;
										break;
									}
									i++;
								}
								g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].old_position_x = g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].X;
								g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].old_position_y = g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].Y;
								g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].old_position_z = g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].Z;
								g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].X = obj.old_position_x;
								g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].Y = obj.old_position_y;
								g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].Z = obj.old_position_z;
								var new_x = obj.old_position_x;
								var new_y = obj.old_position_y;
								var new_z = obj.Z;
								var selectObjects = g_scene_objects[g_ComViewIndex].scene.children[2].getObjectById(g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[edit_item_ind].ObjID);
								selectObjects.position.set(obj.old_position_x, obj.old_position_y, obj.Z);
								selectObjects.old_position_x = new_x;
								selectObjects.old_position_y = new_y;
								selectObjects.old_position_z = new_z;
							}
							render(g_ComViewIndex);
							for (const obj of g_delete_details[0].g_drag_items_arr) {
								var item_detail;
								var i = 0;
								var edit_item_ind = -1;
								for (const items of g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo) {
									if (items.ObjID == obj.ObjID) {
										item_detail = items;
										edit_item_ind = i;
										break;
									}
									i++;
								}
								g_temp_cut_arr.push(JSON.parse(JSON.stringify(item_detail)));
								var [mod_ind, shelf_ind, item_ind] = get_item_index(item_detail.ObjID, "C", g_ComBaseIndex);

								g_curr_canvas = 1;
								var old_item_x = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].X;
								var old_item_z = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].Z;
								var shelfs = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
								var items = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind];
								var new_x = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].BaseItemOldX;
								var new_z = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].BaseItemOldZ;
								g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].BaseItemOldX = old_item_x;

								g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].X = new_x;
								var selectObjects = g_scene_objects[g_ComBaseIndex].scene.children[2].getObjectById(g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].ObjID);
								g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].BaseItemOldZ = old_item_z;
								g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].Z = new_z;

								selectObjects.position.x = new_x;
								selectObjects.position.z = new_z;
								g_delete_details[0].BaseItemOldX = old_item_x;
								g_delete_details[0].BaseItemOldZ = old_item_z;
							}
							render(g_ComBaseIndex);
						} else {
							var selectObjects = g_scene_objects[g_ComViewIndex].scene.children[2].getObjectById(g_cut_copy_arr[0].ObjID);
							selectObjects.position.x = g_cut_copy_arr[0].X;
							selectObjects.position.y = g_cut_copy_arr[0].Y;
							g_temp_cut_arr = [];
							g_temp_cut_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_delete_details[0].MIndex].ShelfInfo[g_delete_details[0].SIndex].ItemInfo[g_delete_details[0].IIndex])));
							g_pog_json[g_ComViewIndex].ModuleInfo[g_delete_details[0].MIndex].ShelfInfo[g_delete_details[0].SIndex].ItemInfo[g_delete_details[0].IIndex].X = g_cut_copy_arr[0].X;
							g_pog_json[g_ComViewIndex].ModuleInfo[g_delete_details[0].MIndex].ShelfInfo[g_delete_details[0].SIndex].ItemInfo[g_delete_details[0].IIndex].Y = g_cut_copy_arr[0].Y;
							render(g_ComViewIndex);
							var old_item_x = g_pog_json[p_pog_index].ModuleInfo[g_delete_details[0].mod_ind].ShelfInfo[g_delete_details[0].shelf_ind].ItemInfo[g_delete_details[0].item_ind].X;
							g_pog_json[p_pog_index].ModuleInfo[g_delete_details[0].mod_ind].ShelfInfo[g_delete_details[0].shelf_ind].ItemInfo[g_delete_details[0].item_ind].X = g_delete_details[0].BaseItemOldX;
							var selectObjects = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_delete_details[0].BaseItemObjID);
							var old_item_z = selectObjects.position.z;
							selectObjects.position.x = g_delete_details[0].BaseItemOldX;
							selectObjects.position.z = g_delete_details[0].BaseItemOldZ;
							g_delete_details[0].BaseItemOldX = old_item_x;
							g_delete_details[0].BaseItemOldZ = old_item_z;
							render(p_pog_index);
						}
						g_delete_details.multi_delete_shelf_ind = "N";
						if (p_action == "UNDO") {
							g_redo_all_obj_arr = [];
							g_delete_details[0].g_drag_items_arr = g_temp_cut_arr;
							g_redo_all_obj_arr.push(g_delete_details);
							g_redo_all_obj_arr.previousAction = g_prev_undo_action;
							g_redo_all_obj_arr.hasSupportArr = "N";
							g_redo_all_obj_arr.g_MultiObjects = "Y";
							g_redo_all_obj_arr.g_curr_canvas = g_ComViewIndex;
							g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
							g_redo_final_obj_arr.push(g_redo_all_obj_arr);
						} else {
							g_undo_all_obj_arr = [];
							g_delete_details[0].g_drag_items_arr = g_temp_cut_arr;
							g_undo_all_obj_arr.push(g_delete_details);
							g_undo_all_obj_arr.previousAction = g_prev_undo_action;
							g_undo_all_obj_arr.hasSupportArr = "N";
							g_undo_all_obj_arr.g_MultiObjects = "Y";
							g_undo_all_obj_arr.g_curr_canvas = g_ComViewIndex;
							g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
							g_undo_final_obj_arr.push(g_undo_all_obj_arr);
						}
						g_delete_details = [];
						g_multi_drag_shelf_arr = [];
						g_multi_drag_item_arr = [];
						g_cut_copy_arr = [];
						g_undo_details = [];
						g_temp_cut_arr = [];
						g_redo_all_obj_arr = [];
						g_undo_all_obj_arr = [];
						g_cut_support_obj_arr = [];
						g_undoRedoAction = p_action;
					}
				}
				//this is when maximize facings all is clicked. before processing we store all the items details in the undo log. so we loop through
				//again and reset to old facings.
			} else if (g_prev_undo_action == "MAX_ALL_FACINGS") {
				var finalAction;
				g_undo_details = [];
				cut_copy_arr1 = [];
				if (g_undoRedoAction == "REDO") {
					finalAction = "U";
				} else {
					finalAction = "R";
				}
				if (g_delete_details.length > 0) {
					var temp_cut_arr1 = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo));
					g_temp_cut_arr = [];
					$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
						if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
							var shelfs = modules_info.ShelfInfo;
							$.each(shelfs, function (j, shelfs) {
								if (shelfs.ObjType == "SHELF") {
									$.each(shelfs.ItemInfo, function (k, items) {
										if (typeof g_delete_details[0][i] !== "undefined") {
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].D = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].D;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].BaseD = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].BaseD;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RD = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].D;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].H = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].H;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].BVert = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].BVert;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].Y;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RH = g_delete_details[0][i].ShelfInfo[j].ItemInfo[k].RH;
										} else {
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].D = g_delete_details[i].ShelfInfo[j].ItemInfo[k].D;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].BaseD = g_delete_details[i].ShelfInfo[j].ItemInfo[k].BaseD;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RD = g_delete_details[i].ShelfInfo[j].ItemInfo[k].D;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].H = g_delete_details[i].ShelfInfo[j].ItemInfo[k].H;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].BVert = g_delete_details[i].ShelfInfo[j].ItemInfo[k].BVert;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = g_delete_details[i].ShelfInfo[j].ItemInfo[k].Y;
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RH = g_delete_details[i].ShelfInfo[j].ItemInfo[k].RH;
										}
									});
									reset_auto_crush(i, j, -1, p_pog_index, i, j, p_pog_index); //ASA-1343 issue 1 //ASA-1685
									if (reorder_items(i, j, p_pog_index)) {
										async function recreateItems() {
											var return_val = recreate_all_items(i, j, "SHELF", "N", -1, -1, shelfs.ItemInfo.length, "N", "N", 1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
										}
										var res = recreateItems();
									}
								}
							});
						}
					});

					if (finalAction == "U") {
						g_delete_details.multi_delete_shelf_ind = "N";
						g_undo_all_obj_arr = [];
						g_redo_all_obj_arr = [];
						g_undo_all_obj_arr.push(temp_cut_arr1);
						g_undo_all_obj_arr.push(g_undo_details);
						g_undo_all_obj_arr.previousAction = "MAX_ALL_FACINGS";
						g_undo_all_obj_arr.g_MultiObjects = "Y";
						g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
						g_undo_final_obj_arr.push(g_undo_all_obj_arr);
						g_delete_details = [];
						g_multi_drag_shelf_arr = [];
						g_multi_drag_item_arr = [];
						g_cut_copy_arr = [];
						cut_copy_arr1 = [];
						g_undo_details = [];
						g_mselect_drag = "N";
						g_multiselect = "N";
						g_undo_all_obj_arr = [];
						g_temp_cut_arr = [];
						temp_cut_arr1 = [];
					} else {
						g_delete_details.multi_delete_shelf_ind = "N";
						g_undo_all_obj_arr = [];
						g_redo_all_obj_arr = [];
						g_redo_all_obj_arr.push(temp_cut_arr1);
						g_redo_all_obj_arr.push(g_undo_details);
						g_redo_all_obj_arr.previousAction = "MAX_ALL_FACINGS";
						g_redo_all_obj_arr.g_MultiObjects = "Y";
						g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
						g_redo_final_obj_arr.push(g_redo_all_obj_arr);
						g_delete_details = [];
						g_multi_drag_shelf_arr = [];
						g_multi_drag_item_arr = [];
						g_cut_copy_arr = [];
						cut_copy_arr1 = [];
						g_undo_details = [];
						g_mselect_drag = "N";
						g_multiselect = "N";
						g_redo_all_obj_arr = [];
						g_temp_cut_arr = [];
						temp_cut_arr1 = [];
					}
				}
				//if fixture renumbering is done. we store the setting that was before user changed into g_undo_details and send to undo log.
			} else if (g_prev_undo_action == "FIXTURE_NUMBERING") {
				loc_details = {};
				g_undo_all_obj_arr = [];
				g_redo_all_obj_arr = [];
				g_cut_copy_arr = [];
				if (g_keyCode == 89 || g_keyCode == 90) {
				} else {
					g_redo_all_obj_arr = [];
					g_redo_final_obj_arr = [];
					undoType = "U";
					g_undoRedoAction = "REDO";
				}
				var finalAction;
				if (g_undoRedoAction == "REDO") {
					finalAction = "U";
				} else {
					finalAction = "R";
				}

				loc_details["MODULE_DIR"] = $v("P25_MODULE_DIR");
				loc_details["DIRECTION"] = $v("P25_DIRECTION");
				loc_details["ORDER_TYPE"] = $v("P25_ORDER_TYPE");
				loc_details["START_ONE_MOD"] = $v("P25_START_ONE_MOD");
				loc_details["INCLUDE_MOD_NAME"] = $v("P25_INCLUDE_MOD_NAME");
				loc_details["SEPARATOR"] = $v("P25_SEPARATOR");
				loc_details["LEADING_TEXT"] = $v("P25_LEADING_TEXT");
				loc_details["TRAILING_TEXT"] = $v("P25_TRAILING_TEXT");
				loc_details["START_ONE_FIXEL"] = $v("P25_START_ONE_FIXEL");
				loc_details["START_ONE_MOD_LOC"] = $v("P25_START_ONE_MOD_LOC");
				$s("P25_MODULE_DIR", g_undo_details[0].MODULE_DIR);
				$s("P25_DIRECTION", g_undo_details[0].DIRECTION);
				$s("P25_ORDER_TYPE", g_undo_details[0].ORDER_TYPE);
				$s("P25_START_ONE_MOD", g_undo_details[0].START_ONE_MOD);
				$s("P25_START_ONE_FIXEL", g_undo_details[0].START_ONE_FIXEL);
				$s("P25_START_ONE_MOD_LOC", g_undo_details[0].START_ONE_MOD_LOC);
				$s("P25_INCLUDE_MOD_NAME", g_undo_details[0].INCLUDE_MOD_NAME);
				$s("P25_SEPARATOR", g_undo_details[0].SEPARATOR);
				$s("P25_LEADING_TEXT", g_undo_details[0].LEADING_TEXT);
				$s("P25_TRAILING_TEXT", g_undo_details[0].TRAILING_TEXT);
				if (g_show_fixel_label == "Y") {
					show_fixel_labels("Y", p_pog_index);
				}
				//we set the same page items with old values before fixture renumbering and call the same function.
				fixture_numbering(g_undo_details[0].MODULE_DIR, g_undo_details[0].DIRECTION, g_undo_details[0].IGNORE, g_undo_details[0].ORDER_TYPE, g_undo_details[0].START_ONE_MOD, g_undo_details[0].INCLUDE_MOD_NAME, g_undo_details[0].SEPARATOR, g_undo_details[0].LEADING_TEXT, g_undo_details[0].TRAILING_TEXT, p_pog_index);
				g_cut_copy_arr.push(loc_details);
				loc_details = {};
				if (finalAction == "U") {
					g_delete_details.multi_delete_shelf_ind = "N";
					g_undo_all_obj_arr = [];

					g_undo_all_obj_arr.push(g_cut_copy_arr);
					g_undo_all_obj_arr.push(g_cut_copy_arr);
					g_undo_all_obj_arr.previousAction = "FIXTURE_NUMBERING";
					g_undo_all_obj_arr.hasSupportArr = "N";
					g_undo_all_obj_arr.g_MultiObjects = "N";
					g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
					g_undo_final_obj_arr.push(g_undo_all_obj_arr);
					g_delete_details = [];
					g_multi_drag_shelf_arr = [];
					g_multi_drag_item_arr = [];
					g_cut_copy_arr = [];
					g_undo_details = [];
				} else {
					g_delete_details.multi_delete_shelf_ind = "N";
					g_redo_all_obj_arr = [];
					g_redo_all_obj_arr.push(g_cut_copy_arr);
					g_redo_all_obj_arr.push(g_cut_copy_arr);
					g_redo_all_obj_arr.previousAction = "FIXTURE_NUMBERING";
					g_redo_all_obj_arr.hasSupportArr = "N";
					g_redo_all_obj_arr.g_MultiObjects = "N";
					g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
					g_redo_final_obj_arr.push(g_redo_all_obj_arr);
					g_delete_details = [];
					g_multi_drag_shelf_arr = [];
					g_multi_drag_item_arr = [];
					g_cut_copy_arr = [];
					g_undo_details = [];
				}
				//if location renumbering is done for items. we store the setting that was before user changed into g_undo_details and send to undo log.
			} else if (g_prev_undo_action == "LOCATION_NUMBERING") {
				loc_details = {};
				g_undo_all_obj_arr = [];
				g_redo_all_obj_arr = [];
				if (g_keyCode == 89 || g_keyCode == 90) {
				} else {
					g_redo_all_obj_arr = [];
					g_redo_final_obj_arr = [];
					undoType = "U";
					g_undoRedoAction = "REDO";
				}
				var finalAction;
				if (g_undoRedoAction == "REDO") {
					finalAction = "U";
				} else {
					finalAction = "R";
				}

				loc_details["MODULE_DIR"] = $v("P25_MODULE_DIR");
				loc_details["DIRECTION"] = $v("P25_DIRECTION");
				loc_details["ORDER_TYPE"] = $v("P25_ORDER_TYPE");
				loc_details["START_ONE_FIXEL"] = $v("P25_START_ONE_FIXEL");
				loc_details["START_ONE_MOD_LOC"] = $v("P25_START_ONE_MOD_LOC");
				$s("P25_MODULE_DIR", g_undo_details[0].MODULE_DIR);
				$s("P25_DIRECTION", g_undo_details[0].DIRECTION);
				$s("P25_ORDER_TYPE", g_undo_details[0].ORDER_TYPE);
				$s("P25_START_ONE_FIXEL", g_undo_details[0].START_ONE_FIXEL);
				$s("P25_START_ONE_MOD_LOC", g_undo_details[0].START_ONE_MOD_LOC);
				//we set the same page items with old values before item location renumbering and call the same function.
				location_numbering(g_undo_details[0].MODULE_DIR, g_undo_details[0].DIRECTION, g_undo_details[0].order_type, g_undo_details[0].start_one_fixel, g_undo_details[0].start_one_mod, p_pog_index);

				g_cut_copy_arr.push(loc_details);
				loc_details = {};
				if (finalAction == "U") {
					g_delete_details.multi_delete_shelf_ind = "N";
					g_undo_all_obj_arr = [];

					g_undo_all_obj_arr.push(g_cut_copy_arr);
					g_undo_all_obj_arr.push(g_cut_copy_arr);
					g_undo_all_obj_arr.previousAction = "LOCATION_NUMBERING";
					g_undo_all_obj_arr.hasSupportArr = "N";
					g_undo_all_obj_arr.g_MultiObjects = "N";
					g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
					g_undo_final_obj_arr.push(g_undo_all_obj_arr);
					g_delete_details = [];
					g_multi_drag_shelf_arr = [];
					g_multi_drag_item_arr = [];
					g_cut_copy_arr = [];
					g_undo_details = [];
				} else {
					g_delete_details.multi_delete_shelf_ind = "N";
					g_redo_all_obj_arr = [];
					g_redo_all_obj_arr.push(g_cut_copy_arr);
					g_redo_all_obj_arr.push(g_cut_copy_arr);
					g_redo_all_obj_arr.previousAction = "LOCATION_NUMBERING";
					g_redo_all_obj_arr.hasSupportArr = "N";
					g_redo_all_obj_arr.g_MultiObjects = "N";
					g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
					g_redo_final_obj_arr.push(g_redo_all_obj_arr);
					g_delete_details = [];
					g_multi_drag_shelf_arr = [];
					g_multi_drag_item_arr = [];
					g_cut_copy_arr = [];
					g_undo_details = [];
				}
				//reset item labels because this will show the location id.
				if (g_show_item_label == "Y") {
					show_item_labels("Y", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
				}
				//ASA-1182
				if (g_itemSubLabelInd == "Y") {
					$(".item_sublabel").addClass("item_sublabel_active");
					$("#item_sublbl_sub ." + g_itemSubLabel).addClass("item_sublabel_active");
					showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
				}
				//this undo log will be when select a module and click DELETE. as it is a single object. it will be saved in g_undo_details
			} else if (g_prev_undo_action == "MODULE_DELETE") {
				if (g_undoRedoAction == "UNDO") {
					//
					var undoType = "R";
				} else {
					undoType = "U";
				}

				g_module_index = g_undo_details[0].MIndex;
				g_pog_json[g_undo_details[0].p_pog_index].ModuleInfo.splice(g_undo_details[0].MIndex, 0, g_cut_copy_arr[0]);

				g_pog_json[g_undo_details[0].p_pog_index].ModuleInfo[g_undo_details[0].MIndex].SubDept = g_pog_json[g_undo_details[0].p_pog_index].SubDept;
				var new_h = g_pog_json[g_undo_details[0].p_pog_index].H;
				var new_w = g_pog_json[g_undo_details[0].p_pog_index].W;
				g_pog_json[g_undo_details[0].p_pog_index].H = g_pog_json[g_undo_details[0].p_pog_index].PrevH;
				g_pog_json[g_undo_details[0].p_pog_index].W = g_pog_json[g_undo_details[0].p_pog_index].PrevW;
				g_pog_json[g_undo_details[0].p_pog_index].PrevH = new_h;
				g_pog_json[g_undo_details[0].p_pog_index].PrevW = new_w;

				var shelfArr = g_pog_json[g_undo_details[0].p_pog_index].ModuleInfo[g_undo_details[0].MIndex].ShelfInfo;
				var new_pog_index = g_undo_details[0].p_pog_index;
				var i = 0;
				for (const shelf of shelfArr) {
					var ItemArr = g_pog_json[g_undo_details[0].p_pog_index].ModuleInfo[g_undo_details[0].MIndex].ShelfInfo[i].ItemInfo;
					$.each(ItemArr, function (j, items) {
						g_deletedItems.push(items.ItemID);
					});
					i++;
				}
				await context_create_module(g_cut_copy_arr, p_camera, "Y", new_pog_index, "N");
				await deleted_items_log(g_deletedItems, "A", new_pog_index);
				//we update the redo details with MODULE_CREATE, so it can be deleted when redo.
				await update_undo_details("", "", g_undo_details[0].MIndex, "", "", "", "ITEM", "", "", "N", "", "", "", "", "", "MODULE_CREATE", "", "", "", "", "", undoType, "", "", "", "", g_undo_details[0].p_pog_index);
				//this action is added when doing context paste of module copy or cut/paste.
			} else if (g_prev_undo_action == "MODULE_CREATE") {
				if (g_undoRedoAction == "UNDO") {
					var undoType = "R";
				} else {
					undoType = "U";
				}

				var OLDPOGJSON = JSON.parse(JSON.stringify(g_pog_json));
				g_module_index = g_undo_details[0].MIndex;
				var new_pog_index = g_undo_details[0].p_pog_index;
				//logging for redo or undo will be added in the below function.
				await deleteObject(g_undo_details[0].p_pog_index, "", "N", "Y", g_module_index, undoType); // Task 21828,
				var new_h = g_pog_json[new_pog_index].H;
				var new_w = g_pog_json[new_pog_index].W;
				g_pog_json[new_pog_index].H = g_pog_json[new_pog_index].PrevH;
				g_pog_json[new_pog_index].W = g_pog_json[new_pog_index].PrevW;
				g_pog_json[new_pog_index].PrevH = new_h;
				g_pog_json[new_pog_index].PrevW = new_w;
				//SHELF_DELETE IS -  duplicate, multi drag (same canvas or different canvas), single drag, copy/cut paste, edit location.
				//ITEM_DELETE is -  drag item from product list, edit item, multi drag (same canvas or different canvas), single drag, copy/cut paste
				//spread product context menu, edit facings, multi edit, drag shelf divider
				//SHELF_DRAG - if g_shelf_index == div_shelf_index && curr_module == g_module_index, so no need to delete from other module just set the old position.
				//drag fixel, manage_multi_edit (items block)
			} else if (g_prev_undo_action == "SHELF_DELETE" || g_prev_undo_action == "ITEM_DELETE" || g_prev_undo_action == "SHELF_DRAG") {
				console.log("g_prev_undo_action", g_prev_undo_action);
				var finalAction;
				var g_allUndoObjectsInfo = [];
				var undoObjectsInfo = [];
				infoLogged = "N";
				var p_action;
				if (typeof g_undoRedoAction == "undefined") {
					g_undoRedoAction = "REDO";
				}
				if (g_undoRedoAction == "REDO") {
					finalAction = "U";
				} else {
					finalAction = "R";
				}
				var i = 0;
				//For all actions on item/shelf drag, item/shelf delete, duplicate it can be multi select or single select. all handled in one loop.
				for (sf of g_delete_details) {
					var moduleIndex = sf.moduleIndex;
					var shelfIndex = sf.shelfIndex;
					var actionType = sf.actionType;
					var objectID = sf.objectID;
					var moduleObjID = sf.moduleObjectID;
					var deletedItemsLog = sf.g_deletedItems;
					var itemColorFlag = sf.itemColorFlag;
					var pogInfo = sf.pogInfo;
					var IsCarpark = typeof sf.IsCarpark == "undefined" ? "N" : sf.IsCarpark;
					var CombineInd = typeof sf.CombineInd == "undefined" ? "N" : sf.CombineInd;
					var CombShelfIndex = typeof sf.CombShelfIndex == "undefined" ? -1 : sf.CombShelfIndex;
					if (CombShelfIndex !== -1 && typeof sf[CombShelfIndex] !== "undefined") {
						var shelfInfo = sf[CombShelfIndex];
					} else {
						var shelfInfo = sf[0];
					}

					var supportArr = [];
					//start canvas holds the current canvas index where the object was dropped and presentcanvas hold the old canvas where object was removed.
					var startCanvas = typeof sf.startCanvas == "undefined" ? 1 : sf.startCanvas;
					var presentCanvas = typeof sf.g_present_canvas == "undefined" ? sf.startCanvas : sf.g_present_canvas;
					var undojson = [],
						old_json = [];
					console.log("g_delete_details", g_delete_details, startCanvas, presentCanvas, actionType);
					//undojson will have current json where object was dropped and old_json will have the json where object was removed.
					undojson.push(g_pog_json[startCanvas]);
					old_json.push(g_pog_json[presentCanvas]);
					var new_world, old_world;
					//new_world is the current world where object is present and old_world will have world where object was removed.
					new_world = g_scene_objects[startCanvas].scene.children[2];
					old_world = g_scene_objects[presentCanvas].scene.children[2];

					supportArr = sf.supportArr;
					if (typeof supportArr == "undefined") {
						supportArr = [];
					}

					if (typeof pogInfo !== "undefined" && infoLogged == "N") {
						var pogInfoLog = {};
						pogInfoLog["OldPOGCode"] = undojson[0].POGCode;
						pogInfoLog["OldPOGName"] = undojson[0].Name;
						pogInfoLog["OldPOGDivision"] = undojson[0].Division;
						pogInfoLog["OldPOGDept"] = undojson[0].Dept;
						pogInfoLog["OldPOGSubDept"] = undojson[0].SubDept;
						pogInfoLog["OldEffStartDate"] = undojson[0].EffStartDate;
						undojson[0].POGCode = pogInfo.OldPOGCode;
						undojson[0].Name = pogInfo.OldPOGName;
						undojson[0].Division = pogInfo.OldPOGDivision;
						undojson[0].Dept = pogInfo.OldPOGDept;
						undojson[0].SubDept = pogInfo.OldPOGSubDept;
						undojson[0].EffStartDate = pogInfo.OldEffStartDate;
						infoLogged = "Y";
					}
					if (actionType == "SHELF_DRAG") {
						//when shelf is dragged from one canvas to another we need delete from dropped canvas and create object in old_world.
						if (startCanvas !== presentCanvas) {
							var shelfX = shelfInfo.X;
							var shelfY = shelfInfo.Y;
							var newModuleIndex = -1;
							var newShelfIndex = -1;
							var m = 0;

							for (const mod of old_json[0].ModuleInfo) {
								if (mod.ParentModule == null || mod.ParentModule == "undefined") {
									if (mod.MObjID == moduleObjID) {
										newModuleIndex = m;
									}
									var j = 0;
									for (const undo of mod.ShelfInfo) {
										if (undo.SObjID == objectID) {
											newShelfIndex = j;
											newModuleIndex = m;
											break;
										}
										j = j + 1;
									}
								}
								m++;
							}
							undoObjectsInfo = [];
							undoObjectsInfo.moduleIndex = newModuleIndex;
							undoObjectsInfo.shelfIndex = newShelfIndex;
							undoObjectsInfo.actionType = actionType;
							undoObjectsInfo.module = undojson[0].ModuleInfo[moduleIndex].Module;
							undoObjectsInfo.moduleObjectID = undojson[0].ModuleInfo[moduleIndex].MObjID;
							var oldShelfInfo = old_json[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex];
							var oldShelfInfo1 = old_json[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex];

							undoObjectsInfo.startCanvas = presentCanvas;
							undoObjectsInfo.g_present_canvas = startCanvas;
							//remove from current index of pog and add in old pog json.
							old_json[0].ModuleInfo[newModuleIndex].ShelfInfo.splice(newShelfIndex, 1);
							undojson[0].ModuleInfo[moduleIndex].ShelfInfo.splice(shelfIndex, 0, shelfInfo);
							var newX = -1;
							var newY = -1;
							$.each(shelfInfo.ItemInfo, function (i, items) {
								newX = items.X;
								newY = items.Y;
							});
							var shelfID = -1;
							var s = 0;
							$.each(undojson[0].ModuleInfo[moduleIndex].ShelfInfo, function (i, shelf) {
								if (shelf.SObjID == objectID) {
									shelfID = s;
									return false;
								}
								s++;
							});
							var newUndoObjID = -1;
							//after deleting we need to create the object in old canvas.
							async function create_obj() {
								g_world = new_world;
								var selectObjects = old_world.getObjectById(objectID);
								[return_obj, newObjId] = await create_drag_objects(moduleIndex, shelfID, -1, shelfInfo, shelfInfo.ItemInfo, g_show_live_image, "SHELF", selectObjects, startCanvas, startCanvas);

								old_world.remove(selectObjects);
								selectObjects = return_obj;
								newUndoObjID = newObjId;
								selectObjects.updateMatrix();
								var k = j;
								g_drag_items_arr = [];
								var itemInfo = undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ItemInfo;
								$.each(oldShelfInfo.ItemInfo, function (l, items) {
									var selectedObject = old_world.getObjectById(items.ObjID);
									if (typeof selectedObject !== "undefined") {
										if (g_shelf_object_type !== "PEGBOARD") {
											selectedObject.Distance = items.Distance;
										} else {
											selectedObject.PegBoardX = items.PegBoardX;
											selectedObject.PegBoardY = items.PegBoardY;
										}
										selectedObject.ItemInfo = items;
										selectedObject.IIndex = l;
										selectedObject.StartCanvas = startCanvas;
										selectedObject.MIndex = moduleIndex;
										selectedObject.SIndex = shelfIndex;
										selectedObject.X = items.X;
										selectedObject.Y = items.Y;
										g_drag_items_arr.push(selectedObject);
									}
								});
								var l_temp_arr = [];
								if (g_drag_items_arr.length > 0) {
									var k = 0;
									for (const objects of g_drag_items_arr) {
										k++;
										old_world.remove(objects);
										var [return_obj, newObjID1] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, objects.ShelfInfo, objects.ItemInfo, g_show_live_image, "ITEM", objects, startCanvas, startCanvas);
										return_obj.position.x = objects.X;
										return_obj.position.y = objects.Y;
										return_obj.updateMatrix();
										l_temp_arr.push(return_obj);
									}
									if (l_temp_arr.length > 0) {
										g_drag_items_arr = [];
										g_drag_items_arr = l_temp_arr;
									}
									var res = await set_inter_canvas_items(shelfInfo.X, shelfInfo.Y, selectObjects, l_temp_arr, selectObjects.W, selectObjects.H, g_shelf_object_type, g_shelf_basket_spread, selectObjects.Rotation, selectObjects.ItemSlope, shelfID, moduleIndex, startCanvas);
								}
								oldShelfInfo1.SObjID = newUndoObjID;
								undoObjectsInfo.objectID = newUndoObjID;

								var o = 0;
								var newItems = undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ItemInfo;
								for (const oItems of oldShelfInfo1.ItemInfo) {
									for (const nItems of newItems) {
										if (oItems.ObjID == nItems.OldObjID) {
											oldShelfInfo1.ItemInfo[o].ObjID = nItems.ObjID;
										}
									}
									o++;
								}
								undoObjectsInfo.push(JSON.parse(JSON.stringify(oldShelfInfo1)));
								g_allUndoObjectsInfo.push(undoObjectsInfo);
								undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].NotchLabelObjID = oldShelfInfo.NotchLabelObjID;
								undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].availableSpaceObjID = oldShelfInfo.availableSpaceObjID;
								if (g_show_notch_label == "Y" || g_show_notch_label_comp == "Y") {
									var returnval = update_single_notch_label("Y", moduleIndex, shelfID, $v("P25_NOTCH_HEAD"), "", startCanvas, "N"); //ASA-1292
								}
							}
							var res = await create_obj();
							g_drag_items_arr = [];
						} else {
							//this is the block where the previous canvas and present canvas is same. so no need to delete the shelf. only change the
							//location back to old place.
							var shelfX = shelfInfo.X;
							var shelfY = shelfInfo.Y;
							// var shelfZ = typeof sf.Z != "undefined" ? sf.Z : shelfInfo.Z; //ASA-1652 #9  //ASA-1724
							var shelfZ = typeof sf.Z != "undefined" ? sf.Z : old_world.getObjectById(objectID).position.z; //ASA-1724
							var newModuleIndex = -1;
							var newShelfIndex = -1;
							var mod_name = "";
							var m = 0;
							for (const mod of undojson[0].ModuleInfo) {
								if (mod.ParentModule == null || mod.ParentModule == "undefined") {
									if (mod.MObjID == moduleObjID) {
										newModuleIndex = m;
									}
									var j = 0;
									for (const undo of mod.ShelfInfo) {
										if (undo.SObjID == objectID) {
											newShelfIndex = j;
											newModuleIndex = m;

											break;
										}
										j = j + 1;
									}
								}
								m++;
							}
							undoObjectsInfo = [];
							undoObjectsInfo.moduleIndex = newModuleIndex;
							undoObjectsInfo.shelfIndex = newShelfIndex;
							undoObjectsInfo.actionType = actionType;
							undoObjectsInfo.module = undojson[0].ModuleInfo[newModuleIndex].Module;
							undoObjectsInfo.objectID = objectID;
							undoObjectsInfo.startCanvas = presentCanvas;
							undoObjectsInfo.g_present_canvas = startCanvas;
							undoObjectsInfo.moduleObjectID = undojson[0].ModuleInfo[moduleIndex].MObjID;
							var oldShelfInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex]));
							var shelfObj = new_world.getObjectById(objectID);
							var newItemInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex].ItemInfo));
							var itemInfo = JSON.parse(JSON.stringify(shelfInfo.ItemInfo));
							shelfObj.position.x = shelfX;
							shelfObj.position.y = shelfY;
							shelfObj.Module = undojson[0].ModuleInfo[moduleIndex].Module;
							if (undojson[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex].ObjType == "TEXTBOX") {
								if (typeof shelfZ !== "undefined") {
									undoObjectsInfo.Z = shelfObj.position.z;
									shelfObj.position.z = shelfZ;
									shelfObj.Z = shelfInfo.Z * 100; //ASA-1652 #9
								}
							}
							shelfInfo.SObjID = objectID;
							undojson[0].ModuleInfo[newModuleIndex].ShelfInfo.splice(newShelfIndex, 1);
							//shelfInfo.ItemInfo = newItemInfo;
							shelfInfo.Combine = "N"; //ASA-1272
							undojson[0].ModuleInfo[moduleIndex].ShelfInfo.splice(shelfIndex, 0, shelfInfo);
							var recreate = "N";
							for (const obj of shelfInfo.ItemInfo) {
								for (const items_obj of oldShelfInfo.ItemInfo) {
									if (obj.Item == items_obj.Item && obj.BVert !== items_obj.BVert) {
										recreate = "Y";
									}
								}
							}
							if (recreate == "Y") {
								$.each(shelfInfo.ItemInfo, function (i, items) {
									newX = items.X;
									newY = items.Y;
									undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ItemInfo[i].ObjID = oldShelfInfo.ItemInfo[i].ObjID;
									undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ItemInfo[i].X = newX;
									undojson[0].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ItemInfo[i].Y = newY;
									var selectedItemObj = new_world.getObjectById(oldShelfInfo.ItemInfo[i].ObjID);
									if (typeof selectedItemObj !== "undefined") {
										new_world.remove(selectedItemObj);
									}
								});
								var return_val = recreate_all_items(moduleIndex, shelfIndex, shelfInfo.ObjType, "Y", -1, -1, shelfInfo.ItemInfo.length, "N", "N", -1, -1, startCanvas, "", startCanvas, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
							} else {
								var newX = -1;
								var newY = -1;
								$.each(shelfInfo.ItemInfo, function (i, items) {
									newX = items.X;
									newY = items.Y;
									shelfInfo.ItemInfo[i].ObjID = oldShelfInfo.ItemInfo[i].ObjID;
									shelfInfo.ItemInfo[i].X = newX;
									shelfInfo.ItemInfo[i].Y = newY;
									var selectedItemObj = new_world.getObjectById(oldShelfInfo.ItemInfo[i].ObjID);
									if (typeof selectedItemObj !== "undefined") {
										selectedItemObj.position.y = newY;
										selectedItemObj.position.x = newX;
									}
								});
							}

							undoObjectsInfo.push(JSON.parse(JSON.stringify(oldShelfInfo)));
							g_allUndoObjectsInfo.push(undoObjectsInfo);
							shelfInfo.NotchLabelObjID = oldShelfInfo.NotchLabelObjID;
							if (g_show_notch_label == "Y") {
								var returnval = update_single_notch_label("Y", moduleIndex, shelfIndex, $v("P25_NOTCH_HEAD"), "", presentCanvas, "N"); //ASA-1292
							}
						}
						p_action = "SHELF_DRAG";
						//this is the block for shelf is duplicated and then undo. we need to delete the duplicated shelf.
					} else if (actionType == "DUPLICATE_SHELF") {
						//if redo when we would have deleted the duplicated shelf in undo. so we recreate it in same place.
						if (p_action == "REDO") {
							undojson[0].ModuleInfo[moduleIndex].ShelfInfo.push(shelfInfo);
							var newShelfIndex = -1;
							var k = 0;
							var newShelfInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo));
							for (shelf of newShelfInfo) {
								if (shelf.SObjID == objectID) {
									newShelfIndex = k;
									break;
								}
								k++;
							}
							var shelf = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex]));
							if (supportArr.length > 0) {
								undojson[0].ModuleInfo.push(supportArr[0]);
							}
							var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(shelf, -1, -1, moduleIndex, newShelfIndex, "N", "Y", p_camera, "N", "", "Y", startCanvas);

							var res = await updateObjID(objectID, shelfID);
							var undoObjectsInfo = [];
							if (supportArr.length > 0) {
								undoObjectsInfo.supportArr = supportArr;
							}
							undoObjectsInfo.moduleIndex = moduleIndex;
							undoObjectsInfo.shelfIndex = newShelfIndex;
							undoObjectsInfo.actionType = actionType;
							undoObjectsInfo.objectID = shelfID;
							undoObjectsInfo.startCanvas = startCanvas;
							undoObjectsInfo.module = undojson[0].ModuleInfo[moduleIndex].Module;
							undoObjectsInfo.moduleObjectID = undojson[0].ModuleInfo[moduleIndex].MObjID;
							undoObjectsInfo.push(JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex])));
							g_allUndoObjectsInfo.push(undoObjectsInfo);
							p_action = "SHELF_DELETE";
						} else {
							//remove the shelf from pog_json and the world.
							var undoObjectsInfo = [];
							var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(shelfInfo.X, shelfInfo.Y, "Y", moduleIndex, shelfIndex, shelfInfo, startCanvas);

							var [item_inside_world, curr_module, div_object_type, shelfY, shelfHieght, div_shelf_index, shelf_found] = get_div_shelf_index(shelfInfo.X, shelfInfo.Y, curr_module, "Y", startCanvas, "", false); //ASA-1592
							var newShelfIndex = -1;
							var s = 0;
							$.each(undojson[0].ModuleInfo[moduleIndex].ShelfInfo, function (i, shelf) {
								if (shelf.SObjID == objectID) {
									newShelfIndex = s;
									return false;
								}
								s++;
							});
							var itemInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex].ItemInfo));
							$.each(itemInfo, function (i, items) {
								var selectedItemObj = new_world.getObjectById(items.ObjID);
								new_world.remove(selectedItemObj);
							});
							var selectedObject = new_world.getObjectById(objectID);
							new_world.remove(selectedObject);
							undoObjectsInfo.push(JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex])));
							undojson[0].ModuleInfo[moduleIndex].ShelfInfo.splice(newShelfIndex, 1);
							undoObjectsInfo.moduleIndex = moduleIndex;
							undoObjectsInfo.module = undojson[0].ModuleInfo[moduleIndex].Module;
							undoObjectsInfo.moduleObjectID = undojson[0].ModuleInfo[moduleIndex].MObjID;
							undoObjectsInfo.startCanvas = startCanvas;
							undoObjectsInfo.shelfIndex = newShelfIndex;
							undoObjectsInfo.actionType = actionType;
							undoObjectsInfo.objectID = objectID;
							if (supportArr.length > 0) {
								undoObjectsInfo.supportArr = supportArr;
							}
							g_allUndoObjectsInfo.push(undoObjectsInfo);
							p_action = "SHELF_DELETE";
						}
						//this is block when you have deleted the shelf by selecting he object and click DELETE. we need to recreate the shelf in same place.
					} else if (actionType == "SHELF_DELETE") {
						var selectedObject = new_world.getObjectById(objectID);
						new_world.remove(selectedObject);
						undojson[0].ModuleInfo[moduleIndex].ShelfInfo.splice(shelfIndex, 0, shelfInfo);
						var newShelfIndex = -1;
						var k = 0;
						var newShelfInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo));
						for (shelf of newShelfInfo) {
							if (shelf.SObjID == objectID) {
								newShelfIndex = k;
								break;
							}
							k++;
						}
						var shelf = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex]));
						if (supportArr.length > 0) {
							undojson[0].ModuleInfo.push(supportArr[0]);
						}
						var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(shelf, -1, -1, moduleIndex, newShelfIndex, "N", "Y", p_camera, "N", "", "Y", startCanvas);

						var res = await updateObjID(objectID, shelfID);
						var undoObjectsInfo = [];
						if (supportArr.length > 0) {
							undoObjectsInfo.supportArr = supportArr;
						}
						undoObjectsInfo.moduleIndex = moduleIndex;
						undoObjectsInfo.shelfIndex = newShelfIndex;
						undoObjectsInfo.actionType = actionType;
						undoObjectsInfo.objectID = shelfID;
						undoObjectsInfo.startCanvas = startCanvas;
						undoObjectsInfo.module = undojson[0].ModuleInfo[moduleIndex].Module;
						undoObjectsInfo.moduleObjectID = undojson[0].ModuleInfo[moduleIndex].MObjID;
						undoObjectsInfo.push(JSON.parse(JSON.stringify(undojson[0].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex])));
						g_allUndoObjectsInfo.push(undoObjectsInfo);
						p_action = "SHELF_DELETE_REDO";
						// when item was deleted from the shelf. basically hold the complete shelfinfo in the undo log.
						//we just recreate the shelfinfo from the log. so it will have the deleted item.
					} else if (actionType == "ITEM_DELETE") {
						var newShelfIndex = -1;
						var newModuleIndex = -1;
						var m = 0;
						$.each(undojson[0].ModuleInfo, function (i, modules_info) {
							if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
								if (modules_info.MObjID == moduleObjID) {
									newModuleIndex = m;
									return false;
								}
							}
							m++;
						});
						var s = 0;
						$.each(undojson[0].ModuleInfo[newModuleIndex].ShelfInfo, function (i, shelf) {
							if (shelf.SObjID == objectID) {
								newShelfIndex = s;
								return false;
							}
							s++;
						});
						var undoObjectsInfo = [];
						var oldShelfInfo = [];
						if (IsCarpark == "Y") {
							newShelfIndex = 0;
							if (undojson[0].ModuleInfo[newModuleIndex].Carpark.length == 0) {
								var details = get_min_max_xy(startCanvas);
								var details_arr = details.split("###");
								for (const parkitems of shelfInfo.ItemInfo) {
									max_depth = Math.max(max_depth, parkitems.D);
								}
								carpark_shelf(newModuleIndex + 1, undojson[0].ModuleInfo[newModuleIndex].W, 0.04, max_depth + 0.1, undojson[0].ModuleInfo[newModuleIndex].X, parseFloat(details_arr[1]) + 0.03, newModuleIndex);
							}
							oldShelfInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[newModuleIndex].Carpark[newShelfIndex]));
							undoObjectsInfo.push(JSON.parse(JSON.stringify(oldShelfInfo)));
							itemInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[newModuleIndex].Carpark[newShelfIndex].ItemInfo));
						} else {
							oldShelfInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex]));
							itemInfo = JSON.parse(JSON.stringify(undojson[0].ModuleInfo[newModuleIndex].ShelfInfo[newShelfIndex].ItemInfo));
						}
						undoObjectsInfo.moduleIndex = newModuleIndex;
						undoObjectsInfo.shelfIndex = newShelfIndex;
						undoObjectsInfo.actionType = actionType;
						undoObjectsInfo.IsCarpark = IsCarpark;
						undoObjectsInfo.pogInfo = pogInfoLog;
						undoObjectsInfo.startCanvas = startCanvas;
						undoObjectsInfo.module = undojson[0].ModuleInfo[newModuleIndex].Module;
						undoObjectsInfo.moduleObjectID = undojson[0].ModuleInfo[newModuleIndex].MObjID;
						if (supportArr.length > 0) {
							undoObjectsInfo.supportArr = supportArr;
						}

						$.each(itemInfo, function (i, items) {
							var selectedItemObj = new_world.getObjectById(items.ObjID);
							new_world.remove(selectedItemObj);
						});
						var selectedObject = new_world.getObjectById(objectID);
						new_world.remove(selectedObject);

						if (supportArr.length > 0) {
							undojson[0].ModuleInfo[newModuleIndex].ShelfInfo.push(supportArr[0]);
						}

						var newItemInfo = [];
						if (IsCarpark == "Y") {
							undojson[0].ModuleInfo[newModuleIndex].Carpark.splice(newShelfIndex, 1, shelfInfo);
							var shelfID = await create_shelf_edit_pog(newModuleIndex, undojson[0].ModuleInfo[newModuleIndex].Carpark, width, "Y", "Y", "D", "Y", "Y", "Y", p_pog_index, p_pog_index);
						} else {
							g_world = g_scene_objects[startCanvas].scene.children[2];
							//this block is used to add the shelfinfo before undo to set for redo or viceversa. if the item was in combine shelf.
							//we need to hold all the shelfs in the combine in undo log.
							if (CombineInd == "Y") {
								var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfInfo.Shelf);
								if (currCombinationIndex !== -1) {
									undoObjectsInfo.CombineInd = "Y";
									undoObjectsInfo.CombShelfIndex = currShelfCombIndx;
									currCombination = g_combinedShelfs[currCombinationIndex];
									if (currCombination.length > 1) {
										var p = 0;
										for (obj of currCombination) {
											var m = 0;
											var new_mod_index = -1;
											var new_shelf_index = -1;
											$.each(undojson[0].ModuleInfo, function (i, modules_info) {
												if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
													if (modules_info.MObjID == g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].MObjID) {
														new_mod_index = m;
														return false;
													}
												}
												m++;
											});
											var s = 0;
											$.each(undojson[0].ModuleInfo[new_mod_index].ShelfInfo, function (i, shelf) {
												if (shelf.SObjID == g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].SObjID) {
													new_shelf_index = s;
													return false;
												}
												s++;
											});
											var item_Info = undojson[0].ModuleInfo[new_mod_index].ShelfInfo[new_shelf_index].ItemInfo;
											$.each(item_Info, function (i, items) {
												var selectedItemObj = new_world.getObjectById(items.ObjID);
												new_world.remove(selectedItemObj);
											});
											undoObjectsInfo.push(JSON.parse(JSON.stringify(undojson[0].ModuleInfo[new_mod_index].ShelfInfo[new_shelf_index])));
											undojson[0].ModuleInfo[new_mod_index].ShelfInfo.splice(new_shelf_index, 1, sf[p]);

											p++;
										}
									}
								}
							} else {
								undojson[0].ModuleInfo[newModuleIndex].ShelfInfo.splice(newShelfIndex, 1, shelfInfo);
							}
							//the recreate_all_items function is already handled with looping through all combine shelfs. so we just call this function.
							var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(shelfInfo, -1, -1, newModuleIndex, newShelfIndex, "N", "Y", p_camera, "Y", startCanvas, "Y", startCanvas);
						}
						oldShelfInfo.ItemInfo = itemInfo;
						var res = await updateObjID(objectID, shelfID, "S");
						if (g_compare_view == "EDIT_PALLET") {
							//ASA-1085
							if (objectID == g_edit_pallet_shelfid) {
								g_edit_pallet_shelfid = shelfID;
							}
						}

						undoObjectsInfo.objectID = shelfID;
						if (CombineInd == "N") {
							undoObjectsInfo.push(JSON.parse(JSON.stringify(oldShelfInfo)));
						} else {
							for (obj of undoObjectsInfo) {
								if (obj.MIndex == newModuleIndex && obj.SIndex == newShelfIndex) {
									obj.SObjID = shelfID;
								}
							}
						}
						g_allUndoObjectsInfo.push(undoObjectsInfo);
						p_action = "ITEM_DELETE";
						render(startCanvas);
						var res = await calculateFixelAndSupplyDays("N", startCanvas);
					}
				}
				if ($(".item_label").hasClass("item_label_active")) {
					g_show_item_label = "Y";
				}
				if (actionType !== "SHELF_DRAG" && actionType !== "SHELF_DELETE") {
					var res = await calculateFixelAndSupplyDays("N", startCanvas); //commented to check the error occuring please need to uncomment after fix -prasnna
				}
				//we need to reset deleted log. because to update the product list removed items background color.
				if (typeof deletedItemsLog !== "undefined") {
					if (typeof itemColorFlag == "undefined" || itemColorFlag == "G") {
						itemColorFlag = "R";
						await deleted_items_log(deletedItemsLog, "A", startCanvas);
					} else {
						itemColorFlag = "G";

						await deleted_items_log(deletedItemsLog, "D", startCanvas);
					}
					undoObjectsInfo.g_deletedItems = deletedItemsLog;
				}

				undoObjectsInfo.itemColorFlag = itemColorFlag;
				logFinalUndoObjectsInfo(p_action, finalAction, g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
				g_allUndoObjectsInfo = [];
				pogInfoLog = {};
				infoLogged = "N";
				if (g_compare_pog_flag == "Y" && g_compare_view !== "POG" && g_curr_canvas == 1) {
					var returnval = await recreate_compare_views(g_compare_view, "N");
				}
				render(g_pog_index);
				animate_all_pog();
				//this below block is for redo. when shelf delete or item delete undo is done. we set the undo_action as REDO.
			} else if (g_prev_undo_action == "SHELF_DELETE_REDO" || g_prev_undo_action == "ITEM_DELETE_REDO") {
				var finalAction;
				var g_allUndoObjectsInfo = [];
				if (typeof g_undoRedoAction == "undefined") {
					g_undoRedoAction = "REDO";
				}
				if (g_undoRedoAction == "REDO") {
					finalAction = "U";
				} else {
					finalAction = "R";
				}
				var i = 0;
				for (sf of g_delete_details) {
					var moduleIndex = sf.moduleIndex;
					var shelfIndex = sf.shelfIndex;
					var shelfInfo = sf[0];
					var actionType = sf.actionType;
					var objectID = sf.objectID;
					var deletedItemsLog = sf.g_deletedItems;
					var itemColorFlag = sf.itemColorFlag;
					var pogInfo = sf.pogInfo;
					var supportArr = [];
					//start canvas holds the current canvas index where the object was dropped and presentcanvas hold the old canvas where object was removed.
					var startCanvas = typeof sf.startCanvas == "undefined" ? 1 : sf.startCanvas;
					var presentCanvas = typeof sf.g_present_canvas == "undefined" ? sf.startCanvas : sf.g_present_canvas;
					var undojson = g_pog_json;
					var old_json = g_pog_json;
					//new_world is the current world where object is present and old_world will have world where object was removed.
					var new_world = g_scene_objects[startCanvas].scene.children[2];
					var old_world = g_scene_objects[presentCanvas].scene.children[2];
					supportArr = sf.supportArr;
					if (typeof supportArr == "undefined") {
						supportArr = [];
					}
					if (typeof deletedItemsLog !== "undefined") {
						if (typeof itemColorFlag == "undefined" || itemColorFlag == "G") {
							itemColorFlag = "R";
							let dellog = deleted_items_log(deletedItemsLog, "A", p_pog_index);
						} else {
							itemColorFlag = "G";
							let dellog = deleted_items_log(deletedItemsLog, "D", p_pog_index);
						}
					}
					//SHELF_DELETE0 is not used any where so we can remove this block.
					if (actionType == "SHELF_DELETE0") {
						var shelfObjId = undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].SObjID;
						var shelfObjType = undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ObjType;
						var itemInfo = undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex].ItemInfo;
						var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(shelfInfo.X, shelfInfo.Y, "Y", moduleIndex, shelfIndex, shelfInfo, p_pog_index);

						var [item_inside_world, curr_module, div_object_type, shelfY, shelfHieght, div_shelf_index, shelf_found] = get_div_shelf_index(shelfInfo.X, shelfInfo.Y, curr_module, "Y", p_pog_index, "", false); //ASA-1592);
						var undoObjectsInfo = [];
						undoObjectsInfo.moduleIndex = moduleIndex;
						undoObjectsInfo.shelfIndex = shelfIndex;
						undoObjectsInfo.actionType = actionType;
						undoObjectsInfo.objectID = objectID;
						undoObjectsInfo.module = undojson[p_pog_index].ModuleInfo[moduleIndex].Module;
						undoObjectsInfo.moduleObjectID = undojson[p_pog_index].ModuleInfo[moduleIndex].MObjID;
						undoObjectsInfo.startCanvas = startCanvas;
						undoObjectsInfo.push(JSON.parse(JSON.stringify(undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo[shelfIndex])));
						g_allUndoObjectsInfo.push(undoObjectsInfo);
						undojson[p_pog_index].ModuleInfo[curr_module].ShelfInfo.splice(shelfIndex, 0, shelfInfo);
						//redo for shelf drag is we put the shelf into the new position where user dragged and did undo.
					} else if (actionType == "SHELF_DRAG") {
						var shelfX = shelfInfo.X;
						var shelfY = shelfInfo.Y;
						var shelfObj = new_world.getObjectById(shelfInfo.SObjID);
						var itemInfo = shelfInfo.ItemInfo;
						var notch_objid = shelfInfo.NotchLabelObjID;
						var availableSpace_objid = shelfInfo.availableSpaceObjID;
						//set the position of the shelf and blow set all the items also.
						shelfObj.position.x = shelfX;
						shelfObj.position.y = shelfY;
						var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(shelfInfo.X, shelfInfo.Y, "Y", moduleIndex, shelfIndex, shelfInfo, p_pog_index);
						var [item_inside_world, curr_module, div_object_type, shelfY, shelfHieght, div_shelf_index, shelf_found] = get_div_shelf_index(shelfInfo.X, shelfInfo.Y, curr_module, "Y", p_pog_index, "", false); //ASA-1592);

						var j = 0;
						for (const undo of undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo) {
							if (shelfInfo.SObjID == undo.SObjID) {
								shelfIndex = j;
								break;
							}
							j = j + 1;
						}
						undojson[p_pog_index].ModuleInfo[curr_module].ShelfInfo.splice(shelfIndex, 1);
						undojson[p_pog_index].ModuleInfo[curr_module].ShelfInfo.splice(div_shelf_index, 0, shelfInfo);

						$.each(itemInfo, function (i, items) {
							var selectedItemObj = new_world.getObjectById(items.ObjID);
							selectedItemObj.position.y = items.Y;
							selectedItemObj.position.x = items.X;
							undojson[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[i].X = items.X;
							undojson[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[i].Y = items.Y;
						});
						undojson[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].NotchLabelObjID = notch_objid;
						if (g_show_notch_label == "Y") {
							var returnval = update_single_notch_label("Y", curr_module, div_shelf_index, $v("P25_NOTCH_HEAD"), "", p_pog_index, "N"); //ASA-1292
						}
						//in undo action we created the shelf in the position where it was already. now in redo we delete that shelf.
					} else if (actionType == "SHELF_DELETE") {
						var undoObjectsInfo = [];
						var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(shelfInfo.X, shelfInfo.Y, "Y", moduleIndex, shelfIndex, shelfInfo, p_pog_index);
						var [item_inside_world, curr_module, div_object_type, shelfY, shelfHieght, div_shelf_index, shelf_found] = get_div_shelf_index(shelfInfo.X, shelfInfo.Y, curr_module, "Y", p_pog_index, "", false); //ASA-1592);
						var newShelfIndex = -1;
						var s = 0;
						$.each(undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo, function (i, shelf) {
							if (shelf.SObjID == objectID) {
								newShelfIndex = s;
								return false;
							}
							s++;
						});
						var itemInfo = JSON.parse(JSON.stringify(undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex].ItemInfo));
						$.each(itemInfo, function (i, items) {
							var selectedItemObj = new_world.getObjectById(items.ObjID);
							new_world.remove(selectedItemObj);
						});
						//remove from new_world.
						var selectedObject = new_world.getObjectById(objectID);
						new_world.remove(selectedObject);
						undoObjectsInfo.push(JSON.parse(JSON.stringify(undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo[newShelfIndex])));
						undojson[p_pog_index].ModuleInfo[moduleIndex].ShelfInfo.splice(newShelfIndex, 1);
						render(presentCanvas);
						undoObjectsInfo.moduleIndex = moduleIndex;
						undoObjectsInfo.module = undojson[p_pog_index].ModuleInfo[moduleIndex].Module;
						undoObjectsInfo.moduleObjectID = undojson[p_pog_index].ModuleInfo[moduleIndex].MObjID;
						undoObjectsInfo.startCanvas = startCanvas;
						undoObjectsInfo.shelfIndex = newShelfIndex;
						undoObjectsInfo.actionType = actionType;
						undoObjectsInfo.objectID = objectID;
						if (supportArr.length > 0) {
							undoObjectsInfo.supportArr = supportArr;
						}
						g_allUndoObjectsInfo.push(undoObjectsInfo);
					}
				}
				if ($(".item_label").hasClass("item_label_active")) {
					g_show_item_label = "Y";
				}
				if (g_compare_pog_flag == "Y" && g_compare_view !== "POG" && g_curr_canvas == 1) {
					var returnval = await recreate_compare_views(g_compare_view, "N");
				}
				undoObjectsInfo.g_deletedItems = deletedItemsLog;
				undoObjectsInfo.itemColorFlag = itemColorFlag;
				logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
				g_allUndoObjectsInfo = [];
				var res = await calculateFixelAndSupplyDays("N", p_pog_index);
				//end of g_prev_undo_action == "SHELF_DELETE_REDO" || g_prev_undo_action == "ITEM_DELETE_REDO"
				//this block comes when you create a new shelf then undo delete it.
			} else if (g_prev_undo_action == "CREATE_SHELF") {
				context_delete("DELETE", g_undo_details[0].MIndex, g_undo_details[0].SIndex, "", "", "", "Y", g_undo_details[0].SObjID, "", g_undo_details, p_camera, p_pog_index, "N");
			}
			//if we reverse the action from user. if ON then we OFF and viceversa.
			if (g_prev_undo_action == "ITEM_LABEL") {
				g_show_item_label = g_undo_details[0].show_item_labels;

				show_item_labels(g_show_item_label, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
				if (g_show_item_label == "Y") {
					g_show_item_label = "N";
					$(".item_label").addClass("item_label_active");
				} else {
					g_show_item_label = "N";
					$(".item_label").removeClass("item_label_active");
				}
			}
			//if we reverse the action from user. if ON then we OFF and viceversa.
			if (g_prev_undo_action == "ITEM_SALE_LABEL") {
				g_itemSubLabelInd = g_undo_details[0].item_sale_label_ind;
				g_itemSubLabel = g_undo_details[0].item_sale_label_type;

				showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
				if (g_itemSubLabelInd == "Y") {
					$(".item_sublabel").addClass("item_sublabel_active");
					$("#item_sublbl_sub ." + g_itemSubLabel).addClass("item_sublabel_active");
				} else {
					$(".item_sublabel").removeClass("item_sublabel_active");
					$("#item_sublbl_sub .items").removeClass("item_sublabel_active");
				}
			}
			//if we reverse the action from user. if ON then we OFF and viceversa.
			if (g_prev_undo_action == "FIXEL_LABEL") {
				g_show_fixel_label = g_undo_details[0].show_fixel_labels;
				show_fixel_labels(g_show_fixel_label, p_pog_index);
				if (g_show_fixel_label == "Y") {
					g_show_fixel_label = "N";
					$(".fixel_label").addClass("fixel_label_active");
				} else {
					g_show_fixel_label = "Y";
					$(".fixel_label").removeClass("fixel_label_active");
				}
			}
			//if we reverse the action from user. if ON then we OFF and viceversa.
			if (g_prev_undo_action == "NOTCH_LABEL") {
				g_show_notch_label = g_undo_details[0].show_notch_labels;
				show_notch_labels(g_show_notch_label, $v("P25_NOTCH_HEAD"), "Y", p_pog_index);
				if (g_show_notch_label == "Y") {
					$(".notch_label").addClass("notch_label_active");
				} else {
					$(".notch_label").removeClass("notch_label_active");
				}
			}
			//if we reverse the action from user. if ON then we OFF and viceversa.
			if (g_prev_undo_action == "MAX_MERCH") {
				g_show_max_merch = g_undo_details[0].g_show_max_merch;
				add_merch(g_show_max_merch, p_pog_index);
				if (g_show_max_merch == "Y") {
					g_show_max_merch = "N";
					$(".fixel_merch").addClass("max_merch_active");
				} else {
					g_show_max_merch = "N";
					$(".fixel_merch").removeClass("max_merch_active");
				}
			}

			g_prev_undo_action = "";
			g_undo_details = [];
			g_undo_obj_arr = [];
			g_cut_copy_arr = [];
			g_cut_support_obj_arr = [];
			g_delete_details = [];
			g_multi_drag_shelf_arr = [];
			g_multi_drag_item_arr = [];
			g_keyCode = 0;
			render(p_pog_index);
			if (g_compare_pog_flag == "Y" && g_compare_view !== "POG" && g_ComViewIndex !== g_curr_canvas) {
				var returnval = await recreate_compare_views(g_compare_view, "N");
			}
		}
		logDebug("function : undo_actions_not_delete", "E");
		removeLoadingIndicator(regionloadWait);
		return "SUCCESS";
	} catch (err) {
		error_handling(err);
		removeLoadingIndicator(regionloadWait);
	}
}

//this function is not used anywhere can confirm and remove.
function set_ig_item_color(p_details, p_pog_index) {
	logDebug("function : set_ig_item_color", "S");
	var item_exists = "N";
	var module_details = g_pog_json[p_pog_index].ModuleInfo;
	$.each(module_details, function (j, Modules) {
		if (item_exists == "Y") {
			return false;
		}
		if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
			$.each(Modules.ShelfInfo, function (k, Shelf) {
				if (item_exists == "Y") {
					return false;
				}
				if (typeof Shelf !== "undefined") {
					if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
						$.each(Shelf.ItemInfo, function (k, items) {
							if (items.Item == p_details.Item) {
								item_exists = "Y";
								return false;
							}
						});
					}
				}
			});
		}
	});
	logDebug("function : set_ig_item_color", "E");
}

//this function only used in undo_actions_not_delete and deleteWorldObject to update the undo redo global array g_undo_final_obj_arr, g_redo_final_obj_arr.
async function update_undo_details(p_itemCode, p_objID, p_moduleIndex, p_shelfIndex, p_itemIndex, p_objType, p_object, p_moduleObjID, p_shelfObjID, p_itemID, p_itemExists, p_oldSpreadProduct, p_xAxis, p_yAxis, p_zAxis, p_undo_action, p_old_object, p_support_obj, p_newModIndex, p_newShelfIndex, p_newItemIndex, p_actionType, p_horiz_facing, p_vert_facing, p_depth_facing, p_fieldName, p_pog_index) {
	logDebug("function : update_undo_details; ItemCode : " + p_itemCode + "; ObjID : " + p_objID + "; ModuleIndex : " + p_moduleIndex + "; ShelfIndex : " + p_shelfIndex + "; ItemIndex : " + p_itemIndex + "; ObjType : " + p_objType + "; ModuleObjID : " + p_moduleObjID + "; ShelfObjID : " + p_shelfObjID + "; ItemID : " + p_itemID + "; ItemExists : " + p_itemExists + "; XAxis : " + p_xAxis + "; YAxis : " + p_yAxis + "; ZAxis : " + p_zAxis + "; undo_action : " + p_undo_action + "; NewModIndex : " + p_newModIndex + "; NewShelfIndex : " + p_newShelfIndex + "; NewItemIndex : " + p_newItemIndex + "; actionType : " + p_actionType + "; horiz_facing : " + p_horiz_facing + "; vert_facing : " + p_vert_facing + "; depth_facing : " + p_depth_facing + "; fieldName : " + p_fieldName, "S");
	if (g_keyCode == 89 || g_keyCode == 90) {
	} else {
		g_redo_all_obj_arr = [];
		g_redo_final_obj_arr = [];
		p_actionType = "U";
		g_undoRedoAction = "REDO";
	}

	try {
		backupPog("F", -1, -1, p_pog_index);

		var details = {};
		var is_divider = "N";
		g_undo_details = [];
		g_cut_copy_arr = [];
		g_cut_support_obj_arr = [];
		g_redo_all_obj_arr = [];
		g_undo_all_obj_arr = [];
		undo_action_pre = p_undo_action;
		if (undo_action_pre == "ITEM_DELETE" && p_old_object == "") {
		} else if (undo_action_pre == "SHELF_DELETE" || undo_action_pre == "CREATE_SHELF") {
			g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex])));
		} else if (undo_action_pre == "MODULE_DELETE" || undo_action_pre == "MODULE_CREATE") {
			g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex])));
		}
		if (p_itemCode == "DIVIDER") {
			is_divider = "Y";
		}
		details["ObjID"] = p_objID;
		details["MIndex"] = p_moduleIndex;
		details["SIndex"] = p_shelfIndex;
		details["IIndex"] = p_itemIndex;
		details["ObjType"] = p_objType;
		details["IsDivider"] = is_divider;
		details["Object"] = p_object;
		details["MObjID"] = p_moduleObjID;
		details["SObjID"] = p_shelfObjID;
		details["ItemID"] = p_itemID;
		details["Exists"] = p_itemExists;
		details["OldSpreadProduct"] = p_oldSpreadProduct;
		details["XAxis"] = p_xAxis;
		details["YAxis"] = p_yAxis;
		details["ZAxis"] = p_zAxis;
		details["NewModIndex"] = p_newModIndex;
		details["NewShelfIndex"] = p_newShelfIndex;
		details["NewItemIndex"] = p_newItemIndex;
		details["Item"] = p_itemCode;
		details["ShelfObjType"] = g_shelf_object_type;
		details["horiz_facing"] = p_horiz_facing;
		details["vert_facing"] = p_vert_facing;
		details["depth_facing"] = p_depth_facing;
		details["fieldName"] = p_fieldName;
		details["p_pog_index"] = p_pog_index;
		if (p_actionType == "U") {
			//logging for undo process
			g_undo_details.push(details);
			g_undo_all_obj_arr.push(g_undo_details);
			g_undo_all_obj_arr.push(g_cut_copy_arr);
			if (p_old_object !== "") {
				g_cut_copy_arr.push(JSON.parse(JSON.stringify(p_old_object)));
				g_undo_all_obj_arr.push(g_undo_obj_arr);
			}
			if (p_support_obj !== "") {
				g_undo_supp_obj_arr.push(p_support_obj);
				g_undo_all_obj_arr.push(g_undo_supp_obj_arr);
			}
			if (p_support_obj !== "") {
				//YRC
				g_undo_all_obj_arr.hasSupportArr = "Y";
			} else {
				g_undo_all_obj_arr.hasSupportArr = "N";
			}
			g_undo_all_obj_arr.previousAction = undo_action_pre;
			g_undo_all_obj_arr.g_MultiObjects = "N";
			g_undo_final_obj_arr.push(g_undo_all_obj_arr);
			g_undo_all_obj_arr = [];
			g_undo_details = [];
			g_cut_copy_arr = [];
		} else if (p_actionType == "R") {
			if (p_support_obj !== "") {
				//YRC
				g_undo_all_obj_arr.hasSupportArr = "Y";
			} else {
				g_undo_all_obj_arr.hasSupportArr = "N";
			}
			//logging for redo process
			g_undo_details.push(details);
			g_redo_all_obj_arr.push(g_undo_details);
			g_redo_all_obj_arr.push(g_cut_copy_arr);
			if (p_old_object !== "") {
				g_cut_copy_arr.push(JSON.parse(JSON.stringify(p_old_object)));
				g_redo_all_obj_arr.push(g_undo_obj_arr);
			}
			if (p_support_obj !== "") {
				g_redo_supp_obj_arr.push(p_support_obj);
				g_redo_all_obj_arr.push(g_redo_supp_obj_arr);
			}
			g_redo_all_obj_arr.previousAction = p_undo_action;
			g_redo_all_obj_arr.g_MultiObjects = "N";
			g_redo_final_obj_arr.push(g_redo_all_obj_arr);
			g_redo_all_obj_arr = [];
			g_undo_details = [];
			g_cut_copy_arr = [];
		}
		logDebug("function : update_undo_details", "E");
		return "SUCCESS";
	} catch (err) {
		error_handling(err);
	}
}

async function export_temp() {
	logDebug("function : export_temp", "S");
	try {
		if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
			if (typeof g_pog_json[g_pog_index] !== "undefined") {
				await set_shelf_item_index(g_pog_index);
				await save_pog_to_json([g_pog_json[g_pog_index]]);
				sessionStorage.setItem("export_index", g_pog_index);
				var l_url = "f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=EXPORT_TEMP:NO::AI_RANDOM_STRING,AI_POG_CODE,AI_POG_VERSION:" + new Date().getTime() + "," + g_pog_json[g_pog_index].POGCode + "," + g_pog_json[g_pog_index].Version;
				const a = document.createElement("a");
				a.href = l_url;
				a.download = get_message("POGCR_HEAD_TEMP_NAME") + ".xlsx";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}
		}
		logDebug("function : export_temp", "E");
	} catch (err) {
		error_handling(err);
		removeLoadingIndicator(regionloadWait);
	}
}

function import_temp() {
	logDebug("function : import_temp", "S");
	async function doSomething() {
		try {
			var upld_index = sessionStorage.getItem("export_index");
			if (upld_index == null && g_pog_json.length > 1) {
				alert(get_message("POGCR_IMP_ALERT"));
			} else {
				if (upld_index !== null && g_pog_json.length > 1) {
					await set_shelf_item_index(upld_index);
					await save_pog_to_json([g_pog_json[upld_index]]);
				} else {
					await set_shelf_item_index(g_pog_index);
					await save_pog_to_json(g_pog_json);
				}
			}
		} catch (err) {
			error_handling(err);
		}
	}

	doSomething();
	//$("#P25_IMPORT_TEMPLATE").click();
	$("[name =P25_IMPORT_TEMPLATE]").click();
	logDebug("function : import_temp", "E");
}
function set_item_details(p_items, p_module_index, p_shelf_index, p_item_index, p_item_x, p_item_y) {
	logDebug("function : set_item_details; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; item_x : " + p_item_x + "; item_y : " + p_item_y, "S");
	var ItemInfo = {};
	ItemInfo["ItemID"] = p_items.Item;
	ItemInfo["Item"] = p_items.Item;
	ItemInfo["CType"] = g_pog_json[g_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType; 
	ItemInfo["W"] = p_items.W;
	ItemInfo["H"] = p_items.H;
	ItemInfo["D"] = p_items.D;
	ItemInfo["Color"] = $v("P25_POG_ITEM_DEFAULT_COLOR");
	ItemInfo["DimT"] = "U";
	ItemInfo["Desc"] = p_items.Desc;
	ItemInfo["Barcode"] = p_items.Barcode;  
	ItemInfo["LocID"] = "";
	ItemInfo["PegID"] = "";
	ItemInfo["PegSpread"] = "";
	ItemInfo["PegPerFacing"] = "";
	ItemInfo["Fixed"] = "N";
	ItemInfo["CapStyle"] = "0";
	ItemInfo["CapMaxH"] = 0;
	ItemInfo["MaxHCapStyle"] = "3";
	ItemInfo["Rotation"] = 0;
	ItemInfo["BHoriz"] = 1;
	ItemInfo["BVert"] = 1;
	ItemInfo["BaseD"] = 1;
	ItemInfo["CrushHoriz"] = 0;
	ItemInfo["CrushVert"] = 0;
	ItemInfo["CrushD"] = 0;
	ItemInfo["Orientation"] = p_items.Orientation;
	ItemInfo["MerchStyle"] = "0";
	ItemInfo["Supplier"] = p_items.Supplier;
	if (p_items.Supplier !== "undefined" && p_items.Supplier !== "") {
		var itemsupp = p_items.Supplier.split("-");
		ItemInfo["SupplierName"] = itemsupp[1];
	} else {
		ItemInfo["SupplierName"] = "";
	}
	ItemInfo["Brand"] = p_items.Brand;
	ItemInfo["Group"] = p_items.Group;
	ItemInfo["Dept"] = p_items.Dept;
	var itemdept = p_items.Dept.split("-"); //ASA-1222-S
	var itemclass = p_items.Class.split("-");
	var itemsubclass = p_items.SubClass.split("-");
	ItemInfo["Class"] = p_items.Class;
	ItemInfo["ClassName"] = itemdept[0] + "/" + itemclass[0] + "/" + itemsubclass[0]; //ASA-1222-E
	ItemInfo["SubClass"] = p_items.SubClass;
	ItemInfo["StdUOM"] = p_items.StdUOM;
	ItemInfo["SizeDesc"] = p_items.SizeDesc;
	ItemInfo["Price"] = p_items.Price;
	ItemInfo["Cost"] = p_items.Cost;
	ItemInfo["RegMovement"] = p_items.RegMovement;
	ItemInfo["MoveBasis"] = p_items.MoveBasis;
	ItemInfo["Exists"] = "N";
	ItemInfo["CHPerc"] = p_items.OrgCHPerc;
	ItemInfo["CWPerc"] = p_items.OrgCWPerc;
	ItemInfo["CDPerc"] = p_items.OrgCDPerc;
	ItemInfo["CnW"] = p_items.OrgCnW;
	ItemInfo["CnH"] = p_items.OrgCnH;
	ItemInfo["CnD"] = p_items.OrgCnD;
	ItemInfo["NW"] = p_items.OrgNW;
	ItemInfo["NH"] = p_items.OrgNH;
	ItemInfo["ND"] = p_items.OrgND;
	ItemInfo["OldCnW"] = p_items.OrgCnW;
	ItemInfo["OldCnH"] = p_items.OrgCnH;
	ItemInfo["OldCnD"] = p_items.OrgCnD;
	ItemInfo["OldNW"] = p_items.OrgNW;
	ItemInfo["OldNH"] = p_items.OrgNH;
	ItemInfo["OldND"] = p_items.OrgND;
	ItemInfo["TopObjID"] = p_items.TopObjID;
	ItemInfo["BottomObjID"] = p_items.BottomObjID;
	ItemInfo["SecondTier"] = p_items.SecondTier;
	ItemInfo["SellingPrice"] = p_items.SellingPrice;
	ItemInfo["SalesUnit"] = p_items.SalesUnit;
	ItemInfo["NetSales"] = p_items.NetSales;
	ItemInfo["CogsAdj"] = p_items.CogsAdj;
	ItemInfo["WeeksCount"] = p_items.WeeksCount;
	ItemInfo["MovingItem"] = p_items.MovingItem;
	ItemInfo["GrossProfit"] = p_items.GrossProfit;
	ItemInfo["Profit"] = p_items.Profit;
	ItemInfo["TotalMargin"] = p_items.TotalMargin;
	ItemInfo["MHorizFacings"] = parseInt(p_items.MHorizFacings);
	ItemInfo["MVertFacings"] = parseInt(p_items.MVertFacings);
	ItemInfo["MDepthFacings"] = parseInt(p_items.MDepthFacings);
	ItemInfo["NewYN"] = p_items.NewYN;
	ItemInfo["Delist"] = p_items.Delist;
	ItemInfo["DescSecond"] = p_items.DescSecond;
	ItemInfo["Status"] = p_items.Status;
	ItemInfo["DaysOfSupply"] = p_items.DaysOfSupply;
	ItemInfo["OrientationDesc"] = p_items.OrientationDesc;
	ItemInfo["StoreCnt"] = p_items.StoreCnt;
	ItemInfo["OverhungItem"] = p_items.OverhungItem; //ASA-1138

	ItemInfo["OrgUW"] = p_items.OrgUW;
	ItemInfo["OrgUH"] = p_items.OrgUH;
	ItemInfo["OrgUD"] = p_items.OrgUD;
	ItemInfo["OrgCW"] = p_items.OrgCW;
	ItemInfo["OrgCH"] = p_items.OrgCH;
	ItemInfo["OrgCD"] = p_items.OrgCD;
	ItemInfo["OrgTW"] = p_items.OrgTW;
	ItemInfo["OrgTH"] = p_items.OrgTH;
	ItemInfo["OrgTD"] = p_items.OrgTD;
	ItemInfo["OrgDW"] = p_items.OrgDW;
	ItemInfo["OrgDH"] = p_items.OrgDH;
	ItemInfo["OrgDD"] = p_items.OrgDD;
	ItemInfo["OrgCHPerc"] = p_items.OrgCHPerc;
	ItemInfo["OrgCWPerc"] = p_items.OrgCWPerc;
	ItemInfo["OrgCDPerc"] = p_items.OrgCDPerc;
	ItemInfo["OrgCnW"] = p_items.OrgCnW;
	ItemInfo["OrgCnH"] = p_items.OrgCnH;
	ItemInfo["OrgCnD"] = p_items.OrgCnD;
	ItemInfo["OrgNW"] = p_items.OrgNW;
	ItemInfo["OrgNH"] = p_items.OrgNH;
	ItemInfo["OrgND"] = p_items.OrgND;

	ItemInfo["ItemNesting"] = "";
	ItemInfo["NVal"] = 0;
	ItemInfo["ItemContain"] = "";
	ItemInfo["CnVal"] = 0;
	ItemInfo["IsContainer"] = "N";
	ItemInfo["BsktFactor"] = 0;
	ItemInfo["OverHang"] = 0;
	ItemInfo["HorizGap"] = 0;
	ItemInfo["VertGap"] = 0;
	ItemInfo["UW"] = p_items.OrgUW;
	ItemInfo["UH"] = p_items.OrgUH;
	ItemInfo["UD"] = p_items.OrgUD;
	ItemInfo["CW"] = p_items.OrgCW;
	ItemInfo["CH"] = p_items.OrgCH;
	ItemInfo["CD"] = p_items.OrgCD;
	ItemInfo["TW"] = p_items.OrgTW;
	ItemInfo["TH"] = p_items.OrgTH;
	ItemInfo["TD"] = p_items.OrgTD;
	ItemInfo["DW"] = p_items.OrgDW;
	ItemInfo["DH"] = p_items.OrgDH;
	ItemInfo["DD"] = p_items.OrgDD;
	ItemInfo["SIndex"] = p_shelf_index;
	ItemInfo["Dragged"] = "N";
	ItemInfo["Quantity"] = 1;
	ItemInfo["Y"] = p_item_y;
	ItemInfo["X"] = p_item_x;
	ItemInfo["SlotDivider"] = "";
	ItemInfo["ObjID"] = "";
	ItemInfo["ImgExists"] = p_items.ImgExists;
	ItemInfo["CapCount"] = 0;
	ItemInfo["OW"] = p_items.OrgUW;
	ItemInfo["OH"] = p_items.OrgUH;
	ItemInfo["OD"] = p_items.OrgUD;
	ItemInfo["SpreadItem"] = p_items.SpreadItem;
	ItemInfo["MHorizCrushed"] = "N";
	ItemInfo["MVertCrushed"] = "N";
	ItemInfo["MDepthCrushed"] = "N";
	ItemInfo["RW"] = p_items.W;
	ItemInfo["RH"] = p_items.H;
	ItemInfo["RD"] = p_items.D;
	ItemInfo["PW"] = p_items.W;
	ItemInfo["PH"] = p_items.H;
	ItemInfo["PD"] = p_items.D;
	ItemInfo["LObjID"] = -1;
	ItemInfo["SubLblObjID"] = -1; //ASA-1182
	ItemInfo["DimUpdate"] = "N";
	ItemInfo["NewItem"] = p_items.NewItem;
	ItemInfo["FacingFormula"] = p_items.FacingFormula;
	var det_arr = p_items.SizeDesc.split("*");
	ItemInfo["ImgExists"] = p_items.ImgExists;
	ItemInfo["Exists"] = "E";
	ItemInfo["DimUpdate"] = "N";
	ItemInfo["ItemImage"] = p_items.ItemImage;
	ItemInfo["Edited"] = "Y";
	ItemInfo["OldObjID"] = p_items.ObjID;
	ItemInfo["NewPegId"] = "";
	ItemInfo["DFacing"] = p_items.BaseD;
	ItemInfo["UnitperCase"] = p_items.UnitperCase;
	ItemInfo["UnitperTray"] = p_items.UnitperTray;
	ItemInfo["DfacingUpd"] = "N";
	ItemInfo["TotalUnitsCalc"] = p_items.BHoriz * p_items.BVert * p_items.BaseD;
	ItemInfo["PkSiz"] = det_arr[0];
	ItemInfo["Cpct"] = p_items.BHoriz * p_items.BVert * p_items.BaseD;
	ItemInfo["ItmDescChi"] = p_items.ItmDescChi;
	ItemInfo["ItmDescEng"] = p_items.Brand + " " + p_items.Desc + " " + p_items.SizeDesc;
	ItemInfo["Brand_Category"] = typeof p_items.Brand_Category !== "undefined" ? p_items.Brand_Category : "";
	ItemInfo["Uda_item_status"] = typeof p_items.Uda_item_status !== "undefined" ? p_items.Uda_item_status : "";
	ItemInfo["Gobecobrand"] = typeof p_items.Gobecobrand !== "undefined" ? p_items.Gobecobrand : "";
	ItemInfo["Internet"] = typeof p_items.Internet !== "undefined" ? p_items.Internet : ""; //ASA-1158-E
	ItemInfo["Categ"] = typeof p_items.Categ !== "undefined" ? p_items.Categ : "";
	ItemInfo["COO"] = typeof p_items.COO !== "undefined" ? p_items.COO : "";
	ItemInfo["ItmeSize"] = typeof p_items.ItmeSize !== "undefined" ? p_items.ItmeSize : "";
	ItemInfo["SplrLbl"] = typeof p_items.SplrLbl !== "undefined" ? p_items.SplrLbl : "";
	ItemInfo["EDLP"] = typeof p_items.EDLP !== "undefined" ? p_items.EDLP : "";
	ItemInfo["LoGrp"] = typeof p_items.LoGrp !== "undefined" ? p_items.LoGrp : "";
	ItemInfo["SqzPer"] = (typeof p_items.CrushHoriz !== "undefined" ? p_items.CrushHoriz : 0) + ":" + (typeof p_items.CrushVert !== "undefined" ? p_items.CrushVert : 0) + ":" + (typeof p_items.CrushD !== "undefined" ? p_items.CrushD : 0);
	ItemInfo["InternationalRng"] = typeof p_items.InternationalRng !== "undefined" ? p_items.InternationalRng : "";
	ItemInfo["ActualDPP"] = typeof p_items.ActualDPP !== "undefined" ? p_items.ActualDPP : ""; //ASA-1182 ASA-1277-(3)
	ItemInfo["DPPLoc"] = p_items.DPPLoc; //ASA-1308 Task-3
	ItemInfo["StoreSOH"] = typeof p_items.StoreSOH !== "undefined" ? p_items.StoreSOH : ""; //ASA-1182  ASA-1277-(3)
	ItemInfo["StoreNo"] = typeof p_items.StoreNo !== "undefined" ? p_items.StoreNo : ""; //ASA-1277-(3)
	ItemInfo["WeeksOfInventory"] = typeof p_items.WeeksOfInventory !== "undefined" ? p_items.WeeksOfInventory : ""; //ASA-1277-(3)
	ItemInfo["NewItem"] = typeof p_items.NewItem !== "undefined" ? p_items.NewItem : ""; //ASA-1182
	ItemInfo["CapDepthChanged"] = p_items.CapDepthChanged; //ASA-1273
	ItemInfo["LiveNewItem"] = typeof p_items.LiveNewItem !== "undefined" ? p_items.LiveNewItem : ""; //ASA-1250
	ItemInfo["MassCrushH"] = typeof p_items.MassCrushH !== "undefined" && p_items.MassCrushH !== null ? p_items.MassCrushH : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
	ItemInfo["MassCrushV"] = typeof p_items.MassCrushV !== "undefined" && p_items.MassCrushV !== null ? p_items.MassCrushV : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
	ItemInfo["MassCrushD"] = typeof p_items.MassCrushD !== "undefined" && p_items.MassCrushD !== null ? p_items.MassCrushD : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
	ItemInfo["UDA751"] = typeof p_items.UDA751 !== "undefined" ? p_items.UDA751 : ""; //ASA-1407 Task 1 -S
	ItemInfo["UDA755"] = typeof p_items.UDA755 !== "undefined" ? p_items.UDA755 : ""; //ASA-1407 Task 1 -E
	ItemInfo["MPogDepthFacings"] = typeof p_items.MPogDepthFacings !== "undefined" ? p_items.MPogDepthFacings : ""; //ASA-1408
	ItemInfo["MPogHorizFacings"] = typeof p_items.MPogHorizFacings !== "undefined" ? p_items.MPogHorizFacings : ""; //ASA-1408
	ItemInfo["MPogVertFacings"] = typeof p_items.MPogVertFacings !== "undefined" ? p_items.MPogVertFacings : ""; //ASA-1408
	//ASA-1640 Start
	ItemInfo["ItemCondition"] = p_items.ItemCondition;
	ItemInfo["AUR"] = p_items.AUR;
	ItemInfo["ItemRanking"] = p_items.ItemRanking;
	ItemInfo["WeeklySales"] = p_items.WeeklySales;
	ItemInfo["WeeklyNetMargin"] = p_items.WeeklyNetMargin;
	ItemInfo["WeeklyQty"] = p_items.WeeklyQty;
	ItemInfo["NetMarginPercent"] = p_items.NetMarginPercent;
	ItemInfo["CumulativeNM"] = p_items.CumulativeNM;
	ItemInfo["TOP80B2"] = p_items.TOP80B2;
	ItemInfo["ItemBrandC"] = p_items.ItemBrandC;
	ItemInfo["ItemPOGDept"] = p_items.ItemPOGDept;
	ItemInfo["ItemRemark"] = p_items.ItemRemark;
	ItemInfo["RTVStatus"] = p_items.RTVStatus;
	ItemInfo["Pusher"] = p_items.Pusher;
	ItemInfo["Divider"] = p_items.Divider;
	ItemInfo["BackSupport"] = p_items.BackSupport;
	//ASA-1640 End
    //ASA-2013 Start
    ItemInfo["ShelfPrice"] = p_items.ShelfPrice;
    ItemInfo["PromoPrice"] = p_items.PromoPrice;
    ItemInfo["DiscountRate"] = p_items.DiscountRate;
    ItemInfo["PriceChangeDate"] = p_items.PriceChangeDate;
    ItemInfo["WeeksOfInventory"] = p_items.WeeksOfInventory;
    ItemInfo["QTY"] = p_items.QTY;
    ItemInfo["WhStock"] = p_items.WhStock;
    ItemInfo["StoreStock"] = p_items.StoreStock;
    ItemInfo["StockIntransit"] = p_items.StockIntransit;
    //ASA-2013 End
	ItemInfo["OOSPerc"] = p_items.OOSPerc; //ASA-1688 Added for oos%
	ItemInfo["InitialItemDesc"] = p_items.InitialItemDesc; //ASA-1734 Issue 1
	ItemInfo["InitialBrand"] = p_items.InitialBrand; //ASA-1787 Request #6
	ItemInfo["InitialBarcode"] = p_items.InitialBarcode; //ASA-1787 Request #6 

	g_pog_json[g_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.push(ItemInfo);
	logDebug("function : set_item_details", "E");
	return g_pog_json[g_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length - 1;
}

function get_item_object(p_items, p_module_index, p_shelf_index, p_item_index, p_item_x, p_item_y) {
	logDebug("function : set_item_details; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; item_x : " + p_item_x + "; item_y : " + p_item_y, "S");
	var ItemInfo = {};
	ItemInfo["ItemID"] = p_items.Item;
	ItemInfo["Item"] = p_items.Item;
	ItemInfo["CType"] = g_pog_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType; 
	ItemInfo["W"] = p_items.W;
	ItemInfo["H"] = p_items.H;
	ItemInfo["D"] = p_items.D;
	ItemInfo["Color"] = $v("P25_POG_ITEM_DEFAULT_COLOR");
	ItemInfo["DimT"] = "U"; 
	ItemInfo["Desc"] = p_items.Desc;
	ItemInfo["Barcode"] = p_items.Barcode; 
	ItemInfo["LocID"] = "";
	ItemInfo["PegID"] = "";
	ItemInfo["PegSpread"] = "";
	ItemInfo["PegPerFacing"] = "";
	ItemInfo["Fixed"] = "N";
	ItemInfo["CapStyle"] = "0";
	ItemInfo["CapMaxH"] = 0;
	ItemInfo["MaxHCapStyle"] = "3";
	ItemInfo["Rotation"] = 0;
	ItemInfo["BHoriz"] = 1;
	ItemInfo["BVert"] = 1;
	ItemInfo["BaseD"] = 1;
	ItemInfo["CrushHoriz"] = 0;
	ItemInfo["CrushVert"] = 0;
	ItemInfo["CrushD"] = 0;
	ItemInfo["Orientation"] = p_items.Orientation;
	ItemInfo["MerchStyle"] = "0";
	ItemInfo["Supplier"] = p_items.Supplier;
	if (p_items.Supplier !== "undefined" && p_items.Supplier !== "") {
		//ASA-1222-S
		var itemsupp = p_items.Supplier.split("-");
		ItemInfo["SupplierName"] = itemsupp[1];
	} else {
		ItemInfo["SupplierName"] = "";
	} //ASA-1222-S
	ItemInfo["Brand"] = p_items.Brand;
	ItemInfo["Group"] = p_items.Group;
	ItemInfo["Dept"] = p_items.Dept;
	var itemdept = p_items.Dept.split("-"); //ASA-1222-S
	var itemclass = p_items.Class.split("-");
	var itemsubclass = p_items.SubClass.split("-");
	ItemInfo["Class"] = p_items.Class;
	ItemInfo["ClassName"] = itemdept[0] + "/" + itemclass[0] + "/" + itemsubclass[0]; //ASA-1222-E
	ItemInfo["SubClass"] = p_items.SubClass;
	ItemInfo["StdUOM"] = p_items.StdUOM;
	ItemInfo["SizeDesc"] = p_items.SizeDesc;
	ItemInfo["Price"] = p_items.Price;
	ItemInfo["Cost"] = p_items.Cost;
	ItemInfo["RegMovement"] = p_items.RegMovement;
	ItemInfo["MoveBasis"] = p_items.MoveBasis;
	ItemInfo["Exists"] = "N";
	ItemInfo["CHPerc"] = p_items.OrgCHPerc;
	ItemInfo["CWPerc"] = p_items.OrgCWPerc;
	ItemInfo["CDPerc"] = p_items.OrgCDPerc;
	ItemInfo["CnW"] = p_items.OrgCnW;
	ItemInfo["CnH"] = p_items.OrgCnH;
	ItemInfo["CnD"] = p_items.OrgCnD;
	ItemInfo["NW"] = p_items.OrgNW;
	ItemInfo["NH"] = p_items.OrgNH;
	ItemInfo["ND"] = p_items.OrgND;
	ItemInfo["OldCnW"] = p_items.OrgCnW;
	ItemInfo["OldCnH"] = p_items.OrgCnH;
	ItemInfo["OldCnD"] = p_items.OrgCnD;
	ItemInfo["OldNW"] = p_items.OrgNW;
	ItemInfo["OldNH"] = p_items.OrgNH;
	ItemInfo["OldND"] = p_items.OrgND;
	ItemInfo["TopObjID"] = p_items.TopObjID;
	ItemInfo["BottomObjID"] = p_items.BottomObjID;
	ItemInfo["SecondTier"] = p_items.SecondTier;
	ItemInfo["SellingPrice"] = p_items.SellingPrice;
	ItemInfo["SalesUnit"] = p_items.SalesUnit;
	ItemInfo["NetSales"] = p_items.NetSales;
	ItemInfo["CogsAdj"] = p_items.CogsAdj;
	ItemInfo["WeeksCount"] = p_items.WeeksCount;
	ItemInfo["MovingItem"] = p_items.MovingItem;
	ItemInfo["GrossProfit"] = p_items.GrossProfit;
	ItemInfo["Profit"] = p_items.Profit;
	ItemInfo["TotalMargin"] = p_items.TotalMargin;
	ItemInfo["MHorizFacings"] = parseInt(p_items.MHorizFacings);
	ItemInfo["MVertFacings"] = parseInt(p_items.MVertFacings);
	ItemInfo["MDepthFacings"] = parseInt(p_items.MDepthFacings);
	ItemInfo["NewYN"] = p_items.NewYN;
	ItemInfo["Delist"] = p_items.Delist;
	ItemInfo["DescSecond"] = p_items.DescSecond;
	ItemInfo["Status"] = p_items.Status;
	ItemInfo["DaysOfSupply"] = p_items.DaysOfSupply;
	ItemInfo["OrientationDesc"] = p_items.OrientationDesc;
	ItemInfo["StoreCnt"] = p_items.StoreCnt;
	ItemInfo["OverhungItem"] = p_items.OverhungItem; //ASA-1138

	ItemInfo["OrgUW"] = p_items.OrgUW;
	ItemInfo["OrgUH"] = p_items.OrgUH;
	ItemInfo["OrgUD"] = p_items.OrgUD;
	ItemInfo["OrgCW"] = p_items.OrgCW;
	ItemInfo["OrgCH"] = p_items.OrgCH;
	ItemInfo["OrgCD"] = p_items.OrgCD;
	ItemInfo["OrgTW"] = p_items.OrgTW;
	ItemInfo["OrgTH"] = p_items.OrgTH;
	ItemInfo["OrgTD"] = p_items.OrgTD;
	ItemInfo["OrgDW"] = p_items.OrgDW;
	ItemInfo["OrgDH"] = p_items.OrgDH;
	ItemInfo["OrgDD"] = p_items.OrgDD;
	ItemInfo["OrgCHPerc"] = p_items.OrgCHPerc;
	ItemInfo["OrgCWPerc"] = p_items.OrgCWPerc;
	ItemInfo["OrgCDPerc"] = p_items.OrgCDPerc;
	ItemInfo["OrgCnW"] = p_items.OrgCnW;
	ItemInfo["OrgCnH"] = p_items.OrgCnH;
	ItemInfo["OrgCnD"] = p_items.OrgCnD;
	ItemInfo["OrgNW"] = p_items.OrgNW;
	ItemInfo["OrgNH"] = p_items.OrgNH;
	ItemInfo["OrgND"] = p_items.OrgND;

	ItemInfo["ItemNesting"] = "";
	ItemInfo["NVal"] = 0;
	ItemInfo["ItemContain"] = "";
	ItemInfo["CnVal"] = 0;
	ItemInfo["IsContainer"] = "N";
	ItemInfo["BsktFactor"] = 0;
	ItemInfo["OverHang"] = 0;
	ItemInfo["HorizGap"] = 0;
	ItemInfo["VertGap"] = 0;
	ItemInfo["UW"] = p_items.OrgUW;
	ItemInfo["UH"] = p_items.OrgUH;
	ItemInfo["UD"] = p_items.OrgUD;
	ItemInfo["CW"] = p_items.OrgCW;
	ItemInfo["CH"] = p_items.OrgCH;
	ItemInfo["CD"] = p_items.OrgCD;
	ItemInfo["TW"] = p_items.OrgTW;
	ItemInfo["TH"] = p_items.OrgTH;
	ItemInfo["TD"] = p_items.OrgTD;
	ItemInfo["DW"] = p_items.OrgDW;
	ItemInfo["DH"] = p_items.OrgDH;
	ItemInfo["DD"] = p_items.OrgDD;
	ItemInfo["SIndex"] = p_shelf_index;
	ItemInfo["Dragged"] = "N";
	ItemInfo["Quantity"] = 1;
	ItemInfo["Y"] = p_item_y;
	ItemInfo["X"] = p_item_x;
	ItemInfo["SlotDivider"] = "";
	ItemInfo["ObjID"] = "";
	ItemInfo["ImgExists"] = p_items.ImgExists;
	ItemInfo["CapCount"] = 0;
	ItemInfo["OW"] = p_items.OrgUW;
	ItemInfo["OH"] = p_items.OrgUH;
	ItemInfo["OD"] = p_items.OrgUD;
	ItemInfo["SpreadItem"] = 0;
	ItemInfo["MHorizCrushed"] = "N";
	ItemInfo["MVertCrushed"] = "N";
	ItemInfo["MDepthCrushed"] = "N";
	ItemInfo["RW"] = p_items.W;
	ItemInfo["RH"] = p_items.H;
	ItemInfo["RD"] = p_items.D;
	ItemInfo["PW"] = p_items.W;
	ItemInfo["PH"] = p_items.H;
	ItemInfo["PD"] = p_items.D;
	ItemInfo["LObjID"] = -1;
	ItemInfo["SubLblObjID"] = -1; //ASA-1182
	ItemInfo["DimUpdate"] = "N";
	ItemInfo["NewItem"] = p_items.NewItem;
	ItemInfo["FacingFormula"] = p_items.FacingFormula;
	var det_arr = p_items.SizeDesc.split("*");
	ItemInfo["ImgExists"] = p_items.ImgExists;
	ItemInfo["Exists"] = "E";
	ItemInfo["DimUpdate"] = "N";
	ItemInfo["ItemImage"] = p_items.ItemImage;
	ItemInfo["Edited"] = "Y";
	ItemInfo["OldObjID"] = p_items.ObjID;
	ItemInfo["NewPegId"] = "";
	ItemInfo["DFacing"] = p_items.BaseD;
	ItemInfo["UnitperCase"] = p_items.UnitperCase;
	ItemInfo["UnitperTray"] = p_items.UnitperTray;
	ItemInfo["DfacingUpd"] = "N";
	ItemInfo["TotalUnitsCalc"] = p_items.BHoriz * p_items.BVert * p_items.BaseD;
	ItemInfo["PkSiz"] = det_arr[0];
	ItemInfo["Cpct"] = p_items.BHoriz * p_items.BVert * p_items.BaseD;
	ItemInfo["ItmDescChi"] = p_items.ItmDescChi;
	ItemInfo["ItmDescEng"] = p_items.Brand + " " + p_items.Desc + " " + p_items.SizeDesc;
	ItemInfo["Brand_Category"] = typeof p_items.Brand_Category !== "undefined" ? p_items.Brand_Category : "";
	ItemInfo["Uda_item_status"] = typeof p_items.Uda_item_status !== "undefined" ? p_items.Uda_item_status : "";
	ItemInfo["Gobecobrand"] = typeof p_items.Gobecobrand !== "undefined" ? p_items.Gobecobrand : "";
	ItemInfo["Internet"] = typeof p_items.Internet !== "undefined" ? p_items.Internet : ""; //ASA-1158-E
	ItemInfo["Categ"] = typeof p_items.Categ !== "undefined" ? p_items.Categ : "";
	ItemInfo["COO"] = typeof p_items.COO !== "undefined" ? p_items.COO : "";
	ItemInfo["ItmeSize"] = typeof p_items.ItmeSize !== "undefined" ? p_items.ItmeSize : "";
	ItemInfo["SplrLbl"] = typeof p_items.SplrLbl !== "undefined" ? p_items.SplrLbl : "";
	ItemInfo["EDLP"] = typeof p_items.EDLP !== "undefined" ? p_items.EDLP : "";
	ItemInfo["LoGrp"] = typeof p_items.LoGrp !== "undefined" ? p_items.LoGrp : "";
	ItemInfo["SqzPer"] = (typeof p_items.CrushHoriz !== "undefined" ? p_items.CrushHoriz : 0) + ":" + (typeof p_items.CrushVert !== "undefined" ? p_items.CrushVert : 0) + ":" + (typeof p_items.CrushD !== "undefined" ? p_items.CrushD : 0);
	ItemInfo["InternationalRng"] = typeof p_items.InternationalRng !== "undefined" ? p_items.InternationalRng : "";
	ItemInfo["ActualDPP"] = typeof p_items.ActualDPP !== "undefined" ? p_items.ActualDPP : ""; //ASA-1182  ASA-1277-(3)
	ItemInfo["DPPLoc"] = p_items.DPPLoc; //ASA-1308 Task-3
	ItemInfo["StoreSOH"] = typeof p_items.StoreSOH !== "undefined" ? p_items.StoreSOH : ""; //ASA-1182 ASA-1277-(3)
	ItemInfo["StoreNo"] = typeof p_items.StoreNo !== "undefined" ? p_items.StoreNo : ""; //ASA-1277-(3)
	ItemInfo["WeeksOfInventory"] = typeof p_items.WeeksOfInventory !== "undefined" ? p_items.WeeksOfInventory : ""; //ASA-1277-(3)
	ItemInfo["NewItem"] = typeof p_items.NewItem !== "undefined" ? p_items.NewItem : ""; //ASA-1182
	ItemInfo["LiveNewItem"] = typeof p_items.LiveNewItem !== "undefined" ? p_items.LiveNewItem : ""; //ASA-1250
	ItemInfo["CapDepthChanged"] = p_items.CapDepthChanged; //ASA-1273
	ItemInfo["MassCrushH"] = typeof p_items.MassCrushH !== "undefined" && p_items.MassCrushH !== null ? p_items.MassCrushH : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
	ItemInfo["MassCrushV"] = typeof p_items.MassCrushV !== "undefined" && p_items.MassCrushV !== null ? p_items.MassCrushV : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
	ItemInfo["MassCrushD"] = typeof p_items.MassCrushD !== "undefined" && p_items.MassCrushD !== null ? p_items.MassCrushD : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
	ItemInfo["UDA751"] = typeof p_items.UDA751 !== "undefined" ? p_items.UDA751 : ""; //ASA-1407 Task 1 -S
	ItemInfo["UDA755"] = typeof p_items.UDA755 !== "undefined" ? p_items.UDA755 : ""; //ASA-1407 Task 1 -E
	ItemInfo["MPogDepthFacings"] = typeof p_items.MPogDepthFacings !== "undefined" ? p_items.MPogDepthFacings : ""; //ASA-1408
	ItemInfo["MPogHorizFacings"] = typeof p_items.MPogHorizFacings !== "undefined" ? p_items.MPogHorizFacings : ""; //ASA-1408
	ItemInfo["MPogVertFacings"] = typeof p_items.MPogVertFacings !== "undefined" ? p_items.MPogVertFacings : ""; //ASA-1408
	//ASA-1640 Start
	ItemInfo["ItemCondition"] = p_items.ItemCondition;
	ItemInfo["AUR"] = p_items.AUR;
	ItemInfo["ItemRanking"] = p_items.ItemRanking;
	ItemInfo["WeeklySales"] = p_items.WeeklySales;
	ItemInfo["WeeklyNetMargin"] = p_items.WeeklyNetMargin;
	ItemInfo["WeeklyQty"] = p_items.WeeklyQty;
	ItemInfo["NetMarginPercent"] = p_items.NetMarginPercent;
	ItemInfo["CumulativeNM"] = p_items.CumulativeNM;
	ItemInfo["TOP80B2"] = p_items.TOP80B2;
	ItemInfo["ItemBrandC"] = p_items.ItemBrandC;
	ItemInfo["ItemPOGDept"] = p_items.ItemPOGDept;
	ItemInfo["ItemRemark"] = p_items.ItemRemark;
	ItemInfo["RTVStatus"] = p_items.RTVStatus;
	ItemInfo["Pusher"] = p_items.Pusher;
	ItemInfo["Divider"] = p_items.Divider;
	ItemInfo["BackSupport"] = p_items.BackSupport;
	//ASA-1640 End
    //ASA-2013 Start
    ItemInfo["ShelfPrice"] = p_items.ShelfPrice;
    ItemInfo["PromoPrice"] = p_items.PromoPrice;
    ItemInfo["DiscountRate"] = p_items.DiscountRate;
    ItemInfo["PriceChangeDate"] = p_items.PriceChangeDate;
    ItemInfo["WeeksOfInventory"] = p_items.WeeksOfInventory;
    ItemInfo["QTY"] = p_items.QTY;
    ItemInfo["WhStock"] = p_items.WhStock;
    ItemInfo["StoreStock"] = p_items.StoreStock;
    ItemInfo["StockIntransit"] = p_items.StockIntransit;
    //ASA-2013 End
	ItemInfo["OOSPerc"] = p_items.OOSPerc; //ASA-1688 Added for oos%
	ItemInfo["InitialItemDesc"] = p_items.InitialItemDesc; //ASA-1734 Issue 1
	ItemInfo["InitialBrand"] = p_items.InitialBrand; //ASA-1787 Request #6
	ItemInfo["InitialBarcode"] = p_items.InitialBarcode; //ASA-1787 Request #6  

	logDebug("function : set_item_details", "E");
	return ItemInfo;
}

function carpark_shelf(p_module_name, p_width, p_height, p_depth, p_shelfx, p_shelfy, p_module_index) {
	logDebug("function : carpark_shelf; module_name : " + p_module_name + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; shelfx : " + p_shelfx + "; shelfy : " + p_shelfy + "; p_module_index : " + p_module_index, "S");
	var ShelfInfo = {};
	ShelfInfo["Shelf"] = "CARPARK_" + p_module_name;
	ShelfInfo["ObjType"] = "SHELF";
	ShelfInfo["Desc"] = "";
	ShelfInfo["MaxMerch"] = 0;
	ShelfInfo["GrillH"] = 0;
	ShelfInfo["LOverhang"] = 0;
	ShelfInfo["ROverhang"] = 0;
	ShelfInfo["SpacerThick"] = 0;
	ShelfInfo["HorizGap"] = 0;
	ShelfInfo["SpreadItem"] = "L";
	ShelfInfo["Combine"] = "N";
	ShelfInfo["AllowAutoCrush"] = "N";
	ShelfInfo["H"] = p_height;
	ShelfInfo["W"] = p_width;
	ShelfInfo["D"] = p_depth;
	ShelfInfo["Rotation"] = 0;
	ShelfInfo["Slope"] = 0;
	ShelfInfo["Color"] = $v("P25_POG_SHELF_DEFAULT_COLOR");
	ShelfInfo["LiveImage"] = "";
	ShelfInfo["HorizSlotStart"] = 0;
	ShelfInfo["HorizSlotSpacing"] = 0;
	ShelfInfo["HorizStart"] = 0;
	ShelfInfo["HorizSpacing"] = 0;
	ShelfInfo["UOverHang"] = 0;
	ShelfInfo["LoOverHang"] = 0;
	ShelfInfo["VertiStart"] = 0;
	ShelfInfo["VertiSpacing"] = 0;
	ShelfInfo["X"] = p_shelfx;
	ShelfInfo["Y"] = p_shelfy;
	ShelfInfo["Z"] = 0;
	ShelfInfo["InputText"] = "";
	ShelfInfo["WrapText"] = "";
	ShelfInfo["ReduceToFit"] = "";
    ShelfInfo["TextDirection"] = "";
	ShelfInfo["BsktFill"] = "";
	ShelfInfo["BsktSpreadProduct"] = "";
	ShelfInfo["SnapTo"] = "";
	ShelfInfo["BsktWallH"] = 0;
	ShelfInfo["BsktBaseH"] = 0;
	ShelfInfo["BsktWallThickness"] = 0;
	ShelfInfo["DSlotStart"] = 0;
	ShelfInfo["DSlotSpacing"] = 0;
	ShelfInfo["DGap"] = 0;
	ShelfInfo["FrontOverHang"] = 0;
	ShelfInfo["BackOverHang"] = 0;
	ShelfInfo["SlotDivider"] = "";
	ShelfInfo["AutoPlacing"] = $v("P25_POGCR_PEGB_MAX_ARRANGE");
	ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
	ShelfInfo["SlotOrientation"] = "";
	ShelfInfo["DividerFixed"] = "N";
	ShelfInfo["LObjID"] = -1;
	ShelfInfo["NotchLabelObjID"] = -1;
	ShelfInfo["FStyle"] = "";
	ShelfInfo["FSize"] = "";
	ShelfInfo["FBold"] = "";
	ShelfInfo["TextImg"] = "";
	ShelfInfo["TextImgName"] = "";
	ShelfInfo["TextImgMime"] = "";
	ShelfInfo["ItemInfo"] = [];
	ShelfInfo["Overhung"] = "N"; //ASA-1138
	g_pog_json[g_pog_index].ModuleInfo[p_module_index].Carpark.push(ShelfInfo);
	logDebug("function : carpark_shelf", "E");
	return "SUCCESS";
}

async function comparePOG(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog = 'N') { //ASA-1803 Issue 1 added p_compare_pog
	logDebug("function : comparePOG", "S");
	await get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog);
	logDebug("function : comparePOG", "E");
}

//this function is used import button available next to Save POG in the right side of screen. User first exports the excel with details of each shelf
// and each shelf items will be comma separated. user can edit the items list remove or add and then import the file.
//system will reload the page and onload this function is called.
async function item_upld_create(p_item_json, p_pog_index) {
	logDebug("function : item_upld_create", "S");
	try {
		return new Promise(function (resolve, reject) {
			if (p_item_json.length > 0) {
				var i = 0;
				var old_items = [];
				var div_array = [];
				var invalid_items = [];
				$(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
				$(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
				$(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
				var item_code_arr = [];
				//first we set all the mandatory information in iteminfo for reference from g_pog_json.
				$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
					if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
						$.each(modules_info.ShelfInfo, function (j, shelf_info) {
							if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
								$.each(shelf_info.ItemInfo, function (k, item_info) {
									var item_exists = "Y";
									if (item_info.Item == "DIVIDER") {
										g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].MIndex = i;
										g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].SIndex = j;
										g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].IIndex = k;
										g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RemovedItem = "N";
										g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Module = modules_info.Module;
										g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Shelf = shelf_info.Shelf;
										item_info.Added = "N";
										div_array.push(item_info);
									}
									for (const items of p_item_json) {
										item_code_arr.push(item_info.Item);
										if (items.Item == item_info.Item) {
											item_exists = "N";
										}
									}
									if (item_exists == "Y") {
										async function doSomething() {
											g_deletedItems.push(item_info.Item);
											if (typeof g_pog_json[p_pog_index].DeleteItems !== "undefined") {
												g_pog_json[p_pog_index].DeleteItems.push(item_info); ///ASA-1108
											}
										}
										doSomething();
									}
								});
							}
						});
					}
				});
				var res = deleted_items_log(g_deletedItems, "D", p_pog_index);
				i = 0;
				//finding if the item in the excel is already present in same index. if item is added more than one time in same shelf.
				//we consider it as multiple facings. so we dont process those extra items.but add horiz facings.
				for (const items of p_item_json) {
					if (typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex] !== "undefined") {
						if (g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].Item == items.Item) {
							if (items.RemovedItem == "N") {
								old_items.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex])));
								old_items[old_items.length - 1].Module = JSON.parse(JSON.stringify(items.Module));
								old_items[old_items.length - 1].Shelf = JSON.parse(JSON.stringify(items.Shelf));
								p_item_json[i].NewItem = "N";
								p_item_json[i].ObjID = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].ObjID;
								p_item_json[i].RemovedItem = "N";
								if (g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].BHoriz > 1) {
									var horiz_facing = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].BHoriz - 1;
									var j = 0;
									var last_index = -1;
									for (const item_details of p_item_json) {
										if (item_details.Item == items.Item && j > i && horiz_facing > 0 && items.MIndex == item_details.MIndex && items.SIndex == item_details.SIndex) {
											horiz_facing = horiz_facing - 1;
											p_item_json[j].RemovedItem = "Y";
											p_item_json[j].IIndex = items.IIndex;
											last_index = j;
										}
										j = j + 1;
									}
									var j = 0;
									var next_index = items.IIndex;
									new_value = -1;
									for (const item_details of p_item_json) {
										if (j > last_index && items.MIndex == item_details.MIndex && items.SIndex == item_details.SIndex) {
											var new_value = items.IIndex == next_index ? items.IIndex + 1 : new_value + 1;
											next_index = new_value;
											p_item_json[j].IIndex = new_value;
										}
										j = j + 1;
									}
								}
							} else {
								p_item_json[i].NewItem = "N";
							}
						} else {
							p_item_json[i].NewItem = "Y";
							p_item_json[i].RemovedItem = "N";
						}
					} else {
						p_item_json[i].NewItem = "Y";
						p_item_json[i].RemovedItem = "N";
					}
					i = i + 1;
				}
				var i = 0;
				for (const items of p_item_json) {
					if (items.NewItem == "Y") {
						var [new_orient, orient_desc] = get_item_exists_orientation(items.Item, 0);
						items.Orientation = new_orient;
						items.OrientationDesc = orient_desc;
					}
					i++;
				}
				//remove all the objects from the world.
				$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
					if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
						for (const car_shelf of modules_info.Carpark) {
							var select_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(car_shelf.SObjID);
							g_scene_objects[p_pog_index].scene.children[2].remove(select_object);
							for (const car_items of car_shelf.ItemInfo) {
								var select_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(car_items.ObjID);
								g_scene_objects[p_pog_index].scene.children[2].remove(select_object);
							}
						}
						g_pog_json[p_pog_index].ModuleInfo[i].Carpark = [];
						$.each(modules_info.ShelfInfo, function (j, shelf_info) {
							if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
								g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo = [];
							}
						});
					}
				});

				var total_width = 0,
					total_cnt = 0,
					temp_item = [];
				var spread = 0;
				//calculate total width and find out how many items can be placed in a each shelf.
				$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
					if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
						$.each(modules_info.ShelfInfo, function (j, shelf_info) {
							total_width = 0;
							total_cnt = 0;
							spread = 0;
							if (shelf_info.ObjType !== "DIVIDER") {
								for (const items of p_item_json) {
									if (typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex] !== "undefined") {
										temp_item.push(items);
										if (items.BHoriz > 1 && spread_product == "F") {
											total_width += items.W + spread_gap * (items.BHoriz - 1);
										} else {
											total_width += items.W;
										}
										if (spread_product == "E") {
											total_cnt = total_cnt + 1;
										} else {
											if (typeof items.BHoriz !== "undefined" && items.BHoriz !== "") {
												total_cnt = total_cnt + items.BHoriz;
											} else {
												total_cnt = total_cnt + 0;
											}
										}
									}
								}
								for (const div_arr of div_array) {
									if (i == div_arr.MIndex && j == div_arr.SIndex) {
										temp_item.push(div_arr);
										if (div_arr.BHoriz > 1 && spread_product == "F") {
											total_width += div_arr.W + spread_gap * (div_arr.BHoriz - 1);
										} else {
											total_width += div_arr.W;
										}
										if (spread_product == "E") {
											total_cnt = total_cnt + 1;
										} else {
											if (typeof div_arr.BHoriz !== "undefined" && div_arr.BHoriz !== "") {
												total_cnt = total_cnt + div_arr.BHoriz;
											} else {
												total_cnt = total_cnt + 0;
											}
										}
									}
								}

								if (total_cnt > 0) {
									spread = (shelf_info.W - total_width) / (total_cnt - 1) < 0 ? 0 : (shelf_info.W - total_width) / (total_cnt - 1);
								} else {
									spread = shelf_info.W - total_width < 0 ? 0 : shelf_info.W - total_width;
								}
								$.each(temp_item, function (i, items) {
									items.SpreadItem = spread;
								});
							}
						});
					}
				});

				var i = 0;
				var module = "";
				var shelf = "";
				var old_mod_index = -1;
				var old_shelf_index = -1;
				var max_height = 0.02;
				var max_depth = 0.4;
				for (const items of p_item_json) {
					if (items.RemovedItem == "N") {
						if (shelf !== items.Shelf && shelf !== "") {
							update_item_distance(old_mod_index, old_shelf_index, p_pog_index);
							var returnval = reorder_items(old_mod_index, old_shelf_index, p_pog_index);
						}
						shelf = items.Shelf;
						var shelf_obj_type = items.ObjType;
						var shelfs = {};
						shelfs["X"] = items.X;
						shelfs["Y"] = items.Y;
						shelfs["W"] = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].W;
						shelfs["H"] = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].H;
						shelfs["ObjType"] = shelf_obj_type;
						shelfs["peg_vert_values"] = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].peg_vert_values;

						//if item already exists in the pog with same index. just add in g_pog_json without validation. because those are already checked.
						//else validation and add.
						if (items.NewItem == "N") {
							for (const olditems of old_items) {
								if (items.ObjID == olditems.ObjID) {
									g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo.push(olditems);
									var g_item_index = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo.length - 1;
									break;
								}
							}
						} else {
							//getting dimension according to orientation.
							var [width, height, depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.W, items.H, items.D);
							items.W = width;
							items.H = height;
							items.D = depth;
							var g_item_index = set_item_details(items, items.MIndex, items.SIndex, -1, "", "");
						}

						var item_arr = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index];
						var spread_gap = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].HorizGap;
						var spread_product = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].SpreadItem;
						var horiz_gap = spread_gap;
						var item_length = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo.length;
						var itemy = -1;

						if (shelf_obj_type == "PEGBOARD" && items.NewItem == "Y") {
							g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].Y = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].Y + g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].H / 2 - g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].VertiStart - items.H / 2;
							g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].FromProductList = "Y";
							g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].Edited = "N";
						}

						if (shelf_obj_type == "PEGBOARD" && items.NewItem == "Y") {
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex];
							if (g_item_index == 0) {
								var shelf_start = shelfs.X - shelfs.W / 2 - shelfs.LOverhang + shelfs.HorizSpacing;
								g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].X = shelf_start + item_arr.W / 2;
							} else {
								g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].X = shelfs.ItemInfo[g_item_index - 1].X + shelfs.ItemInfo[g_item_index - 1].W / 2 + item_arr.W / 2 + shelfs.HorizSpacing;
							}
							var [itemx, itemy] = get_item_xy(shelfs, item_arr, item_arr.W, item_arr.H, p_pog_index);
							g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].Y = itemy;
						} else {
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex];
							var [itemx, itemy] = get_item_xy(shelfs, item_arr, item_arr.W, item_arr.H, p_pog_index);
							if (items.NewItem == "Y" || ((typeof item_arr.BottomObjID == "undefined" || item_arr.BottomObjID == "") && (typeof item_arr.TopObjID == "undefined" || item_arr.TopObjID == ""))) {
								g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].Y = itemy;
							}
							var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, items.MIndex, items.SIndex, g_item_index, "Y", item_length, "N", p_pog_index);
							var item_start = new_x - item_arr.W / 2;
							var item_end = new_x + item_arr.W / 2;
							g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].X = new_x;
							if (g_item_index > 0) {
								var prev_end = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index - 1].X + g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index - 1].W / 2;
							}
							console.log("before div", g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].Shelf, g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].Item, "prev_end", prev_end, "new start ", new_x - items.W / 2);

							//if there were dividers in the POG already. we need to and them back in same location as those detail will not come in
							//excel file.
							for (const div_arr of div_array) {
								var div_start = div_arr.X - div_arr.W / 2;
								var div_end = div_arr.X + div_arr.W / 2;

								if (g_item_index > 0) {
									var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, items.MIndex, items.SIndex, g_item_index, "Y", item_length, "N", p_pog_index);
									item_start = new_x - item_arr.W / 2;
									item_end = new_x + item_arr.W / 2;
								}
								if (div_start < item_end && div_end > item_start && items.MIndex == div_arr.MIndex && items.SIndex == div_arr.SIndex && div_arr.Added == "N") {
									div_arr.Added = "Y";
									g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo.splice(g_item_index, 0, div_arr);

									g_item_index = g_item_index + 1;
									var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, items.MIndex, items.SIndex, g_item_index, "Y", item_length, "N", p_pog_index);
									g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].X = new_x;
									if (g_item_index > 0) {
										var prev_end = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index - 1].X + g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index - 1].W / 2;
									}
								}
							}
						}

						var nesting_val = 0;
						if (item_arr.ItemNesting !== "") {
							if (item_arr.ItemNesting == "W") {
								nesting_val = item_arr.OrgNW;
							} else if (item_arr.ItemNesting == "H") {
								nesting_val = item_arr.OrgNH;
							} else if (item_arr.ItemNesting == "D") {
								nesting_val = item_arr.OrgND;
							}
						}
						//this will update new dimension details in iteminfo and validate if can be placed in shelf or not.
						var [select_width, select_height, select_depth] = get_select_dim(item_arr);
						const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(items.MIndex, items.SIndex, g_item_index, select_width, select_height, select_depth, item_arr.ItemNesting, nesting_val, item_arr.BHoriz, item_arr.BVert, item_arr.BaseD, item_arr.Orientation, item_arr.OrgCWPerc, item_arr.OrgCHPerc, item_arr.OrgCDPerc, "N", "Y", "N", p_pog_index);
						if (item_width !== "ERROR") {
							update_item_org_dim(items.MIndex, items.SIndex, g_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);
							var shelfs = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex];
							var l_items_details = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index];
							var [itemx, itemy] = get_item_xy(shelfs, l_items_details, l_items_details.W, l_items_details.H, p_pog_index);
							if ((typeof l_items_details.BottomObjID == "undefined" || l_items_details.BottomObjID == "") && (typeof l_items_details.TopObjID == "undefined" || l_items_details.TopObjID == "")) {
								g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].Y = itemy;
							}
							p_item_json[i].Valid = "Y";
						} else {
							var mod_width = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].W;
							var sum_width = 0;
							var valid = "Y";
							if (g_carpark_items.length > 0) {
								for (const parkitems of g_carpark_items) {
									if (parkitems.MIndex == items.MIndex) {
										sum_width += parkitems.W;
									}
								}
								valid = sum_width + g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index].W <= mod_width ? "Y" : "N";
							}
							//if we check if all the items in the excel can fit in all the shelf. if not we create one carpark shelf and dump all the items.
							if (valid == "Y") {
								var item_arr = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[g_item_index]));
								item_arr.MIndex = items.MIndex;
								item_arr.SIndex = items.SIndex;
								g_carpark_items.push(item_arr);
								var details = {};
								details["Module"] = items.Module;
								details["Shelf"] = items.Shelf;
								details["Item"] = items.Item;
								details["Carpark"] = "Y";
								details["UpldID"] = $v("P25_UPLD_ID");
								invalid_items.push(details);
							} else {
								var details = {};
								details["Module"] = items.Module;
								details["Shelf"] = items.Shelf;
								details["Item"] = items.Item;
								details["Carpark"] = "N";
								details["UpldID"] = $v("P25_UPLD_ID");
								invalid_items.push(details);
							}
							if (g_item_index == 0) {
								g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo.splice(g_item_index, g_item_index + 1);
							} else {
								g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo.splice(g_item_index, 1);
							}
							p_item_json[i].Valid = "N";
						}

						module = items.Module;
						old_mod_index = items.MIndex;
						old_shelf_index = items.SIndex;
					}
					i = i + 1;
				}

				for (const div_arr of div_array) {
					if (div_arr.Added == "N") {
						div_arr.Added = "Y";
						g_pog_json[p_pog_index].ModuleInfo[div_arr.MIndex].ShelfInfo[div_arr.SIndex].ItemInfo.push(div_arr);
					}
				}
				//If need to create carpark. it will be added in a module
				if (g_carpark_items.length > 0) {
					var details = get_min_max_xy(p_pog_index);
					var details_arr = details.split("###");
					var module_arr = [];
					var mod_ind = -1;

					for (const parkitems of g_carpark_items) {
						max_height = Math.max(max_height, parkitems.H);
						max_depth = Math.max(max_depth, parkitems.D);
						if (mod_ind !== parseInt($.trim(parkitems.MIndex))) {
							module_arr.push(parkitems.MIndex);
						}
						mod_ind = parseInt($.trim(parkitems.MIndex));
					}
					var i = 0;
					for (const l_module_index of module_arr) {
						//creating carpark info.
						carpark_shelf(l_module_index + 1, g_pog_json[p_pog_index].ModuleInfo[l_module_index].W, 0.04, max_depth + 0.1, g_pog_json[p_pog_index].ModuleInfo[l_module_index].X, parseFloat(details_arr[1]) + 0.03, l_module_index, p_pog_index);
						var j = 0;
						for (const parkitems of g_carpark_items) {
							parkitems.MIndex = typeof parkitems.MIndex == "undefined" ? 0 : parkitems.MIndex;
							if (l_module_index == parkitems.MIndex) {
								g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo.push(parkitems);
								var item_len = g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo.length - 1;
								var newx = (newy = -1);
								newy = g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].Y + g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].H / 2 + parkitems.H / 2;
								if (item_len == 0) {
									newx = g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].X - g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].W / 2 + parkitems.W / 2;
								} else {
									newx = g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo.length - 2].X + g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo.length - 2].W / 2 + parkitems.W / 2;
								}
								g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo[item_len].X = newx;
								g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo[item_len].Y = newy;
								g_pog_json[p_pog_index].ModuleInfo[l_module_index].Carpark[0].ItemInfo[item_len].Z = 0.05;
							}
							j = j + 1;
						}
						i = i + 1;
					}
				}
				$.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
					if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
						$.each(modules_info.ShelfInfo, function (j, shelf_info) {
							if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
								update_item_distance(i, j, p_pog_index);
								if (reorder_items(i, j, p_pog_index) && shelf_info.ObjType !== "PEGBOARD") {
									var item_arr = shelf_info.ItemInfo;
									var sorto = {
										X: "asc",
									};
									item_arr.keySort(sorto);
									if (shelf_info.SpreadItem !== "R") {
										$.each(item_arr, function (k, items) {
											var new_x = get_item_xaxis(items.W, items.H, items.D, shelf_info.ObjType, -1, shelf_info.HorizGap, shelf_info.SpreadItem, shelf_info.HorizGap, i, j, k, "Y", shelf_info.ItemInfo.length, "N", p_pog_index);
											var [itemx, itemy] = get_item_xy(shelf_info, items, items.W, items.H, p_pog_index);

											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].X = new_x;
											if (k > 0) {
												console.log(g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf, g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Item, "start ", new_x - items.W / 2, "prev end", g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k - 1].X + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k - 1].W / 2);
											}

											if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
												g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = itemy;
											}
										});
									} else {
										for (var k = item_arr.length - 1; k >= 0; k--) {
											var new_x = get_item_xaxis(item_arr[k].W, item_arr[k].H, item_arr[k].D, shelf_info.ObjType, -1, shelf_info.HorizGap, shelf_info.SpreadItem, shelf_info.HorizGap, i, j, k, "Y", shelf_info.ItemInfo.length, "N", p_pog_index);
											var [itemx, itemy] = get_item_xy(shelf_info, item_arr[k], item_arr[k].W, item_arr[k].H, p_pog_index);
											if (typeof item_arr.BottomObjID == "undefined" || item_arr.BottomObjID == "") {
												g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = itemy;
											}
											g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].X = new_x;
										}
									}
									//calculating the facings and adding vertical facings.
									if (shelf_info.ObjType !== "PEGBOARD" && shelf_info.ObjType !== "HANGINGBAR" && shelf_info.ObjType !== "ROD") {
										$.each(shelf_info.ItemInfo, function (k, items_arr) {
											var max_merch = get_shelf_max_merch(modules_info, shelf_info, i, j, p_pog_index, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
											var item_height = 0;
											if (items_arr.NewItem == "Y") {
												item_height = items_arr.H;
											} else {
												item_height = items_arr.RH / items_arr.BVert;
											}
											if ((typeof items_arr.TopObjID == "undefined" || items_arr.TopObjID == "") && (typeof items_arr.BottomObjID == "undefined" || items_arr.BottomObjID == "")) {
												if (g_max_facing_enabled == "Y") {
													var vert_facing = Math.floor((max_merch * 100) / (item_height * 100));
													var l_max_facing = nvl(items_arr.MPogVertFacings) > 0 ? items_arr.MPogVertFacings : items_arr.MVertFacings; //ASA-1408
													var new_facings = l_max_facing > -1 ? l_max_facing : $v("P25_POGCR_AUTO_MAX_VFACING"); //ASA-1408
													if (vert_facing > new_facings) {
														vert_facing = parseInt(new_facings);
													}
													items_arr.H = (items_arr.RH / items_arr.BVert) * (vert_facing > 0 ? vert_facing : 1);
													items_arr.BVert = vert_facing > 0 ? vert_facing : 1;
													items_arr.Y = shelf_info.Y + shelf_info.H / 2 + items_arr.H / 2;
													items_arr.RH = items_arr.H;
												} else if ($v("P25_POGCR_AUTO_VERT_FACING") == "Y" && g_max_facing_enabled == "N") {
													var vertFacingDefault = parseInt($v("P25_POGCR_DFLT_VERT_FACING"));
													if (vertFacingDefault > 0) {
														var l_max_facing = nvl(items_arr.MPogVertFacings) > 0 ? items_arr.MPogVertFacings : items_arr.MVertFacings; //ASA-1408
														var new_facings = l_max_facing < vertFacingDefault && l_max_facing > -1 ? parseInt(l_max_facing) : vertFacingDefault; //ASA-874
														var new_height = (items_arr.RH / items_arr.BVert) * new_facings;
														if (new_height <= max_merch) {
															items_arr.H = new_height;
															items_arr.BVert = new_facings;
															items_arr.Y = shelf_info.Y + shelf_info.H / 2 + items_arr.H / 2;
															items_arr.RH = items_arr.H;
														}
													}
												}
												var depth_facing = Math.floor((shelf_info.D * 100) / (items_arr.D * 100));
												var l_dfacing = nvl(items_arr.MPogDepthFacings) > 0 ? items_arr.MPogDepthFacings : items_arr.MDepthFacings; //ASA-1408
												depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874,  //ASA-1408
												items_arr.D = (items_arr.RD / items_arr.BaseD) * (depth_facing > 0 ? depth_facing : 1);
												depth_facing = Math.floor((shelf_info.D * 100) / (items_arr.D * 100)); //ASA-1316
												items_arr.BaseD = depth_facing > 0 ? depth_facing : 1;
												items_arr.RD = items_arr.D;
											}
										});
									}
								}
							}
						});
					}
				});

				for (const div_arr of div_array) {
					var i = 0;
					for (const items of g_pog_json[p_pog_index].ModuleInfo[div_arr.MIndex].ShelfInfo[div_arr.SIndex].ItemInfo) {
						if (div_arr.ObjID == items.ObjID) {
							g_pog_json[p_pog_index].ModuleInfo[div_arr.MIndex].ShelfInfo[div_arr.SIndex].ItemInfo.splice(i, 1);
						}
						i++;
					}
				}
				//location id renumbering to be done for new items added as they will be blank.
				$(".open_pdf").css("color", "black").css("cursor", "pointer");
				$(".open_pdf_online").css("color", "black").css("cursor", "pointer");
				var order_type = "",
					start_one_mod = "",
					start_one_fixel = "";
				if ($v("P25_UNQ_POG_MODULE_ITEM_LOC") == "Y") {
					order_type = 2;
					start_one_mod = 2;
				} else {
					order_type = 1;
					start_one_mod = "";
					start_one_fixel = 1;
				}
				location_numbering("LR", "LRTB", order_type, start_one_fixel, start_one_mod, p_pog_index);

				apex.server.process(
					"UPDATE_UPLD_WARNING",
					{
						x01: $v("P25_UPLD_ID"),
						p_clob_01: JSON.stringify(invalid_items),
					},
					{
						dataType: "text",
						success: function (pData) {
							if ($.trim(pData) != "") {
								raise_error(pData);
								logDebug("function : item_upld_create", "E");
								resolve("ERRORED");
							} else {
								var details = get_min_max_xy(p_pog_index);
								var details_arr = details.split("###");
								set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
								if (invalid_items.length > 0 || g_carpark_items.length > 0) {
									resolve("FAIL");
									apex.message.showPageSuccess(get_message("POGCR_ITEM_IMP_WARN"));
								} else {
									logDebug("function : item_upld_create", "E");
									resolve("PASS");
								}
							}
						},
						loadingIndicatorPosition: "page",
					}
				);
			}
		});
	} catch (err) {
		error_handling(err);
	}
}

//saving images into indexed DB when open 3D view. because we need to pass those images to 3D view. so save them in
//indexed DB and fetch them in the 3D view page after load.
function add_img_indexeddb(p_item_images) {
	const openRequest = indexedDB.open("myDatabase", 2);

	openRequest.onupgradeneeded = function (e) {
		g_db = e.target.result;
		const storeOS = g_db.createObjectStore("myDatabaseStore", {
			keyPath: "Item",
		});
	};
	openRequest.onsuccess = function (e) {
		console.log("running onsuccess");
		g_db = e.target.result;
		addItem(g_db);
	};
	openRequest.onerror = function (e) {
		console.dir(e);
	};

	function addItem(p_db) {
		var image_dtl = {};
		image_dtl["Item"] = "ImageDetail";
		image_dtl["ImgData"] = p_item_images;
		const tx = p_db.transaction("myDatabaseStore", "readwrite");
		const store = tx.objectStore("myDatabaseStore");
		console.log("before add to store  ", getDateTime());
		store.delete("ImageDetail");
		store.add(image_dtl);
	}
}

function get_img_indexeddb() {
	const transaction = g_db.transaction("myDatabaseStore");
	if (typeof transaction !== "undefined") {
		const objectStore = transaction.objectStore("myDatabaseStore");
		const request = objectStore.get("ImageDetail");
		g_ItemImages = request.result.ImgData;
	}
}

function save_validate_items_coll(p_err_items_arr) {
	logDebug("function : save_validate_items_coll", "S");
	return new Promise(function (resolve, reject) {
		apex.server.process(
			"ADD_VALIDATE_POG_JSON",
			{
				x01: "I",
				p_clob_01: JSON.stringify(p_err_items_arr),
			},
			{
				dataType: "text",
				success: function (pData) {
					if ($.trim(pData) != "") {
						raise_error(pData);
					} else {
						logDebug("function : save_validate_items_coll", "E");
						resolve("SUCESS");
					}
				},
				loadingIndicatorPosition: "page",
			}
		);
	});
}

//we create new session and browser tabs to open different pog. this can be selected from open exiting pog or draft.
async function open_in_new_tab(p_pog_code, p_pog_version, p_draft_seq_id, p_draft_desc, p_draft_version, p_pog_list) {
	logDebug("function : open_in_new_tab; pog_code : " + p_pog_code + "; pog_version : " + p_pog_version + "; draft_seq_id : " + p_draft_seq_id + "; draft_desc : " + p_draft_desc + "; draft_version : " + p_draft_version + "; pog_list : " + p_pog_list, "S");
	try {
		console.log("open", p_pog_list);
		return new Promise(function (resolve, reject) {
			if (p_pog_code !== "") {
				var p = apex.server.process(
					"GET_EXISTING_POG",
					{
						x01: p_pog_code,
						x02: p_pog_version,
					},
					{
						dataType: "html",
					}
				);
				// When the process is done, set the value to the sessionstorage and fetch the g_pog_json from the opened screen on load.
				p.done(function (data) {
					//we store the POG data in
					var return_data = $.trim(data);
					if (return_data.match(/ERROR.*/)) {
						sessionStorage.removeItem("POGJSON");
						javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_NEW_TAB_POG_CODE:Y,N," + p_pog_code);
						logDebug("function : open_in_new_tab", "E");
						resolve("SUCESS");
					} else if (return_data !== "") {
						g_pog_json = JSON.parse($.trim(data));
						$(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
						$(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
						$(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
						sessionStorage.setItem("POGJSON", LZString.compress($.trim(data)));
						sessionStorage.setItem("POGExists", "Y");
						sessionStorage.setItem("new_pog_ind", "N");
						sessionStorage.setItem("pog_opened", "E");
						sessionStorage.setItem("pog_list", p_pog_list);
						var showItemLabel = $v("P25_POGCR_SHOW_DFLT_ITEM_LOC");
						var showItemDesc = $v("P25_POGCR_DFT_ITEM_DESC");
						var Showliveimage = $v("P25_POGCR_DFLT_LIVE_IMAGES");
						var Shownotchlabel = $v("P25_POGCR_DFT_NOTCH_LABEL");
						var Showfixellabel = $v("P25_POGCR_DFT_FIXEL_LABEL");
						var showDaysOfSupply = $v("P25_POGCR_DFT_DAYS_OF_SUPPLY");
						var overhungShelf = $v("P25_POGCR_DFT_OVERHUNG_LABEL");
						g_show_fixel_label = Showfixellabel;
						g_show_item_label = showItemLabel;
						g_show_notch_label = Shownotchlabel;
						g_show_max_merch = "N";
						g_show_item_color = "N";
						g_show_item_desc = showItemDesc;
						g_show_live_image = Showliveimage;
						g_show_days_of_supply = showDaysOfSupply;
						g_overhung_shelf_active = overhungShelf;

						sessionStorage.setItem("g_show_fixel_label", g_show_fixel_label);
						sessionStorage.setItem("g_show_item_label", g_show_item_label);
						sessionStorage.setItem("g_show_notch_label", g_show_notch_label);
						sessionStorage.setItem("g_show_live_image", g_show_live_image);
						sessionStorage.setItem("g_show_max_merch", g_show_max_merch);
						sessionStorage.setItem("g_show_item_desc", g_show_item_desc);
						sessionStorage.setItem("g_show_fixel_space", g_show_fixel_space);
						sessionStorage.setItem("g_max_facing_enabled", g_max_facing_enabled);
						sessionStorage.setItem("g_show_item_color", g_show_item_color);
						sessionStorage.setItem("g_overhung_shelf_active", g_overhung_shelf_active); //ASA-1138
						sessionStorage.setItem("g_ComViewIndex", g_ComViewIndex);
						sessionStorage.setItem("g_ComBaseIndex", g_ComBaseIndex);
						sessionStorage.setItem("g_compare_view", g_compare_view);
						sessionStorage.setItem("g_compare_pog_flag", g_compare_pog_flag);
						sessionStorage.setItem("gPogIndex", g_pog_index);

						//ASA-1129, Start
						sessionStorage.setItem("g_combinedShelfs", JSON.stringify(g_combinedShelfs));
						sessionSetCombineDetails();
						//ASA-1129, Start
						console.log("open 1", p_pog_list);
						javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_NEW_TAB_POG_CODE:Y,N," + p_pog_code);
						logDebug("function : open_in_new_tab", "E");
						resolve("SUCESS");
					}
				});
			} else {
				//this block is used to open draft POG.
				async function doSomething() {
					var automate_ind = await get_draft_ind(p_draft_seq_id);
					var new_pog_ind = "Y";
					var pog_opened = "N";
					if (automate_ind == "Y") {
						pog_opened = "E";
						new_pog_ind = "N";
					}
					var p = apex.server.process(
						"GET_POG_JSON",
						{
							x01: p_draft_seq_id,
							x02: "",
						},
						{
							dataType: "html",
						}
					);
					// When the process is done, set the value to the page item
					p.done(function (data) {
						var return_data = $.trim(data);
						if (return_data.match(/ERROR.*/)) {
							javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_DRAFT_LIST,P25_POG_DESCRIPTION,P25_EXISTING_DRAFT_VER:Y,N," + p_draft_seq_id + "," + p_draft_desc + "," + p_draft_version);
							sessionStorage.removeItem("POGJSON");
							resolve("SUCESS");
						} else if (return_data !== "") {
							$(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
							$(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
							$(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
							g_pog_json = JSON.parse($.trim(data));
							g_pog_json[0].DesignType = automate_ind == "Y" ? "F" : "D";
							if (automate_ind == "Y") {
								async function save_pog_details() {
									var returnval = await save_pog_to_json(g_pog_json);
									sessionStorage.setItem("POGJSON", LZString.compress($.trim(data)));
									sessionStorage.setItem("POGExists", "Y");
									sessionStorage.setItem("new_pog_ind", new_pog_ind);
									sessionStorage.setItem("pog_opened", pog_opened);
									sessionStorage.setItem("P25_EXISTING_DRAFT_VER", p_draft_version);
									sessionStorage.setItem("g_show_fixel_label", g_show_fixel_label);
									sessionStorage.setItem("g_show_item_label", g_show_item_label);
									sessionStorage.setItem("g_show_notch_label", g_show_notch_label);
									sessionStorage.setItem("g_show_live_image", g_show_live_image);
									sessionStorage.setItem("g_show_max_merch", g_show_max_merch);
									sessionStorage.setItem("g_show_item_desc", g_show_item_desc);
									sessionStorage.setItem("g_show_fixel_space", g_show_fixel_space);
									sessionStorage.setItem("g_max_facing_enabled", g_max_facing_enabled);
									sessionStorage.setItem("g_show_item_color", g_show_item_color);
									sessionStorage.setItem("g_ComViewIndex", g_ComViewIndex);
									sessionStorage.setItem("g_ComBaseIndex", g_ComBaseIndex);
									sessionStorage.setItem("g_compare_view", g_compare_view);
									sessionStorage.setItem("g_compare_pog_flag", g_compare_pog_flag);
									javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_DRAFT_LIST,P25_POG_DESCRIPTION,P25_EXISTING_DRAFT_VER:Y,N," + p_draft_seq_id + "," + p_draft_desc + "," + p_draft_version);
									sessionStorage.removeItem("POGJSON");
									logDebug("function : open_in_new_tab", "E");
									resolve("SUCESS");
								}
								save_pog_details();
							} else {
								sessionStorage.setItem("POGJSON", LZString.compress($.trim(data)));
								$(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
								$(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
								$(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
								sessionStorage.setItem("POGExists", "Y");
								sessionStorage.setItem("new_pog_ind", new_pog_ind);
								sessionStorage.setItem("pog_opened", pog_opened);
								sessionStorage.setItem("P25_EXISTING_DRAFT_VER", p_draft_version);
								sessionStorage.setItem("g_show_fixel_label", g_show_fixel_label);
								sessionStorage.setItem("g_show_item_label", g_show_item_label);
								sessionStorage.setItem("g_show_notch_label", g_show_notch_label);
								sessionStorage.setItem("g_show_live_image", g_show_live_image);
								sessionStorage.setItem("g_show_max_merch", g_show_max_merch);
								sessionStorage.setItem("g_show_item_desc", g_show_item_desc);
								sessionStorage.setItem("g_show_fixel_space", g_show_fixel_space);
								sessionStorage.setItem("g_max_facing_enabled", g_max_facing_enabled);
								sessionStorage.setItem("g_show_item_color", g_show_item_color);
								sessionStorage.setItem("g_ComViewIndex", g_ComViewIndex);
								sessionStorage.setItem("g_ComBaseIndex", g_ComBaseIndex);
								sessionStorage.setItem("g_compare_view", g_compare_view);
								sessionStorage.setItem("g_compare_pog_flag", g_compare_pog_flag);
								javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_DRAFT_LIST,P25_POG_DESCRIPTION,P25_EXISTING_DRAFT_VER:Y,N," + p_draft_seq_id + "," + p_draft_desc + "," + p_draft_version);
								sessionStorage.removeItem("POGJSON");
								logDebug("function : open_in_new_tab", "E");
								resolve("SUCESS");
							}
						}
					});
				}
				doSomething();
			}
		});
	} catch (err) {
		error_handling(err);
	}
}

function save_chunk_image(p_random_val, p_objects, p_coll_name) {
	logDebug("function : save_chunk_image; coll_name : " + p_coll_name + "; random_val : " + p_random_val, "S");
	return new Promise(function (resolve, reject) {
		var p = apex.server.process(
			"SAVE_GET_IMAGE",
			{
				x01: "PUT",
				x02: p_random_val,
				x03: p_coll_name,
				p_clob_01: p_objects,
			},
			{
				dataType: "html",
			}
		);
		// When the process is done, set the value to the page item
		p.done(function (data) {
			if ($.trim(data) != "") {
				logDebug("function : save_chunk_image", "E");
				resolve("ERROR");
			} else {
				logDebug("function : save_chunk_image", "E");
				resolve("SUCESS");
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			resolve("ERROR");
		});
	});
}

async function save_image_to_coll(p_item_images, p_coll_name) {
	logDebug("function : save_image_to_coll; coll_name : " + p_coll_name, "S");
	var image_data = JSON.stringify(p_item_images);
	if (image_data.length > 10000000) {
		var image_chunks = chunkString(image_data, 10000000);
		var random_val = (Math.random() + 1).toString(36);
		for (const objects of image_chunks) {
			var returnval = await save_chunk_image(random_val, objects, p_coll_name);
		}
		logDebug("function : save_image_to_coll", "E");
		return "SUCCESS";
	} else {
		var random_val = (Math.random() + 1).toString(36);
		var p = apex.server.process(
			"SAVE_GET_IMAGE",
			{
				x01: "PUT",
				x02: random_val,
				x03: p_coll_name,
				p_clob_01: image_data,
			},
			{
				dataType: "html",
			}
		);
		// When the process is done, set the value to the page item
		p.done(function (data) {
			if ($.trim(data) != "") {
				logDebug("function : save_image_to_coll", "E");
				return "ERROR";
			} else {
				logDebug("function : save_image_to_coll", "E");
				return "SUCESS";
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			logDebug("function : save_image_to_coll", "E");
			return "ERROR";
		});
	}
}

//saving draft in sm_pog_design table. it can be single POG or multiple POG saving at once.
async function save_draft(p_saveType, p_description, p_draftVersion) {
	logDebug("function : save_draft; pSaveType : " + p_saveType + "; description : " + p_description + "; draftVersion : " + p_draftVersion, "S");
	try {
		//ASA-1729
		if (g_show_live_image == "N") {
			await clearHighlight(); //ASA-1578 Issue 1
		}
		pog_info = {};
		pog_list = [];
		if (g_all_pog_flag == "Y") {
			var i = 0;
		} else {
			var i = g_pog_index;
		}
		var g_ispog_savingerror = "N",
			g_pog_saving_error_msg = "";
		var errorStatus = "N";
		var errorMessage = "";
		for (const jsonData of g_pog_json) {
			if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
				var new_pogjson = [];
				new_pogjson.push(g_pog_json[i]);
				var details = await get_min_max_xy(i);
				var details_arr = details.split("###");
				new_pogjson[0].Cal_Width = parseFloat(details_arr[0] * 100);
				new_pogjson[0].Cal_height = parseFloat(details_arr[1] * 100);
                if ($v('P25_POG_EFF_START_DATE_UPDATE') === 'Y') {  // ASA-1983 Added if
                    let vDate = moment($v('P25_VDATE'), 'YYYYMMDD');
                    let effStartDate = moment(new_pogjson[0].EffStartDate, 'YYYYMMDD');                   
                    if (!effStartDate.isAfter(vDate)) {   //ASA-1983 Issue 11
                        let newDate = vDate.add(1, 'day').format('YYYYMMDD');
                        new_pogjson[0].EffStartDate = newDate;
                    }
                }
				if (typeof new_pogjson !== "undefined" && new_pogjson.length > 0) {
					if (new_pogjson[0].POGCode == "") {
						g_ispog_savingerror = "Y";
						errorStatus = "Y";
						g_pog_saving_error_msg = new_pogjson[0].POGCode + " - " + get_message("POG_CODE_NOT_NEEDED");
					} else {
						var returnval = validate_pog_detail("N", i);
						if (returnval == "Y") {
							g_ispog_savingerror = "Y";
							errorStatus = "Y";
							g_pog_saving_error_msg = g_pog_saving_error_msg + "\n" + new_pogjson[0].POGCode + " - " + get_message("ENTER_MADATORY_POG_DETAIL");
						} else {
							var POG_json = [];
							POG_json.push(g_pog_json[i]);
							$(".top_icon").removeClass("active");
							$(".left_icon").removeClass("active");
							$(".save_draft").addClass("active");
							pog_info = {};
							pog_info["POGCode"] = new_pogjson[0].POGCode;
							pog_info["Version"] = new_pogjson[0].Version;
							pog_info["status"] = "Y";
							if (g_all_pog_flag == "Y") {
                               
								// ASA-1924 Start
                                //pog_info["description"] = new_pogjson[0].POGCode;
								if (typeof p_description == "undefined" || p_description == "") {
                                    
									pog_info["description"] = new_pogjson[0].description;
                                     
								} else {
                                     
									pog_info["description"] = p_description;
                                     
								}
								// ASA-1924 End
                                pog_info["saveType"] = p_saveType;  //ASA-2045 Issue-1
								//pog_info["saveType"] = "N";  
                                                                
								pog_info["draftVersion"] = p_draftVersion; //ASA-1425 Issue 4
                                 

                               
							} else {
								if (typeof p_description == "undefined" || p_description == "") {
                                     
									pog_info["description"] = new_pogjson[0].description;
                                    
								} else {
                                     
									pog_info["description"] = p_description;
                                     
								}
								if (p_saveType == "S") {
                                    
									pog_info["draftVersion"] = p_draftVersion;
                                   
								} else {
                                   
									pog_info["draftVersion"] = p_draftVersion; //ASA-1425 Issue 4
								}
                                
								pog_info["saveType"] = p_saveType;
							}
							pog_info["pogjson"] = JSON.stringify(new_pogjson);
							pog_info["Cal_Width"] = new_pogjson[0].Cal_Width;
							pog_info["Cal_height"] = new_pogjson[0].Cal_height;
							pog_info["draftSeq"] = new_pogjson[0].draftSeq;
							pog_info["errorStatus"] = errorStatus;
							pog_info["errorMessage"] = errorMessage;
							pog_info["draftInd"] = "Y";
							pog_info["division"] = new_pogjson[0].Division;
							pog_info["dept"] = new_pogjson[0].Dept;
							pog_info["subDept"] = new_pogjson[0].SubDept;
							pog_list.push(pog_info);
						}
					}
				}
			}
			if (g_all_pog_flag == "Y") {
				i++;
			} else {
				break;
			}
		}
		console.log("pog_list", pog_list);
		apex.server.process(
			"SAVE_DRAFT",
             
			{
				p_clob_01: JSON.stringify(pog_list),
			},
			{
				dataType: "text",
				success: function (pData) {
					var return_data = $.trim(pData).split(",");
					if (return_data[0] == "ERROR") {
						raise_error(pData);
					} else {
						//identify if any change in POG
						sessionStorage.setItem("new_pog_ind", "Y");
						g_pog_edited_ind = "N";
						if (g_ispog_savingerror == "Y") {
							raise_error(g_pog_saving_error_msg);
						} else {
							//ASA-1694 Start
							if (typeof g_autofill_detail["AFVersion"] != "undefined") {
								//Regression 5 20250217
                               
								g_autofill_detail["AFPOGVersion"] = "";
								apex.server.process(
									"SAVE_AUTOFILL",
									{
										x01: g_autofill_detail["AFPOGCode"],
										x02: g_autofill_detail["AFVersion"],
										x03: g_autofill_detail["AutofillRule"],
										x04: g_autofill_detail["BlkSelType"],
										x05: g_autofill_detail["AFPOGVersion"],
										p_clob_01: JSON.stringify(filterAutoFillJsontag(g_autofill_detail)), //ASA-1965 TASK 1
									},
									{
										dataType: "text",
										success: function (pData) {
											var return_data = $.trim(pData).split(",");
											if (return_data[0] == "ERROR") {
												raise_error(pData);
											} else {
												apex.message.clearErrors();
												apex.message.showPageSuccess(g_pog_draft_save_msg);
											}
										},
									}
								);
							} else {
								apex.message.clearErrors();
								apex.message.showPageSuccess(g_pog_draft_save_msg);
							}
							//ASAS-1694 End
						}

						logDebug("function : save_draft", "E");
					}
				},
				loadingIndicatorPosition: "page",
			}
		);
	} catch (err) {
		error_handling(err);
	}
}
function get_draft_ind(p_seq_id) {
	logDebug("function : get_draft_ind; seq_id : " + p_seq_id, "S");
	console.log("get_draft_ind", p_seq_id);
	return new Promise(function (resolve, reject) {
		apex.server.process(
			"GET_DRAFT_IND",
			{
				x01: p_seq_id,
			},
			{
				dataType: "text",
				success: function (pData) {
					console.log("get_draft_ind pData", pData);
					if ($.trim(pData) != "") {
						logDebug("function : get_draft_ind", "E");
						resolve($.trim(pData));
					}
				},
			}
		);
	});
}

async function save_wpog(p_pog_list) {
	//ASA-1356 new function added  SAVE_WPOG
	logDebug("function : save_wpog");
	try {
		return new Promise(function (resolve, reject) {
			apex.server.process(
				"SAVE_WPOG",
				{
					p_clob_01: JSON.stringify(p_pog_list),
				},
				{
					dataType: "text",
					success: function (pData) {
						if ($.trim(pData) == "") {
							apex.message.showPageSuccess(g_pog_success_msg);
							resolve("SUCESS");
						} else {
							raise_error(pData);
						}
					},
					loadingIndicatorPosition: "page",
				}
			);
		});
	} catch (err) {
		error_handling(err);
	}
}

//this function is called from open_existing, open_draft to get existing pog, draft pog, or template. it will get the json and create
//the skeleton.
async function getJson(p_new_pog_ind, p_pog_code, p_pog_version, p_recreate, p_create_json, p_camera, p_scene, p_canvasNo, p_imageLoadInd = "N", p_resetparam = "Y", p_pog_desc) {
	//ASA-1765 Added p_pog_desc #issue 5
	logDebug("function : getJson; new_pog_ind : " + p_new_pog_ind + "; pog_version : " + p_pog_version + "; recreate : " + p_recreate + "; create_json : " + p_create_json, "S");
	try {
		return new Promise(function (resolve, reject) {
			var process_name;
			var pog_opened = "N";
			var automate_ind = "N";
			var items_arr = [];

			if (p_new_pog_ind == "Y") {
				//getting draft POG sm_pog_design
				process_name = "GET_POG_JSON";
				pog_opened = "N";
				$s("P25_OPEN_POG_CODE", "");
			} else if (p_new_pog_ind == "T") {
				//getting template from sm_pog_design
				process_name = "OPEN_TEMPLATE";
				pog_opened = "N";
				$s("P25_OPEN_POG_CODE", "");
			} else {
				//getting existing pog(here it can be a pog already opened and saved in WPD so a copy of json will be saved in sm_pog_design else
				//if opening first time any pog when it will come from sm_pog, sm_pog_module,sm_pog_fixel, sm_pog_item_position)
				process_name = "GET_EXISTING_POG";
				pog_opened = "E";
				//recreate = 'N';
			}
			var seq_id = -1;
			if (p_new_pog_ind == "Y") {
				seq_id = p_pog_version;
			} else {
				seq_id = p_pog_code;
			}
			var p = apex.server.process(
				process_name,
				{
					x01: seq_id,
					x02: p_pog_version,
				},
				{
					dataType: "html",
				}
			);
			// When the process is done, set the value to the page item
			p.done(function (data) {
				var processed = "Y";
				var return_data = $.trim(data);
				try {
					g_json = JSON.parse($.trim(data));
				} catch {
					processed = "N";
				}
				if (processed == "N") {
					raise_error(return_data);
					//ASA-1500
					/*try {
                    raise_error(return_data);
                    } catch {
                    removeLoadingIndicator(regionloadWait);
                    }*/
				} else if (return_data !== "") {
					g_json = JSON.parse($.trim(data));
					if (p_create_json == "Y") {
						// g_pog_json_data.push(g_json[0]);
						g_pog_json_data.push(JSON.parse(JSON.stringify(g_json[0]))); //Regression Issue 12 05082024
                        // ASA-1924 Issue-1 Start
						// if (typeof p_pog_desc !== "Undefined") { 
						// 	//ASA-1765 Added if/else to set Desc7  #issue 5
						// 	g_pog_json_data[0].Desc7 = p_pog_desc;
						// }       
                         // ASA-1924 Issue-1 End                 
					} else {
						g_pog_json_data = g_pog_json;
					}                    
					if (typeof g_pog_json_data !== "undefined") {
						//recreate the orientation view if any present
						async function recreate_view() {
							if (p_new_pog_ind == "Y") {
								automate_ind = await get_draft_ind(seq_id); //ASA-1710 $v("P25_DRAFT_LIST")
                                let draftVersion = await loadDraftVersion(seq_id); //ASA-1912
                                g_pog_json_data[g_pog_index].draftVersion = draftVersion; //ASA-1912
								if (p_new_pog_ind == "Y" && automate_ind == "Y") {
									pog_opened = "E";
									p_new_pog_ind = "N";
								}
							}
							sessionStorage.setItem("new_pog_ind", p_new_pog_ind);
							sessionStorage.setItem("pog_opened", pog_opened);
							sessionStorage.setItem("POGExists", "Y");
							//this function is used to set labels indicators by default BU Param.
							// 1655 Added new param p_resetparam= 'Y' to not reset flags when called from PLANO GRAPH
							if (p_resetparam == "Y") {
								await setDefaultState(p_new_pog_ind);
							}
                            
							//this function will create the skeleton.
							var return_val = await create_module_from_json(g_pog_json_data, p_new_pog_ind, "F", "N", pog_opened, "N" /* Stop Loading"Y"*/, "N", p_recreate, p_create_json, p_pog_version, "Y", p_camera, p_scene, g_pog_index, p_canvasNo, p_imageLoadInd);
                                                        
							if (p_new_pog_ind == "N" && automate_ind == "Y") {
								sessionStorage.setItem("new_pog_ind", "Y");
							}

							if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
								backupPog("F", -1, -1, g_pog_index);
							}
							if (g_compare_pog_flag == "Y" && g_compare_view !== "POG") {
								var returnval = await recreate_compare_views(g_compare_view, "N");
							}
							logDebug("function : getJson", "E");
							resolve("SUCCESS");
						}
						recreate_view();
					}
					clearUndoRedoInfo();
					g_dblclick_opened = "N";
				}
			});
		});
	} catch (err) {
		error_handling(err);
	}
}

//this function is used to open draft POG.
async function get_json_data(p_pog_code, p_imageLoadInd = "N", p_pog_desc) {
	//ASA-1765 added parameter p_pog_desc  #issue 5
	logDebug("function : get_json_data; pog_code : " + p_pog_code, "S");
	g_ComBaseIndex = -1;
	g_ComViewIndex = -1;
	g_compare_pog_flag = "N";
	g_compare_view = "NONE";
	g_colorBackup = "N";
	l_new_pog_ind = "N";
	var items_arr = [];
	g_pog_json_data = [];

	try {
		//if validate = 'Y' then we create only the json and then try to call item height, width, depth validation also validate shelf.
		//if found errors we suggest methods to correct them.
		if ($v("P25_POGCR_VALIDATE_POG") == "Y" && p_pog_code.length == 1) {
			init(0);
			objects = {};
			objects["scene"] = g_scene;
			objects["renderer"] = g_renderer;
			g_scene_objects.push(objects);
			set_indicator_objects(g_scene_objects.length - 1);
			g_pog_index = 0;
			// addLoadingIndicator(); //ASA-1500
			var returnval = await getJson("Y", "", p_pog_code[0], "N", "Y", g_camera, g_scene, 0, p_imageLoadInd, p_pog_desc); //ASA-1765 Added p_pog_desc  #issue 5
			var failed = "N";
			//this logic is wrong we need to call this save_validate_items_coll. but current failed variable is hardcoded to N.
			if (failed == "Y") {
				var returnval = await save_validate_items_coll(g_errored_items);
				removeLoadingIndicator(regionloadWait);
				apex.region("ig_errored_item").refresh();
				apex.event.trigger("#P25_ERROR_METHOD", "apexrefresh");
				g_dblclick_opened = "Y";
				openInlineDialog("errored_items", 60, 65);
			} else {
				g_dblclick_opened = "N";
				var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_camera, g_scene, g_pog_index, g_pog_index);
				animate_all_pog();
				generateMultiPogDropdown();
				if ($(".t-Body-actionsToggle").hasClass("is-active")) {
					apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
					apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
					apex.region("draggable_table").refresh();
				}
			}
		} else {
			g_scene_objects = [];
			g_canvas_objects = [];
			//this will create canvas can be multiple or single.
			appendMultiCanvasRowCol(p_pog_code.length, $v("P25_POGCR_TILE_VIEW"));
			//this will set the view. can be horizontal or vertical.
			switchCanvasView($v("P25_POGCR_TILE_VIEW")); // Task-22510

			// addLoadingIndicator();//ASA-1500
			g_multi_pog_json = [];
			//this function is used to set labels indicators by default BU Param.
			await setDefaultState("Y");
			for (var i = 0; i <= p_pog_code.length - 1; i++) {
				init(i);
				objects = {};
				objects["scene"] = g_scene;
				objects["renderer"] = g_renderer;
				g_scene_objects.push(objects);
				g_seqArrDtl = {};
				g_seqArrDtl["seqId"] = p_pog_code[i];
				g_seqArrDtl["index"] = i;
				g_seqArrDtl["pogCode"] = "";
				g_seqArrDtl["pogVersion"] = "";
				g_seqArrDtl["pogType"] = "D";
				g_seqArr.push(g_seqArrDtl);
				g_pog_index = i;
				set_indicator_objects(g_scene_objects.length - 1);
				var returnval = await getJson("Y", "", p_pog_code[i], "Y", "Y", g_camera, g_scene, i, p_imageLoadInd, "Y", p_pog_desc); //ASA-1765 Added p_pog_desc  #issue 5
				render(i);
				var canvas_id = g_canvas_objects[i].getAttribute("id");
				$("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[i].POGCode /*POGJSON[0].POGCode*/ + "</span>"); //HOTFIX
				//ASA-1500
				// if (i == p_pog_code.length - 1) {
				//     removeLoadingIndicator(regionloadWait);
				// }
			}

			g_pog_json = g_multi_pog_json;
			generateMultiPogDropdown();
			var retval = await animate_all_pog();
			if ($(".t-Body-actionsToggle").hasClass("is-active")) {
				apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
				apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
				apex.region("draggable_table").refresh();
			}

			if (p_imageLoadInd == "Y") {
				// addLoadingIndicator();
				var retval = await get_all_images(0, g_get_orient_images, "Y", $v("P25_POGCR_IMG_MAX_WIDTH"), $v("P25_POGCR_IMG_MAX_HEIGHT"), $v("P25_IMAGE_COMPRESS_RATIO"));
			}
			if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_imageLoadInd == "Y") {
				var pogIndx = 0;
				$(".live_image").addClass("live_image_active");
				for (const pogs of g_pog_json) {
					try {
						g_renderer = g_scene_objects[pogIndx].renderer;
						g_scene = g_scene_objects[pogIndx].scene;
						g_camera = g_scene_objects[pogIndx].scene.children[0];
						g_world = g_scene_objects[pogIndx].scene.children[2];
						var return_val = await recreate_image_items("Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
					} catch (err) {
						error_handling(err);
						// removeLoadingIndicator(regionloadWait); //ASA-1500
					}
					//ASA-1500
					// if (pogIndx == g_pog_json.length - 1) {
					//     removeLoadingIndicator(regionloadWait);
					// }
					pogIndx++;
				}
				g_imagesShown = "Y";
				animate_all_pog();
			}
			//ASA-1500
			// else if (p_imageLoadInd == "Y") {
			//     removeLoadingIndicator(regionloadWait);
			// }

			var j = 0;
			for (const r of g_pog_json) {
				if (j > 0) {
					await enableDisableFlags(j);
				}
				j++;
			}
			await save_update_json_items(g_multi_pog_json);

			g_pog_index = 0;
			if (g_scene_objects.length > 0) {
				if (typeof g_scene_objects[g_pog_index] !== "undefined") {
					if (typeof g_scene_objects[g_pog_index].Indicators !== "undefined") {
						g_show_fixel_label = g_scene_objects[g_pog_index].Indicators.FixelLabel;
						g_show_item_label = g_scene_objects[g_pog_index].Indicators.ItemLabel;
						g_show_notch_label = g_scene_objects[g_pog_index].Indicators.NotchLabel;
						g_show_max_merch = g_scene_objects[g_pog_index].Indicators.MaxMerch;
						g_show_item_color = g_scene_objects[g_pog_index].Indicators.ItemColor;
						g_show_item_desc = g_scene_objects[g_pog_index].Indicators.ItemDesc;
						g_show_live_image = g_scene_objects[g_pog_index].Indicators.LiveImage;
						g_show_days_of_supply = g_scene_objects[g_pog_index].Indicators.DaysOfSupply;
						g_overhung_shelf_active = g_scene_objects[g_pog_index].Indicators.OverhungShelf; //ASA-1138
						g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
						g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
					}
					var canvas_id = g_canvas_objects[g_pog_index].getAttribute("id");

					$("[data-pog]").removeClass("multiPogList_active");
					$(".canvas_highlight").removeClass("canvas_highlight");
					$("#" + canvas_id + "-btns").addClass("canvas_highlight");
					$("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
					g_all_pog_flag = "N";
				}
			}
		}
		var pindex = 0;
		for (const pog of g_pog_json) {
			items_arr = [];
			if (typeof g_pog_json[pindex].DeleteItems !== "undefined") {
				//ASA- S-1108
				if (g_pog_json[pindex].DeleteItems.length > 0) {
					var i = 0;
					for (var items of g_pog_json[pindex].DeleteItems) {
						items_arr.push(items.Item);
						i++;
					}
				}
			}
			if (typeof items_arr !== "undefined") {
				g_open_productlist = "D";
				await deleted_items_log(items_arr, "D", pindex);
			} //ASA- E-1108
			pindex++;
		}

		logDebug("function : get_json_data", "E");
	} catch (err) {
		error_handling(err);
	}
}

function set_indicator_objects(p_pog_index) {
	var ind_objects = {};
	ind_objects["FixelLabel"] = g_show_fixel_label;
	ind_objects["ItemLabel"] = g_show_item_label;
	ind_objects["NotchLabel"] = g_show_notch_label;
	ind_objects["MaxMerch"] = g_show_max_merch;
	ind_objects["ItemColor"] = g_show_item_color;
	ind_objects["ItemDesc"] = g_show_item_desc;
	ind_objects["LiveImage"] = g_show_live_image;
	ind_objects["DaysOfSupply"] = g_show_days_of_supply;
	ind_objects["OverhungShelf"] = g_overhung_shelf_active; //ASA-1138
	ind_objects["ItemSubLabelInd"] = g_itemSubLabelInd; //ASA-1182
	ind_objects["ItemSubLabel"] = g_itemSubLabel; //ASA-1182
	g_scene_objects[p_pog_index].Indicators = ind_objects;
}

//this function is used to open existing pog and called from open_existing. this will get json and create skeleton.
async function get_existing_pog(pog_code, pog_version, canvasNo, pMultiple, pImageLoadInd = "N") {
    logDebug("function : get_existing_pog; pog_code : " + pog_code + "; pog_version : " + pog_version, "S");
	$(".item_label").removeClass("item_label_active");
	$(".item_desc").removeClass("item_label_active");
	$(".fixel_label").removeClass("fixel_label_active");
	$(".notch_label").removeClass("notch_label_active");
	$(".fixel_merch").removeClass("max_merch_active");
	$(".item_color").removeClass("item_color_active");
	$(".overhung_shelf").removeClass("overhung_shelf_active"); //ASA-1138
	$(".item_sublabel").removeClass("item_sublabel_active"); //ASA-1182
	$("#item_sublbl_sub .items").removeClass("item_sublabel_active"); //ASA-1182
	sessionStorage.removeItem("g_color_arr");
	sessionStorage.removeItem("g_highlightArr");
	g_color_arr = [];
    g_initial_camera = null; //ASA-2048 Issue 8
	g_highlightArr = [];
	l_new_pog_ind = "N";

	try {
		//if validate = 'Y' then we create only the json and then try to call item height, width, depth validation also validate shelf.
		//if found errors we suggest methods to correct them.
		if ($v("P25_POGCR_VALIDATE_POG") == "Y" && pMultiple == "N") {
			init(canvasNo);
			objects = {};
			objects["scene"] = g_scene;
			objects["renderer"] = g_renderer;
			g_scene_objects.push(objects);
			set_indicator_objects(g_scene_objects.length - 1);
			// addLoadingIndicator(); //Task_28125
			var returnval = await getJson("N", pog_code, pog_version, "N", "Y", g_camera, g_scene, canvasNo, pImageLoadInd);
			//this function will run validation on all the items and shelf and create a collection with error details. if errors exists
			//it will open a popup with IG of error details and its correction method.
			var failed = await validate_pog(canvasNo);
			if (failed == "Y") {
				removeLoadingIndicator(regionloadWait);
				var returnval = await save_validate_items_coll(g_errored_items);
				apex.region("ig_errored_item").refresh();
				apex.event.trigger("#P25_ERROR_METHOD", "apexrefresh");
				g_dblclick_opened = "Y";
				openInlineDialog("errored_items", 60, 65);
			} else {
				g_dblclick_opened = "N";
				var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "N", "N", "Y", "N", "", "Y", g_camera, g_scene, g_pog_index, g_pog_index, pImageLoadInd);
				// removeLoadingIndicator(regionloadWait); //ASA-1500
			}
		} else {
			//else directly call the getjson to create skeleton.
			init(canvasNo);
			objects = {};
			objects["scene"] = g_scene;
			objects["renderer"] = g_renderer;
			g_scene_objects.push(objects);
			set_indicator_objects(g_scene_objects.length - 1);
			var returnval = await getJson("N", pog_code, pog_version, "Y", "Y", g_camera, g_scene, canvasNo, pImageLoadInd);
		}
        if (!g_initial_camera) { //ASA-2048 Issue 8
            g_initial_camera = g_camera.clone();
        }
		logDebug("function : get_existing_pog", "E");
	} catch (err) {
		error_handling(err);
	}
}

//this function is is used when P25_POGCR_VALIDATE_POG = 'Y' and there are errors in POG and user click on correct errors from the errors popup
//opened when opening existing POG or draft.
async function error_correction(p_pog_index) {
	logDebug("function : error_correction", "S");
	//if no errors directly create the POG. else try to reduce the errors in all errored items in the list.
	if (g_errored_items.length > 0) {
		var correct_cnt = 0;
		for (const objects of g_errored_items) {
			if (objects.Corrected == "N") {
				correct_cnt++;
			}
		}
		if (($v("P25_ERROR_METHOD") == "FAIL" || $v("P25_ERROR_METHOD") == "A") && $v("P25_DELETE_ITEMS") == "Y") {
			var item_list = "";
			var fail_exists = "N";

			for (const objects of g_errored_items) {
				if (objects.CorrectionMethod == "FAIL" && objects.Corrected == "N") {
					item_list = "," + objects.Item;
					fail_exists = "Y";
				}
			}
			item_list = item_list.substr(1);
			if (fail_exists == "Y") {
				//Task_29818 - Start
				// ax_message.set({
				//     labels: {
				//         ok: get_message("SHCT_YES"),
				//         cancel: get_message("SHCT_NO"),
				//     },
				// });

				// ax_message.set({
				//     buttonReverse: true,
				// });

				// ax_message.confirm(get_message("POGCR_ERROR_ITEMS_LIST", item_list), function (e) {
				//     if (e) {
				//         closeInlineDialog("errored_items");
				//         async function correction_errors() {
				//             //this function will try to correct the errors on item by crushing, deduce facings.
				//             var returnval = await correct_pog_errors($v("P25_ERROR_METHOD"), $v("P25_DELETE_ITEMS"), p_pog_index, 'N'); //ASA-1412
				//             correct_cnt = 0;
				//             for (const objects of g_errored_items) {
				//                 if (objects.Corrected == "N") {
				//                     correct_cnt++;
				//                 }
				//             }
				//             if (correct_cnt > 0) {
				//                 var returnval = await save_validate_items_coll(g_errored_items);
				//                 apex.region("ig_errored_item").refresh();
				//                 apex.event.trigger("#P25_ERROR_METHOD", "apexrefresh");
				//                 g_dblclick_opened = "Y";
				//                 openInlineDialog("errored_items", 60, 65);
				//             } else {
				//                 g_dblclick_opened = "N";
				//                 addLoadingIndicator();
				//                 var returnval = await reorder_errored_shelfs(g_errored_items, p_pog_index);
				//                 var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, g_pog_index, g_pog_index, "N");
				//             }
				//         }
				//         correction_errors();
				//     }
				// });

				confirm(get_message("POGCR_ERROR_ITEMS_LIST", item_list), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
					closeInlineDialog("errored_items");
					async function correction_errors() {
						//this function will try to correct the errors on item by crushing, deduce facings.
						var returnval = await correct_pog_errors($v("P25_ERROR_METHOD"), $v("P25_DELETE_ITEMS"), p_pog_index, "N"); //ASA-1412
						correct_cnt = 0;
						for (const objects of g_errored_items) {
							if (objects.Corrected == "N") {
								correct_cnt++;
							}
						}
						if (correct_cnt > 0) {
							var returnval = await save_validate_items_coll(g_errored_items);
							apex.region("ig_errored_item").refresh();
							apex.event.trigger("#P25_ERROR_METHOD", "apexrefresh");
							g_dblclick_opened = "Y";
							openInlineDialog("errored_items", 60, 65);
						} else {
							g_dblclick_opened = "N";
							addLoadingIndicator();
							var returnval = await reorder_errored_shelfs(g_errored_items, p_pog_index);
							var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, g_pog_index, g_pog_index, "N");
						}
					}
					correction_errors();
				});
				//Task_29818 - End
			} else {
				closeInlineDialog("errored_items");
				//this function will try to correct the errors on item by crushing, deduce facings.
				var returnval = await correct_pog_errors($v("P25_ERROR_METHOD"), $v("P25_DELETE_ITEMS"), p_pog_index, "N"); //ASA-1412
				correct_cnt = 0;
				for (const objects of g_errored_items) {
					if (objects.Corrected == "N") {
						correct_cnt++;
					}
				}
				if (correct_cnt > 0) {
					var returnval = await save_validate_items_coll(g_errored_items);
					apex.region("ig_errored_item").refresh();
					apex.event.trigger("#P25_ERROR_METHOD", "apexrefresh");
					g_dblclick_opened = "Y";
					openInlineDialog("errored_items", 60, 65);
				} else {
					g_dblclick_opened = "N";
					addLoadingIndicator();
					var returnval = await reorder_errored_shelfs(g_errored_items, p_pog_index);
					var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, g_pog_index, g_pog_index, "N");
				}
			}
		} else {
			closeInlineDialog("errored_items");
			//this function will try to correct the errors on item by crushing, deduce facings.
			var returnval = await correct_pog_errors($v("P25_ERROR_METHOD"), $v("P25_DELETE_ITEMS"), p_pog_index, "N"); //ASA-1412
			correct_cnt = 0;
			for (const objects of g_errored_items) {
				if (objects.Corrected == "N") {
					correct_cnt++;
				}
			}
			if (correct_cnt > 0) {
				var returnval = await save_validate_items_coll(g_errored_items);
				apex.region("ig_errored_item").refresh();
				apex.event.trigger("#P25_ERROR_METHOD", "apexrefresh");
				g_dblclick_opened = "Y";
				openInlineDialog("errored_items", 60, 65);
			} else {
				g_dblclick_opened = "N";
				addLoadingIndicator();
				var returnval = await reorder_errored_shelfs(g_errored_items, p_pog_index);
				var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, g_pog_index, g_pog_index, "N");
			}
		}
	} else {
		if (typeof g_pog_json[p_pog_index] !== undefined && g_pog_json[p_pog_index].length > 0) {
			g_dblclick_opened = "N";
			addLoadingIndicator();
			var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, g_pog_index, g_pog_index, "N");
		}
	}
	if (g_show_live_image == "Y") {
		animate_pog(p_pog_index);
	}
	logDebug("function : error_correction", "E");
}

async function reorder_errored_shelfs(p_error_items_arr, p_pog_index) {
	logDebug("function : reorder_errored_shelfs", "S");
	var normal_shelfs = p_error_items_arr.filter(function (a) {
		var key = a.SIndex + "|" + a.MIndex;
		if (!this[key]) {
			this[key] = true;
			return true;
		}
	}, Object.create(null));

	for (shelfs of normal_shelfs) {
		if (reorder_items(shelfs.MIndex, shelfs.SIndex, p_pog_index)) {
			shelfs.NewShelfRecreated = "Y";
			if (shelfs.ObjType == "PEGBOARD") {
				var horiz_gap = shelfs.ShelfInfo.VertiSpacing;
			} else {
				var horiz_gap = shelfs.ShelfInfo.HorizGap;
			}
			$.each(g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[shelfs.SIndex].ItemInfo, function (m, items) {
				var new_x = get_item_xaxis(items.W, items.H, items.D, shelfs.ShelfInfo.ObjType, items.X, horiz_gap, shelfs.ShelfInfo.SpreadItem, horiz_gap, shelfs.MIndex, shelfs.SIndex, m, "Y", shelfs.ShelfInfo.ItemInfo.length, "N", p_pog_index);
				items.X = new_x;
			});
			//}
		}
	}
	var re_shelf = p_error_items_arr.filter(function (a) {
		var key = a.NewShelfInd + "|" + a.MIndex;
		if (!this[key]) {
			this[key] = true;
			return true;
		}
	}, Object.create(null));

	for (shelfs of re_shelf) {
		if (shelfs.NewShelfInd !== "") {
			if (reorder_items(shelfs.MIndex, shelfs.NewShelfInd, p_pog_index)) {
				if (shelfs.ObjType == "PEGBOARD") {
					var horiz_gap = shelfs.ShelfInfo.VertiSpacing;
				} else {
					var horiz_gap = shelfs.ShelfInfo.HorizGap;
				}
				$.each(g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[shelfs.NewShelfInd].ItemInfo, function (m, items) {
					var new_x = get_item_xaxis(items.W, items.H, items.D, shelfs.ShelfInfo.ObjType, items.X, horiz_gap, shelfs.ShelfInfo.SpreadItem, horiz_gap, shelfs.MIndex, shelfs.NewShelfInd, m, "Y", shelfs.ShelfInfo.ItemInfo.length, "N", p_pog_index);
					items.X = new_x;
				});
			}
		}
	}
	logDebug("function : reorder_errored_shelfs", "E");
}

//this function is used when P25_POGCR_VALIDATE_POG = 'Y' and opening existing pog or draft this will try to crush item or reduce facing to solve the
//erros which occur when try to open POG and valiate each item.
async function correct_pog_errors(p_method, p_delete_item, p_pog_index, p_ignore_correction = "N") {
	//ASA-1412
	logDebug("function : correct_pog_errors; method : " + p_method + "; delete_item : " + p_delete_item, "S");
	if (g_errored_items.length > 0) {
		for (const objects of g_errored_items) {
			if (objects.Corrected == "N") {
				var shelfs = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
				var i = 0;
				var edit_item_index = -1;
				for (const item_info of shelfs.ItemInfo) {
					if (objects.IIndex == item_info.IIndex) {
						edit_item_index = i;
						break;
					}
					i = i + 1;
				}
				if (edit_item_index !== -1) {
					//ASA-1277 4 Prasanna
					var items = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index];
					//we will have identified correction method on how to solve the error.
					//C = crush, F - Facings reduce, NF - move to new shelf.
					if (objects.CorrectionMethod == "C" && (p_method == "C" || p_method == "A")) {
						var returnval = await check_crush_facing_correct(objects.MIndex, objects.SIndex, edit_item_index, "Y", items.X, items, shelfs, "N", "C", objects.ErrorCategory, p_pog_index);
						objects.Corrected = "Y";
					}
					if (objects.CorrectionMethod == "F" && (p_method == "F" || p_method == "A")) {
						var returnval = await check_crush_facing_correct(objects.MIndex, objects.SIndex, edit_item_index, "Y", items.X, items, shelfs, "N", "F", objects.ErrorCategory, p_pog_index);
						objects.Corrected = "Y";
					}
					if (objects.CorrectionMethod == "NF" && (p_method == "NF" || p_method == "A") && p_ignore_correction == "N") {
						//ASA-1412
						var check_dim = objects.ErrorCategory == "H" ? objects.ItemInfo.H : objects.ErrorCategory == "W" ? objects.ItemInfo.W : objects.ErrorCategory == "D" ? objects.ItemInfo.D : -1;
						var edit_item_index = -1;
						var n = 0;
						for (item_details of g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo) {
							if (item_details.IIndex == objects.IIndex) {
								edit_item_index = n;
								break;
							}
							n++;
						}

						var items = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index];
						var [returnval, new_shelf_ind] = await check_fixel_avail_space(objects.MIndex, objects.SIndex, edit_item_index, objects.ErrorCategory, check_dim, "N", objects.NewShelfInd, items, p_pog_index);
						objects.Corrected = "Y";
					}
					if (objects.CorrectionMethod == "FAIL" && (p_method == "FAIL" || p_method == "A") && p_ignore_correction == "N") {
						//ASA-1412
						var edit_item_index = -1;
						var n = 0;
						for (item_details of g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo) {
							if (item_details.IIndex == objects.ItemInfo.IIndex) {
								edit_item_index = n;
								break;
							}
							n++;
						}
						g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.splice(edit_item_index, 1);
						if (p_delete_item == "Y") {
							g_deletedItems.push(objects.Item);
							var res = await deleted_items_log(g_deletedItems, "D", p_pog_index);
						} else {
							if (g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark.length == 0) {
								var sum_width = 0;
								for (const new_objects of g_errored_items) {
									if (new_objects.CorrectionMethod == "FAIL" && new_objects.MIndex == objects.MIndex) {
										sum_width += new_objects.W;
									}
								}
								var details = get_min_max_xy(p_pog_index);
								var details_arr = details.split("###");
								carpark_shelf(objects.MIndex + 1, g_pog_json[p_pog_index].W, 0.04, objects.D + 0.1, g_pog_json[p_pog_index].W / 2, parseFloat(details_arr[1]) + 0.03, objects.MIndex, p_pog_index);
							}
							g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.push(objects.ItemInfo);
							var item_len = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.length - 1;
							var newx = (newy = -1);
							newy = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].Y + g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].H / 2 + objects.H / 2;
							if (item_len == 0) {
								newx = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].X - g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].W / 2 + objects.W / 2;
							} else {
								newx = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.length - 2].X + g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.length - 2].W / 2 + objects.W / 2;
							}
							g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[item_len].X = newx;
							g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[item_len].Y = newy;
							g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[item_len].Z = 0.05;
						}
						objects.Corrected = "Y";
					}
				}
			}
		}
	}
	logDebug("function : correct_pog_errors", "E");
}

async function get_template(p_template_name) {
	logDebug("function : get_template; p_template_name : " + p_template_name, "S");
	try {
		g_scene_objects = [];
		g_canvas_objects = [];
		appendMultiCanvasRowCol(1);

		g_pog_index = 0;
		addLoadingIndicator();
		g_multi_pog_json = [];
		g_pog_json_data = []; //ASA - 1573 Issue 4
		g_pog_json = []; //ASA - 1573 Issue 4
		init(0);
		objects = {};
		objects["scene"] = g_scene;
		objects["renderer"] = g_renderer;
		g_scene_objects.push(objects);
		var returnval = await getJson("T", "", "", "Y", "Y", g_camera, g_scene, 0);
		set_indicator_objects(0);
		removeLoadingIndicator(regionloadWait);
		logDebug("function : get_template", "E");
	} catch (err) {
		error_handling(err);
	}
}
function get_item_exists_orientation(p_item, p_pog_index) {
	var moduleInfo = g_pog_json[p_pog_index].ModuleInfo;
	var orientation;
	var orient_desc;
	var i = 0;
	for (var mod of moduleInfo) {
		var j = 0;
		for (var shelf of mod.ShelfInfo) {
			var k = 0;
			for (var item of shelf.ItemInfo) {
				if (p_item == item.Item) {
					orientation = item.Orientation;
					orient_desc = item.OrientationDesc;
				}
				k++;
			}
			j++;
		}
		i++;
	}
	return [orientation, orient_desc];
}

//find out the pegboard hole no based on the location of the item.
async function set_pegid(p_pog_index) {
	var i = 0;
	var item_y;
	var item_arr = [];
	var item_dtl;
	var min_top;
	var min_top_arr = [];
	var least_top;
	var minrange;
	var maxrange;
	var compare_top;
	var item_details = {};
	var item;

	for (var module of g_pog_json[p_pog_index].ModuleInfo) {
		var j = 0;
		for (var shelf of module.ShelfInfo) {
			if (shelf.ObjType == "PEGBOARD") {
				item_dtl = shelf.ItemInfo;
				var e = 0;
				for (const item of item_dtl) {
					if (item.NewPegId !== "") {
						item.NewPegId = "";
					}
					e++;
				}

				for (z = 1; z <= 10; z++) {
					var l = 0;
					min_top_arr = [];
					var index_arr = [];
					var shelf_top = shelf.Y + shelf.H / 2;
					for (var item_info of item_dtl) {
						if (typeof item_info.NewPegId == "undefined" || item_info.NewPegId == "") {
							min_top = wpdSetFixed(item_info.Y + item_info.H / 2); //.toFixed(4);
							min_top_arr.push(wpdSetFixed(shelf_top - min_top)); //.toFixed(4));
							index_arr.push(l);
						}
						l++;
					} //if (min_top_arr.length > 0){
					var min_distance = Math.min.apply(Math, min_top_arr);
					var index = min_top_arr.findIndex(function (number) {
						return number == min_distance;
					});
					if (index !== -1) {
						var least_item = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[index_arr[index]];
						var least_top = least_item.Y + least_item.H / 2;
						var minrange = least_top - g_minvalue;
						var maxrange = least_top + g_minvalue;
						//  }
						var l = 0;
						for (var item_info of item_dtl) {
							if (typeof item_info.NewPegId == "undefined" || item_info.NewPegId == "") {
								var item_top = item_info.Y + item_info.H / 2;
								if (item_top <= maxrange && item_top >= minrange) {
									item_info.NewPegId = z;
								}
							}
							l++;
						}
					}
				}
			}
			j++;
		}
		i++;
	}
}

function update_auto_position_peg() {
	if (g_pegbrd_auto_placing == "Y") {
		$(".auto_align_peg").removeClass("item_label_active");
		g_pegbrd_auto_placing = "N";
	} else {
		$(".auto_align_peg").addClass("item_label_active");
		g_pegbrd_auto_placing = "Y";
	}
}

//setting all indicators on screen for labels. to be ON or OFF based on BU param
async function setDefaultState(p_new_pog_ind) {
	g_module_obj_array = [];
	$(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
	$(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
	$(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
	$(".peg_holes").addClass("peg_hole_acive");
	g_peg_holes_active = "Y";
	$(".live_image").removeClass("live_image_active");
	g_show_peg_tags = "N";
	$(".peg_tag").removeClass("show_peg_tags");
	$(".fixel_merch").removeClass("max_merch_active");

	g_draftPogInd = p_new_pog_ind == "Y" ? "D" : "E";

	var showItemLabel = $v("P25_POGCR_SHOW_DFLT_ITEM_LOC");
	if (showItemLabel == "Y") {
		$(".item_label").addClass("item_label_active");
	} else {
		$(".item_label").removeClass("item_label_active");
	}
	var showItemDesc = $v("P25_POGCR_DFT_ITEM_DESC");
	if (showItemDesc == "Y") {
		$(".item_desc").addClass("item_label_active");
	} else {
		$(".item_desc").removeClass("item_label_active");
	}
	var Showliveimage = $v("P25_POGCR_DFLT_LIVE_IMAGES");
	if (Showliveimage == "Y" && showItemDesc == "N") {
		$(".live_image").addClass("live_image_active");
	} else {
		$(".live_image").removeClass("live_image_active");
	}
	var Shownotchlabel = $v("P25_POGCR_DFT_NOTCH_LABEL");
	if (Shownotchlabel == "Y") {
		$(".notch_label").addClass("notch_label_active");
	} else {
		$(".notch_label").removeClass("notch_label_active");
	}
	var Showfixellabel = $v("P25_POGCR_DFT_FIXEL_LABEL");
	if (Showfixellabel == "Y") {
		$(".fixel_label").addClass("fixel_label_active");
	} else {
		$(".fixel_label").removeClass("fixel_label_active");
	}
	var showDaysOfSupply = $v("P25_POGCR_DFT_DAYS_OF_SUPPLY");
	if (showDaysOfSupply == "Y") {
		$(".supply_days").addClass("item_label_active");
	} else {
		$(".supply_days").removeClass("item_label_active");
	}
	var fixel_avail_space = $v("P25_POGCR_DFLT_FIXEL_AVLSPACE_LBL");
	if (fixel_avail_space == "Y") {
		$(".fixel_space").addClass("item_label_active");
	} else {
		$(".fixel_space").removeClass("item_label_active");
	}
	var auto_depth_class = $v("P25_POGCR_AUTO_DEPTH_CAL");
	if (auto_depth_class == "Y") {
		$(".auto_depth").addClass("auto_depth_active");
	} else {
		$(".auto_depth").removeClass("auto_depth_active");
	}
	g_auto_cal_depth_fac = auto_depth_class;
	//ASA-1138
	var overHungLabel = $v("P25_POGCR_DFT_OVERHUNG_LABEL");
	if (overHungLabel == "Y") {
		$(".overhung_shelf").addClass("overhung_shelf_active");
	} else {
		$(".overhung_shelf").removeClass("overhung_shelf_active");
	}
	$(".open_product").css("display", "block");
	sessionStorage.setItem("g_show_item_desc", showItemDesc);
	g_show_fixel_label = Showfixellabel;
	g_show_item_label = showItemLabel;
	g_show_notch_label = Shownotchlabel;
	g_show_item_color = "N";
	g_show_item_desc = showItemDesc;
	g_show_live_image = Showliveimage;
	g_show_days_of_supply = showDaysOfSupply;
	g_show_fixel_space = fixel_avail_space;

	g_overhung_shelf_active = overHungLabel; //ASA-1138
	g_itemSubLabelInd = "N"; //ASA-1182
	g_itemSubLabel = ""; //ASA-1182

	if ($.trim(get_global_ind_values("AI_EDIT_IND")) == "Y") {
		$(".create_module").css("visibility", "visible");
		$(".create_shelf").css("visibility", "visible");
		$(".create_pegboard").css("visibility", "visible");
		$(".create_text").css("visibility", "visible");
		$(".create_hangingbar").css("visibility", "visible");
		$(".create_basket").css("visibility", "visible");
		$(".create_chest").css("visibility", "visible");
		$(".create_rod").css("visibility", "visible");
		$(".create_pallet").css("visibility", "visible");
		$(".create_divider").css("visibility", "visible");
		$(".fixel_label").css("display", "block");
		$(".item_label").css("display", "block");
		$(".open_fixel").css("display", "block");
		$(".clear_item").css("display", "block");
		$(".clear_pog_info").css("display", "block");
		$(".clear_pog_att").css("display", "block");
		if (p_new_pog_ind == "N") {
			$(".open_pdf").css("display", "block");
		} else {
			$(".open_pdf").css("display", "none");
		}
		$s("P25_OPEN_DRAFT", "Y");
		$(".auto_position").removeClass("auto_position_active");
		if (apex.region("draggable_table") !== null) {
			apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
			apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
			apex.region("draggable_table").refresh();
		}
	}
}

//creating canvas when open existing POG or draft. it can be single or multiple POG in same same. that we create multiple canvas on same screen.
//but we use single renderer to render scene on each canvas.
async function appendMultiCanvasRowCol(p_pog_count, p_type = $v("P25_POGCR_TILE_VIEW"), p_appendFlag = "N", p_compareWith) {
	console.log("dynamic rows cols");
	if (p_type == "H") {
		$(".viewH").addClass("view_active");
		$(".viewV").removeClass("view_active");
	} else {
		$(".viewV").addClass("view_active");
		$(".viewH").removeClass("view_active");
	}
	var containerH = $("#canvas-holder .container").height();
	var containerW = $("#canvas-holder .container").width();
	var rowCount = 1,
		colCount = 1,
		calcFlag = "Y",
		pogCount = 0;
	var currColCount,
		pendingPogCount = p_pog_count,
		compareApended = 0;

	var divs = [];
	$("[data-col]").each(function () {
		var element = $(this)[0];
		divs.push(element);
	});
	if (p_pog_count <= 3) {
		calcFlag = "N";
		currColCount = p_pog_count;

		colCount = p_pog_count;
	} else if (p_pog_count == 4) {
		calcFlag = "N";
		currColCount = 2;

		colCount = 2;
		rowCount = 2;
	} else if (p_pog_count == 5 || p_pog_count == 6 || p_pog_count == 9) {
		colCount = 3;
		rowCount = Math.ceil(p_pog_count / colCount);
	} else if (p_pog_count == 7 || p_pog_count == 8 || p_pog_count == 10 || p_pog_count == 11 || p_pog_count == 12 || p_pog_count == 16) {
		colCount = 4;
		rowCount = Math.ceil(p_pog_count / colCount);
	} else if (p_pog_count == 13 || p_pog_count == 14 || p_pog_count == 15 || p_pog_count == 17 || p_pog_count == 18 || p_pog_count == 19 || p_pog_count == 20) {
		colCount = 5;
		rowCount = Math.ceil(p_pog_count / colCount);
	} else {
		colCount = 5;
		rowCount = 5;
	}

	$("#canvas-holder .container").html("");
	if (p_type == "H") {
		$("#canvas-holder .container").addClass("h-view").removeClass("v-view");
	} else {
		$("#canvas-holder .container").addClass("v-view").removeClass("h-view");
	}
	for (var i = 1; i <= rowCount; i++) {
		$("#canvas-holder .container").append('<div class="row" data-row="' + i + '"></div>');

		if (calcFlag == "Y") {
			var res = pendingPogCount % (rowCount - i + 1);
			if (res > 0) {
				currColCount = colCount;
			} else {
				currColCount = pendingPogCount / (rowCount - i + 1);
				calcFlag = "N";
			}
			pendingPogCount = pendingPogCount - currColCount; //colCount;
		}
		for (var j = 1; j <= currColCount; j++) {
			var pogNo = pogCount == 0 ? "" : pogCount + 1;
			var canvasName = "maincanvas" + pogNo;

			if (p_appendFlag == "Y") {
				if (p_compareWith == pogCount - 1) {
					$("[data-row=" + i + "]").append('<div class="canvas-content" id="' + canvasName + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px"><div class="canvas-buttons" id="' + canvasName + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + pogCount + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + pogCount + ')"></span></div><canvas class="canvasregion" data-canvas=true id="' + canvasName + '" ></canvas></div>');
					compareApended = 1;
				} else {
					var currElmPos = pogCount - compareApended;
					var currElm = divs[currElmPos];

					$(currElm).attr("id", canvasName + "-container");
					$("[data-row=" + i + "]").append(currElm);

					var currElmId = $(currElm).attr("id");

					$("[data-row=" + i + "] #" + currElmId)
						.css("height", parseFloat((containerH / rowCount).toFixed(2)))
						.css("width", parseFloat((containerW / currColCount).toFixed(2)))
						.attr("data-col", j);

					$("[data-row=" + i + "] #" + currElmId + " .canvas-buttons").attr("id", canvasName + "-btns");
					$("[data-row=" + i + "] #" + currElmId + " .canvasregion").attr("id", canvasName);
				}
			} else {
				var buttonHtml = "";
				if (p_pog_count > 1) {
					buttonHtml = '<div class="canvas-buttons" id="maincanvas' + pogNo + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + pogCount + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + pogCount + ')"></span></div>';
				}
				$("[data-row=" + i + "]").append('<div class="canvas-content" id="maincanvas' + pogNo + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px">' + buttonHtml + '<canvas class="canvasregion" data-canvas=true id="maincanvas' + pogNo + '" ></canvas></div>');
			}
			pogCount++;
		}
	}
	if (p_appendFlag == "Y") {
		var incr = 0;
		for (var i = 1; i <= g_pog_json.length; i++) {
			if (i !== 2) {
				const pRenderer = g_renderer; //g_scene_objects[i - 1 - incr].renderer;
				const pScene = g_scene_objects[i - 1 - incr].scene;
				const pCamera = g_scene_objects[i - 1 - incr].scene.children.find((obj) => {
					return obj.type === "PerspectiveCamera";
				});
				var canvasName = "maincanvas" + (i == 1 ? "" : i);
				var canvasContainerH = $("#" + canvasName)
					.parent()
					.height();
				var canvasContainerW = $("#" + canvasName)
					.parent()
					.width();
				var canvasBtns = $("#" + canvasName + "-btns")[0];
				var canvasBtns_height = canvasBtns.offsetHeight;
				var canvasWidthOrg = canvasContainerW;
				var canvasHeightOrg = canvasContainerH - canvasBtns_height;

				var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
				pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
				pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
				pCamera.updateProjectionMatrix();
				pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
				//pRenderer.render(pScene, pCamera);
				render(i);
			} else if (i == 2) {
				incr = 1;
			}
		}
	}
	makeResizableRow(); // Task 22510
}

async function switchCanvasView(p_view, p_product_list_check = "N") {
	var containerH,
		containerW,
		renderFlag = "Y",
		rowCount,
		old_pogIndex = g_pog_index,
		colCount;
	rowCount = $("[data-row]").length;
	colCount = $("[data-col]").length;
	if ($(".a-Splitter-thumb").attr("title") == "Collapse") {
		p_product_list_check = "Y";
	}
	// [Task_22091], Start
	var drawRegW = $("#drawing_region").width();
	var sidebarW = $("#side_bar").width();
	containerW = drawRegW - sidebarW;
	containerH = $("#canvas-holder .container").height();
	$s("P25_POGCR_TILE_VIEW", p_view);
	// [Task_22091], End
	if (p_view == "H" && (($("#canvas-holder .container").hasClass("v-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
		$("#canvas-holder .container").css("display", "flex").addClass("h-view").removeClass("v-view");
		$(".viewH").addClass("view_active");
		$(".viewV").removeClass("view_active");

		for (var i = 1; i <= rowCount; i++) {
			var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
			$("[data-row=" + i + "] .canvas-content")
				.css("height", parseFloat((containerH / currColCOunt).toFixed(2)))
				.css("width", parseFloat((containerW / rowCount).toFixed(2)));
		}
	} else if (p_view == "V" && (($("#canvas-holder .container").hasClass("h-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
		$("#canvas-holder .container").css("display", "grid").addClass("v-view").removeClass("h-view");
		$(".viewV").addClass("view_active");
		$(".viewH").removeClass("view_active");

		for (var i = 1; i <= rowCount; i++) {
			var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
			$("[data-row=" + i + "] .canvas-content")
				.css("height", parseFloat((containerH / rowCount).toFixed(2)))
				.css("width", parseFloat((containerW / currColCOunt).toFixed(2)));
		}
	} else {
		renderFlag = "N";
	}
	if (renderFlag == "Y") {
		if (g_pog_json.length > 0) {
			//20240708 Regression issue 5
			g_canvas_objects = [];
			for (var i = 1; i <= g_pog_json.length; i++) {
				const pRenderer = g_renderer; //g_scene_objects[i - 1].renderer;
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
				var canvasBtns = $("#" + canvasName + "-btns")[0];
				var canvasBtns_height = g_scene_objects.length > 1 ? canvasBtns.offsetHeight : 0;
				var canvasWidthOrg = canvasContainerW;
				var canvasHeightOrg = canvasContainerH - canvasBtns_height;

				$("#" + canvasName)
					.css("height", canvasHeightOrg + "px !important")
					.css("width", canvasWidthOrg + "px !important");
				$("#" + canvasName).height(canvasHeightOrg); //ASA-1107
				$("#" + canvasName).width(canvasWidthOrg); //ASA-1107

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
				//pRenderer.render(pScene, pCamera);
				g_pog_index = i - 1;
				g_scene = pScene;
				g_camera = pCamera;
				render(i - 1);
			}
		} //20240708 Regression issue 5
	}
	g_pog_index = old_pogIndex;
}

//this function is used in save_pog_final. when there are errors from Saving process. we format the error to show on screen.
async function show_errors_final_pog(p_pog_info_err) {
	var erroMsg = "Failed POG",
		succMsg = "</br> Successfully Saved POG",
		hasSuccRec = "N",
		hasFailedRec = "N",
		combinedMsg;

	for (p of p_pog_info_err) {
		if (p.errorMessage != "") {
			hasFailedRec = "Y";
			erroMsg = erroMsg + "</br>" + p.errorMessage;
		}
	}
	for (p of p_pog_info_err) {
		if (p.errorMessage == "") {
			hasSuccRec = "Y";
			succMsg = succMsg + "</br>" + p.POGCode + " " + get_message("POGCR_SAVE_MSG");
		}
	}
	apex.message.clearErrors();
	if (hasSuccRec == "Y" && hasFailedRec == "N") {
		combinedMsg = succMsg;
	} else if (hasSuccRec == "N" && hasFailedRec == "Y") {
		combinedMsg = erroMsg;
	} else {
		combinedMsg = erroMsg + "</br>" + succMsg;
	}
	if (hasFailedRec == "Y") {
		try {
			raise_error(combinedMsg);
		} catch {
			removeLoadingIndicator(regionloadWait);
		}
	} else {
		apex.message.clearErrors();
		if ((p_pog_info_err.length = 1) && (typeof p_pog_info_err[0].workflowId !== "undefined" || p_pog_info_err[0].workflowId !== "") && p_pog_info_err[0].workflowId !== 0) {
			apex.message.showPageSuccess("POG sent to workflow approval");
		} else {
			apex.message.showPageSuccess(g_pog_success_msg);
		}
	}
	try {
		if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function" && ($v("P25_SAVE_WITH_PDF") == "" || $v("P25_SAVE_WITH_PDF") == "N")) {
			removeLoadingIndicator(regionloadWait);
		}
	} catch {
		console.log("no loading");
	}
}

function maximizePog(p_pog_index, p_type) {
	var maxSceneObj, maxPogjson, maxPogDataJson;
	// ASA-1910 Issue 4 and 5
	if (p_type !== 0) {
		g_is_pog_maximize = "Y"; //ASA-1898 Added to set pog maximize true used in menuActions
	} else {
		g_is_pog_maximize = "N";
	}
	if (p_type == 0) {
		maxSceneObj = g_scene_objects_backup[p_pog_index];
		maxPogjson = g_pogjson_backup[p_pog_index];
		maxPogDataJson = g_pogjson_data_backup[p_pog_index]; //ASA-1914 Issue5.3
		g_scene_objects.push(maxSceneObj);
		g_pog_json.push(g_pogjson_backup[p_pog_index]);
        //g_multi_pog_json.push(g_pogjson_backup[p_pog_index]); //ASA-2016
		g_pog_json_data.push(g_pogjson_data_backup[p_pog_index]);
		g_scene_objects_backup.splice(p_pog_index, 1);
		g_pogjson_backup.splice(p_pog_index, 1);
		g_pogjson_data_backup.splice(p_pog_index, 1);
	} else {
		maxSceneObj = g_scene_objects.splice(p_pog_index, 1);
		maxPogjson = g_pog_json.splice(p_pog_index, 1);
		maxPogDataJson = g_pog_json_data.splice(p_pog_index, 1);
		if (typeof g_scene_objects_backup !== "undefined" && g_scene_objects_backup.length > 0) {
			for (var i = 0; i < g_scene_objects.length; i++) {
				g_scene_objects_backup.push(g_scene_objects[i]);
				g_pogjson_backup.push(g_pog_json[i]);
				g_pogjson_data_backup.push(g_pog_json_data[i]);
			}
		} else {
			g_scene_objects_backup = g_scene_objects;
			g_pogjson_backup = g_pog_json;
			g_pogjson_data_backup = g_pog_json_data;
		}

		g_scene_objects = maxSceneObj;
		g_pog_json = maxPogjson;
        g_multi_pog_json = maxPogjson;  //ASA-2016
		g_pog_json_data = maxPogDataJson;
	}

	appendMultiCanvasRowCol(g_scene_objects.length, $v("P25_POGCR_TILE_VIEW"));
	modifyWindowAfterMinMax(g_scene_objects);
	generateCanvasListHolder(g_pogjson_backup);
	reset_compare_index(p_pog_index);
	add_pog_code_header();
	generateMultiPogDropdown();
	set_select_canvas(p_pog_index);
}

function add_pog_code_header() {
	$("#canvas-holder #block_title").remove();
	for (var i = 0; i < g_scene_objects.length; i++) {
		var canvas_id = g_canvas_objects[i].getAttribute("id");
		$("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[i].POGCode + "</span>");
	}
}



function reset_compare_index(p_pog_index) {
	var i = 0;
	for (const obj of g_pog_json) {
		if (obj.POGCode == g_comp_view_code) {
			g_ComViewIndex = i;
		}
		if (obj.POGCode == g_comp_base_code) {
			g_ComBaseIndex = i;
		}
		i++;
	}

	var i = 0;
	for (const obj of g_pogjson_backup) {
		if (obj.POGCode == g_comp_view_code) {
			g_ComViewIndex = i;
		}
		if (obj.POGCode == g_comp_base_code) {
			g_ComBaseIndex = i;
		}
		i++;
	}
}
//this function is used when there are multiple POG opened in same screen we provide minimize and maximize and close feature
//which will minimize the canvas.
function minimizePog(p_pog_index) {
	var minSceneObj, minPogjson, minPogDataJson;
	g_is_pog_maximize = "N"; //ASA-1898 Added to set pog maximize true used in menuActions
	minSceneObj = g_scene_objects.splice(p_pog_index, 1);
	minPogjson = g_pog_json.splice(p_pog_index, 1);
	minPogDataJson = g_pog_json_data.splice(p_pog_index, 1); //ASA-1914 Issue5.3

	g_scene_objects_backup.push(minSceneObj[0]);
	g_pogjson_backup.push(minPogjson[0]);
	g_pogjson_data_backup.push(minPogDataJson[0]);
	g_pog_index = g_pog_json.length - 1;
	p_pog_index = g_pog_index;

	appendMultiCanvasRowCol(g_scene_objects.length, $v("P25_POGCR_TILE_VIEW"));
	modifyWindowAfterMinMax(g_scene_objects);
	generateCanvasListHolder(g_pogjson_backup);
	reset_compare_index(p_pog_index);
	add_pog_code_header();
	generateMultiPogDropdown();
	set_select_canvas(g_pog_index);
}

function closePog(p_pog_index, p_type) {
	if (p_type == 0) {
		g_scene_objects_backup.splice(p_pog_index, 1);
		g_pogjson_backup.splice(p_pog_index, 1);
   		g_pogjson_data_backup.splice(p_pog_index, 1);
		generateCanvasListHolder(g_pogjson_backup);
	} else {
		//Task_29818 - Start
		// ax_message.set({
		//     /*S- ASA 1080 */
		//     labels: {
		//         ok: get_message("SHCT_YES"),
		//         cancel: get_message("SHCT_NO"),
		//     },
		// });
		// ax_message.set({
		//     buttonReverse: true,
		// });

		// ax_message.confirm(get_message("POGCR_CLOSE_POG_WARN"), function (e) {
		//     if (e) {
		//         g_scene_objects.splice(p_pog_index, 1);
		//         g_pog_json.splice(p_pog_index, 1);
		//         appendMultiCanvasRowCol(g_scene_objects.length, $v("P25_POGCR_TILE_VIEW"));
		//         modifyWindowAfterMinMax(g_scene_objects);
		//         if (p_pog_index == g_ComViewIndex && g_compare_pog_flag == "Y") {
		//             g_compare_view = "NONE";
		//             g_compare_pog_flag = "N";
		//             g_edit_pallet_mod_ind = -1;
		//             g_edit_pallet_shelf_ind = -1;
		//             g_ComViewIndex = -1;
		//             g_ComBaseIndex = -1;
		//             g_comp_view_code = "";
		//             g_comp_base_code = "";
		//         } else {
		//             reset_compare_index(p_pog_index);
		//         }
		//         add_pog_code_header();
		//         generateMultiPogDropdown();
		//         if (g_pog_json.length > 0) {
		//             g_pog_index = 0;
		//             set_select_canvas(g_pog_index); //Regression Issue 9 20240802
		//             ShowColorBackup(g_pog_index); //ASA-1464 Issue 3 //Regression Issue 9 20240802
		//         }
		//     } /*E- ASA 1080 */
		// });

		confirm(get_message("POGCR_CLOSE_POG_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
			g_scene_objects.splice(p_pog_index, 1);
			g_pog_json.splice(p_pog_index, 1);
            g_pog_json_data.splice(p_pog_index, 1); //ASA-1843  add line
			appendMultiCanvasRowCol(g_scene_objects.length, $v("P25_POGCR_TILE_VIEW"));
			modifyWindowAfterMinMax(g_scene_objects);
			if (p_pog_index == g_ComViewIndex && g_compare_pog_flag == "Y") {
				g_compare_view = "NONE";
				g_compare_pog_flag = "N";
				g_edit_pallet_mod_ind = -1;
				g_edit_pallet_shelf_ind = -1;
				g_ComViewIndex = -1;
				g_ComBaseIndex = -1;
				g_comp_view_code = "";
				g_comp_base_code = "";
			} else {
				reset_compare_index(p_pog_index);
			}
			add_pog_code_header();
			generateMultiPogDropdown();
			if (g_pog_json.length > 0) {
				g_pog_index = 0;
				set_select_canvas(g_pog_index); //Regression Issue 9 20240802
				ShowColorBackup(g_pog_index); //ASA-1464 Issue 3 //Regression Issue 9 20240802
			}
		});

		//Task_29818 - End
	}
}

//this function is used to render the canvas when minimize or maximize.
async function modifyWindowAfterMinMax(p_scene_objects) {
	g_scene_objects = [];
	console.log("modify");
	g_canvas_objects = [];
	var old_pogIndex = g_pog_index;
	for (var i = 0; i < p_scene_objects.length; i++) {
		init(i);
		var canvasName = "maincanvas";
		if (i > 0) {
			canvasName = "maincanvas" + (i + 1);
		}
		g_camera = p_scene_objects[i].scene.getObjectByProperty("type", "PerspectiveCamera");
		g_scene = p_scene_objects[i].scene;
		g_pog_index = i;
		console.log("scene", g_scene.uuid);
		var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
		var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;
		var canvasBtns = $("#" + canvasName + "-btns")[0];
		var canvasBtns_height;
		if (typeof canvasBtns !== "undefined") {
			canvasBtns_height = canvasBtns.offsetHeight;
		} else {
			canvasBtns_height = 0;
		}
		var canvasWidthOrg = canvasContainerW;
		var canvasHeightOrg = canvasContainerH - canvasBtns_height;
		$("#" + canvasName)
			.css("height", canvasHeightOrg + "px !important")
			.css("width", canvasWidthOrg + "px !important");
		$("#" + canvasName).height(canvasHeightOrg); //ASA-1107
		$("#" + canvasName).width(canvasWidthOrg); //ASA-1107
		g_camera.aspect = canvasWidthOrg / canvasHeightOrg;
		g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
		g_camera.updateProjectionMatrix();

		var details = get_min_max_xy(i);
		var details_arr = details.split("###");
		set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i);

		objects = {};
		objects["scene"] = g_scene;
		objects["renderer"] = g_renderer;
		console.log("objects", objects);
		g_scene_objects.push(objects);
		set_indicator_objects(i);
		render(i);
	}
	g_pog_index = old_pogIndex;
}

function generateCanvasListHolder(p_pog_json) {
	$("#canvas-list-holder").html("");
	if (p_pog_json.length > 0) {
		$("#canvas-list-holder").css({
			display: "flex",
			width: "auto",
		});
		$("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code expand-tab" onclick="expandAllPog()">' + g_expand_all_pog + "</span></div>");

		for (i = 0; i < p_pog_json.length; i++) {
			console.log("generage", i);
			$("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code">' + p_pog_json[i].POGCode + '</span><span class="fa fa-window-arrow-up canvas-expand" onClick=expandPog(' + i + ')></span><span class="fa fa-window-maximize canvas-max" onclick="maximizePog(' + i + ', 0)"></span><span class="fa fa-close canvas-close" onclick="closePog(' + i + ', 0)"></span></div>');
		}
		if ($("#canvas-list-holder").width() >= window.innerWidth) {
			$("#canvas-list-holder").css("width", "100%");
		}
	} else {
		$("#canvas-list-holder").css({
			display: "none",
			width: "auto",
		});
	}
}

function expandAllPog() {
    var i = 0;
	g_is_pog_maximize = "N"; //ASA-1898 Added to set pog maximize true used in menuActions
	for (g_scene of g_scene_objects_backup) {
		g_scene_objects.push(g_scene);
		g_pog_json.push(g_pogjson_backup[i]);
		g_pog_json_data.push(g_pogjson_data_backup[i]); //ASA-1914 Issue5.3
		i++;
	}
	g_scene_objects_backup = [];
	g_pogjson_backup = [];
	g_pogjson_data_backup = [];
	g_pog_index = g_pog_json.length - 1;

	var i = 0;
	for (const obj of g_pog_json) {
		if (obj.POGCode == g_comp_view_code) {
			g_ComViewIndex = i;
		}
		if (obj.POGCode == g_comp_base_code) {
			g_ComBaseIndex = i;
		}
		i++;
	}

	appendMultiCanvasRowCol(g_scene_objects.length, $v("P25_POGCR_TILE_VIEW"));
	modifyWindowAfterMinMax(g_scene_objects);
	generateCanvasListHolder(g_pogjson_backup);
	add_pog_code_header();
	generateMultiPogDropdown();
	set_select_canvas(g_pog_index);
}

function expandPog(p_pog_index) {
	var maxSceneObj, maxPogjson, maxPogDataJson;
	maxSceneObj = g_scene_objects_backup.splice(p_pog_index, 1);
	maxPogjson = g_pogjson_backup.splice(p_pog_index, 1);
	maxPogDataJson = g_pogjson_data_backup.splice(p_pog_index, 1); //ASA-1914 Issue5.3
	if (typeof g_scene_objects_backup !== "undefined" && g_scene_objects_backup.length > 0) {
		for (var i = 0; i < g_scene_objects.length; i++) {
			g_scene_objects_backup.push(g_scene_objects[i]);
			g_pogjson_backup.push(g_pog_json[i]);
			g_pogjson_data_backup.push(g_pog_json_data[i]);
		}
	} else {
		g_scene_objects_backup = g_scene_objects;
		g_pogjson_backup = g_pog_json;
		g_pogjson_data_backup = g_pog_json_data;
	}

	g_scene_objects = maxSceneObj;
	g_pog_json = maxPogjson;
	g_pog_json_data = maxPogDataJson;

	reset_compare_index(p_pog_index);

	appendMultiCanvasRowCol(g_scene_objects.length, $v("P25_POGCR_TILE_VIEW"));
	modifyWindowAfterMinMax(g_scene_objects);
	generateCanvasListHolder(g_pogjson_backup);
	add_pog_code_header();
	generateMultiPogDropdown();
	set_select_canvas(p_pog_index);
}

function get_draft_Desc(p_seq_id, p_pog_code, p_pog_version) {
	return new Promise(function (resolve, reject) {
		apex.server.process(
			"GET_DRAFT_DESCRIPTION",
			{
				x01: p_seq_id,
				x02: p_pog_code,
				x03: p_pog_version,
			},
			{
				dataType: "text",
				success: function (pData) {
					if ($.trim(pData) != "") {
						$s("P25_POG_DESCRIPTION", $.trim(pData));
						resolve($.trim(pData));
					}
				},
			}
		);
	});
}

//ASA-1107
//this function is use to create a streachable canvas. there will be line between each canvas and user can hold it and pull any side
//so the canvas we increase or decrease it width or height
function makeResizableDiv(p_canvasName) {
	const t_bodyNavW = $("#t_Body_nav").width();
	const t_topBarH = $("#top_bar").height();
	const t_apexHeader = $("#t_Header").height();
	const currentResizer = document.getElementById(p_canvasName + "-container");
	const dragLine = $("#resizeLine");

	var tileView, //H(Horizontal) or V(Vertical)
		currentId,
		currPogIndx = -1,
		adjPogIndx = -1,
		startX,
		startY,
		endX,
		endY,
		prevX,
		prevY,
		currCanvasRect,
		adjCanvasRect,
		currHtmlId,
		adjHtmlId,
		resizing = false;
	currentResizer.addEventListener("mousedown", initiateCanvasResize);

	function initiateCanvasResize(e) {
		if (g_dragging || resizing) {
			return;
		}
		console.log(e.target.className);
		if (e.target.className == "canvas-content") {
			e.preventDefault();
			window.addEventListener("mousemove", resize);
			window.addEventListener("mouseup", stopResize);
			resizing = true;
			tileView = $("#canvas-holder .container")[0].className.replace("container", "").replace("-view", "").toUpperCase().trim();
			currentId = e.srcElement.id;
			currPogIndx = parseInt($("#" + currentId + " canvas").attr("data-indx"));
			adjPogIndx = parseInt(currPogIndx - 1);
			currHtmlId = (currPogIndx == 0 ? "" : currPogIndx + 1).toString();
			adjHtmlId = (adjPogIndx == 0 ? "" : adjPogIndx + 1).toString();
			var currCanvasCont = $("#maincanvas" + currHtmlId + "-container")[0];
			var adjCanvasCont = $("#maincanvas" + adjHtmlId + "-container")[0];
			currCanvasRect = currCanvasCont.getBoundingClientRect();
			adjCanvasRect = adjCanvasCont.getBoundingClientRect();
			var currCanvasRight = currCanvasRect.right;
			var currCanvasBottom = currCanvasRect.bottom;
			var adjCanvasLeft = adjCanvasRect.left;
			var adjCanvasTop = adjCanvasRect.top;

			// 1 is for the border of drawing_region
			// 150 is to set a range for resizing so that POG is visible properly
			// If user wants to increase/decrease the size outside the range, user can minimize/maximize the POG
			startX = Math.round(adjCanvasLeft) - t_bodyNavW - 1 + 150;
			endX = Math.round(currCanvasRight) - t_bodyNavW - 1 - 150;
			startY = Math.round(adjCanvasTop) - t_topBarH - t_apexHeader - 1 + 150;
			endY = Math.round(currCanvasBottom) - t_topBarH - t_apexHeader - 1 - 150;
		} else {
			return;
		}
	}
	function resize(p_event) {
		if (resizing) {
			// drag the line in this code
			var draggingPointX = p_event.clientX - t_bodyNavW;
			var draggingPointY = p_event.clientY - t_topBarH - t_apexHeader;
			if (tileView == "V") {
				dragLine.css("width", "1px");
				dragLine.css("height", currCanvasRect.height + "px");
				dragLine.css("top", currCanvasRect.top - t_topBarH - t_apexHeader - 1 + "px");
				if (draggingPointX > startX && draggingPointX < endX) {
					prevX = p_event.clientX;
					dragLine.css("left", draggingPointX + "px");
				}
			} else if (tileView == "H") {
				dragLine.css("width", currCanvasRect.width + "px");
				dragLine.css("height", "1px");
				dragLine.css("left", currCanvasRect.left - t_bodyNavW - 1 + "px");
				if (draggingPointY > startY && draggingPointY < endY) {
					prevY = p_event.clientY;
					dragLine.css("top", draggingPointY + "px");
				}
			} else {
				resizing = false;
				window.removeEventListener("mousemove", resize);
				window.removeEventListener("mouseup", stopResize);
				dragLine.css("width", "0px");
				dragLine.css("height", "0px");
				dragLine.css("left", "0px");
				dragLine.css("top", "0px");
				return;
			}
		}
	}

	function stopResize(p_event) {
		if (resizing && typeof currPogIndx !== "undefined" && currPogIndx !== -1 && typeof adjPogIndx !== "undefined" && adjPogIndx !== -1) {
			var currCanvasW, currCanvasH, currSceneIndx, adjCanvasW, adjCanvasH, adjSceneIndx, validX, validY;
			var currCanvasBtnH = $("#maincanvas" + currHtmlId + "-container .canvas-buttons").height();
			var adjCanvasBtnH = $("#maincanvas" + adjHtmlId + "-container .canvas-buttons").height();
			window.removeEventListener("mousemove", resize);
			dragLine.css("width", "0px");
			dragLine.css("height", "0px");
			dragLine.css("left", "0px");
			dragLine.css("top", "0px");
			var i = 0;
			for (const obj of g_scene_objects) {
				var indx = $(g_canvas_objects[i]).attr("data-indx");
				if (indx == currPogIndx) {
					currSceneIndx = i;
				} else if (indx == adjPogIndx) {
					adjSceneIndx = i;
				}
				i++;
			}
			if (tileView == "V") {
				if (p_event.clientX >= startX && p_event.clientX <= endX) {
					validX = p_event.clientX;
				} else {
					validX = prevX;
				}
				if (currCanvasRect.left > validX && adjCanvasRect.right > validX) {
					currCanvasW = currCanvasRect.width + (currCanvasRect.left - validX);
					adjCanvasW = adjCanvasRect.width - (adjCanvasRect.right - validX);
				} else if (currCanvasRect.left < validX && adjCanvasRect.right < validX) {
					currCanvasW = currCanvasRect.width + (currCanvasRect.left - validX);
					adjCanvasW = adjCanvasRect.width - (adjCanvasRect.right - validX);
				} else {
					currCanvasW = currCanvasRect.width;
					adjCanvasW = adjCanvasRect.width;
				}
				$("#maincanvas" + currHtmlId + "-container").css("width", currCanvasW + "px");
				$("#maincanvas" + adjHtmlId + "-container").css("width", adjCanvasW + "px");
				currCanvasH = currCanvasRect.height;
				adjCanvasH = adjCanvasRect.height;
			} else if (tileView == "H") {
				if (p_event.clientY >= startY && p_event.clientY <= endY) {
					validY = p_event.clientY;
				} else {
					validY = prevY;
				}
				if (currCanvasRect.top > validY && adjCanvasRect.bottom > validY) {
					currCanvasH = currCanvasRect.height + (currCanvasRect.top - validY);
					adjCanvasH = adjCanvasRect.height - (adjCanvasRect.bottom - validY);
				} else if (currCanvasRect.top < validY && adjCanvasRect.bottom < validY) {
					currCanvasH = currCanvasRect.height + (currCanvasRect.top - validY);
					adjCanvasH = adjCanvasRect.height - (adjCanvasRect.bottom - validY);
				} else {
					currCanvasH = currCanvasRect.height;
					adjCanvasH = adjCanvasRect.height;
				}
				$("#maincanvas" + currHtmlId + "-container").css("height", currCanvasH + "px");
				$("#maincanvas" + adjHtmlId + "-container").css("height", adjCanvasH + "px");
				currCanvasW = currCanvasRect.width;
				adjCanvasW = adjCanvasRect.width;
				currCanvasH = currCanvasH - currCanvasBtnH;
				adjCanvasH = adjCanvasH - adjCanvasBtnH;
			} else {
				window.removeEventListener("mouseup", stopResize);
				resizing = false;
				return;
			}

			g_renderer.setPixelRatio(window.devicePixelRatio);

			var currCamera = g_scene_objects[currSceneIndx].scene.children[0];
			var details = get_min_max_xy(currSceneIndx);
			var curr_details_arr = details.split("###");
			g_canvas_objects[currSceneIndx] = document.getElementById("maincanvas" + currHtmlId);
			g_canvas_objects[currSceneIndx].width = currCanvasW;
			g_canvas_objects[currSceneIndx].height = currCanvasH;

			$("#maincanvas" + currHtmlId).width(currCanvasW);
			$("#maincanvas" + currHtmlId).height(currCanvasH);
			currCamera.aspect = currCanvasW / currCanvasH;
			currCamera.updateProjectionMatrix();
			g_scene_objects[currSceneIndx].scene.children[0] = currCamera;
			set_camera_z(currCamera, parseFloat(curr_details_arr[2]), parseFloat(curr_details_arr[3]), parseFloat(curr_details_arr[0]), parseFloat(curr_details_arr[1]), g_offset_z, parseFloat(curr_details_arr[4]), parseFloat(curr_details_arr[5]), true, currSceneIndx);

			context = g_canvas_objects[currSceneIndx].getContext("2d");
			g_renderer.setSize(currCanvasW, currCanvasH);
			currCamera.aspect = currCanvasW / currCanvasH;
			g_renderer.render(g_scene_objects[currSceneIndx].scene, currCamera);
			context.drawImage(g_renderer.domElement, 0, 0, currCanvasW, currCanvasH);
			currCamera.updateProjectionMatrix();
			g_scene_objects[currSceneIndx].scene.children[0] = currCamera;
			set_camera_z(currCamera, parseFloat(curr_details_arr[2]), parseFloat(curr_details_arr[3]), parseFloat(curr_details_arr[0]), parseFloat(curr_details_arr[1]), g_offset_z, parseFloat(curr_details_arr[4]), parseFloat(curr_details_arr[5]), true, currSceneIndx);

			var adjCamera = g_scene_objects[adjSceneIndx].scene.children[0];
			var details = get_min_max_xy(adjSceneIndx);
			var adj_details_arr = details.split("###");
			g_canvas_objects[adjSceneIndx] = document.getElementById("maincanvas" + adjHtmlId);
			g_canvas_objects[adjSceneIndx].width = adjCanvasW;
			g_canvas_objects[adjSceneIndx].height = adjCanvasH;
			adjCamera.aspect = adjCanvasW / adjCanvasH;
			adjCamera.updateProjectionMatrix();
			g_scene_objects[adjSceneIndx].scene.children[0] = adjCamera;
			set_camera_z(adjCamera, parseFloat(adj_details_arr[2]), parseFloat(adj_details_arr[3]), parseFloat(adj_details_arr[0]), parseFloat(adj_details_arr[1]), g_offset_z, parseFloat(adj_details_arr[4]), parseFloat(adj_details_arr[5]), true, adjSceneIndx);

			$("#maincanvas" + adjHtmlId).width(adjCanvasW);
			$("#maincanvas" + adjHtmlId).height(adjCanvasH);
			context = g_canvas_objects[adjSceneIndx].getContext("2d");
			g_renderer.setSize(adjCanvasW, adjCanvasH);
			adjCamera.aspect = adjCanvasW / adjCanvasH;
			g_renderer.render(g_scene_objects[adjSceneIndx].scene, adjCamera);
			context.drawImage(g_renderer.domElement, 0, 0, adjCanvasW, adjCanvasH);
			adjCamera.updateProjectionMatrix();
			g_scene_objects[adjSceneIndx].scene.children[0] = adjCamera;
			set_camera_z(adjCamera, parseFloat(adj_details_arr[2]), parseFloat(adj_details_arr[3]), parseFloat(adj_details_arr[0]), parseFloat(adj_details_arr[1]), g_offset_z, parseFloat(adj_details_arr[4]), parseFloat(adj_details_arr[5]), true, adjSceneIndx);

			window.removeEventListener("mouseup", stopResize);
			resizing = false;
		}
	}
}

// ASA-1138, Start
async function activateOverhungShelf(p_pog_index) {
	logDebug("function : activateOverhungShelf; ", "S");
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		if (g_all_pog_flag == "Y") {
			var i = 0;
		} else {
			var i = p_pog_index;
		}
		if (g_overhung_shelf_active == "Y") {
			g_overhung_shelf_active = "N";
			$(".overhung_shelf").removeClass("overhung_shelf_active");
		} else {
			g_overhung_shelf_active = "Y";
			$(".overhung_shelf").addClass("overhung_shelf_active");
		}
		for (const pogInfo of g_pog_json) {
			set_indicator_objects(i);
			if (g_all_pog_flag == "Y") {
				i++;
			} else {
				break;
			}
		}
	}
	logDebug("function : activateOverhungShelf; ", "E");
}

//this function is used in validate_pog. it will find out any items outside shelf width.
async function identifyOverhungItems(p_pog_index, p_validate, p_saveColl) {
	//ASA-1412 ,//Regression issue 1 20242806
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		if (g_all_pog_flag == "Y") {
			var i = 0;
		} else {
			var i = p_pog_index;
		}
	}
	var failed = "N";
	var ovrhgfailed = "N";
	var old_overhung_valid = g_overhung_validation;
	g_overhung_validation = "Y";
	for (const pogInfo of g_pog_json) {
		var module_details = g_pog_json[i].ModuleInfo;
		var j = 0;

		for (const Modules of module_details) {
			if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
				var k = 0;
				for (const shelf_info of Modules.ShelfInfo) {
					if (failed == "Y") {
						break;
					}
					if (typeof shelf_info !== "undefined") {
						if (shelf_info.ObjType == "SHELF" || shelf_info.ObjType == "HANGINGBAR") {
							if (failed == "Y") {
								break;
							}
							// if (typeof shelf_info.Overhung !== "undefined" && shelf_info.Overhung == "Y") {
							var shelfStart = shelf_info.X - shelf_info.W / 2 - shelf_info.LOverhang,
								shelfEnd = shelf_info.X + shelf_info.W / 2 + shelf_info.ROverhang;
							shelfStart = wpdSetFixed(shelfStart) - 0.001;
							// shelfStart = parseFloat(shelfStart.toFixed(4)) - 0.001;
							shelfEnd = wpdSetFixed(shelfEnd) + 0.001;
							// shelfEnd = parseFloat(shelfEnd.toFixed(4)) + 0.001;
							var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(shelf_info.X, shelf_info.Y, "N", j, k, shelf_info, i);
							var l = 0;
							var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(i, shelf_info.Shelf);
							if (currCombinationIndex == -1 && currShelfCombIndx == -1) {
								for (const item of shelf_info.ItemInfo) {
									var itemStart = wpdSetFixed(item.X) - wpdSetFixed(item.W / 2),
										itemEnd = wpdSetFixed(item.X) + wpdSetFixed(item.W / 2);
									itemStart = wpdSetFixed(itemStart); //.toFixed(4));
									itemEnd = wpdSetFixed(itemEnd); //.toFixed(4));
									//checking if items is outside the shelf or not.
									if ((itemStart < shelfStart || itemEnd > shelfEnd) && item_inside_world == "Y") {
										if (p_validate == "Y") {
											failed = "Y";
											ovrhgfailed = "Y";
											break;
										}
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].OverhungItem = "Y";
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].Overhung = "Y";
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].CarparkItem = "N";
									} else if (item_inside_world == "N") {
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].CarparkItem = "Y";
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].OverhungItem = "N";
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].Overhung = "N";
									} else if (item_inside_world == "Y") {
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].OverhungItem = "N";
										g_pog_json[i].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].CarparkItem = "N";
									}
									l++;
								}
							} else {
								var combinationShelfs = g_combinedShelfs[currCombinationIndex];
								last_shelf = combinationShelfs.length - 1;
								var f = 0;
								for (obj of combinationShelfs) {
									var shelfs = g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex];
									var shelfStart = wpdSetFixed(shelfs.X - shelfs.W / 2 - shelfs.LOverhang),
										shelfEnd = wpdSetFixed(shelfs.X + shelfs.W / 2 + shelfs.ROverhang);
									shelfStart = wpdSetFixed(shelfStart); //.toFixed(4));
									shelfEnd = wpdSetFixed(shelfEnd); //.toFixed(4));
									var l = 0;
									for (const items of shelfs.ItemInfo) {
										var itemStart = wpdSetFixed(items.X) - wpdSetFixed(items.W / 2), //ASA-1840 Added wpdSetFixed
											itemEnd = wpdSetFixed(items.X) + wpdSetFixed(items.W / 2);  //ASA-1840 Added wpdSetFixed
										itemStart = wpdSetFixed(itemStart); //.toFixed(4));
										itemEnd = wpdSetFixed(itemEnd); //.toFixed(4));
										if (((itemStart < shelfStart && f == 0) || (itemEnd > shelfEnd && last_shelf == f)) && item_inside_world == "Y") {
											if (p_validate == "Y") {
												failed = "Y";
												ovrhgfailed = "Y";
												break;
											}
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[l].OverhungItem = "Y";
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].Overhung = "Y";
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[l].CarparkItem = "N";
										} else if (item_inside_world == "N") {
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[l].CarparkItem = "Y";
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[l].OverhungItem = "N";
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].Overhung = "N";
										} else if (item_inside_world == "Y") {
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[l].OverhungItem = "N";
											g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[l].CarparkItem = "N";
										}
										l++;
									}
									f++;
								}
							}
							// }
						}
					}
					k++;
				}
			}
			j++;
		}
		if (failed == "N") {
			//Regression issue 1 20242806
			failed = await validate_pog(i, "Y", "Y"); // Regression 2 added p_byPassMedicineOverhung //regression 7 Prasanna
			if (failed == "Y") {
				ovrhgfailed = "N";
			}
			if (p_saveColl == "Y") {
				var returnval = await save_validate_items_coll(g_errored_items);
			}
		}
		// }
		if (g_all_pog_flag == "Y") {
			i++;
		} else {
			break;
		}
	}
	g_overhung_validation = old_overhung_valid;
	return [failed, ovrhgfailed];
}
// ASA-1138, End
//before reload of page we need to set the combine shelf details in sessionstorage, because the POG json is stringified and saved. but
//as the g_combineshelfs array has different format. it will corrupt when stringify. so we create normal json and then store.
function sessionSetCombineDetails() {
	try {
		logDebug("function : sessionSetCombineDetails", "S");
		var combinedShlfDets = [];
		if (g_combinedShelfs.length > 0) {
			var sorto = {
				MIndex: "asc",
				X: "asc",
			};
			g_combinedShelfs.keySort(sorto);
			var i = 0;
			for (combines of g_combinedShelfs) {
				var dets = {};
				dets["Index"] = i;
				dets["Start"] = combines.Start;
				dets["End"] = combines.End;
				dets["SpreadItem"] = combines.SpreadItem;
				dets["AllowAutoCrush"] = combines.AllowAutoCrush; //ASA-1307
				var dtl_list = {};
				var item_list = [];
				for (obj of combines.ItemInfo) {
					dtl_list["ObjID"] = obj.ObjID;
					dtl_list["PIndex"] = typeof obj.PIndex !== "undefined" && obj.PIndex !== "" ? obj.PIndex : combines[0].PIndex; //Regression 20240724
					dtl_list["MIndex"] = obj.MIndex;
					dtl_list["SIndex"] = obj.SIndex;
					dtl_list["IIndex"] = obj.IIndex;
					item_list.push(dtl_list);
				}
				dets["ItemInfo"] = item_list;
				combinedShlfDets.push(dets);
				i++;
			}
		}
		sessionStorage.setItem("combinedShlfDets", JSON.stringify(combinedShlfDets));
	} catch (err) {
		logDebug("function : sessionSetCombineDetails", "E");
		error_handling(err);
	}
}

//after reload of page we need to get the combine shelf details in sessionstorage,
function sessionGetCombineDetails() {
	try {
		logDebug("function : sessionGetCombineDetails", "S");
		if (g_combinedShelfs.length > 0) {
			var sorto = {
				MIndex: "asc",
				X: "asc",
			};
			g_combinedShelfs.keySort(sorto);
			var combinedShlfDets = JSON.parse(sessionStorage.getItem("combinedShlfDets"));
			var i = 0;
			for (cd of combinedShlfDets) {
				g_combinedShelfs[cd.Index]["Start"] = cd.Start;
				g_combinedShelfs[cd.Index]["End"] = cd.End;
				g_combinedShelfs[cd.Index]["SpreadItem"] = cd.SpreadItem;
				g_combinedShelfs[cd.Index]["AllowAutoCrush"] = cd.AllowAutoCrush; //ASA-1307
				var item_dtl = [];
				for (obj of cd.ItemInfo) {
					item_dtl.push(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[obj.IIndex]); //was earlier was g_pog_index and there was 2 pog.//Regression 20240724
				}
				g_combinedShelfs[cd.Index]["ItemInfo"] = item_dtl;
			}
		}
	} catch (err) {
		logDebug("function : sessionGetCombineDetails", "E");
		error_handling(err);
	}
}

//this function is used in find_pegboard_gap. this is used to find out place for any item in the pegboard or chest as pegboard,
//this will assign place to each item and place them automatically.
function get_auto_placing_item_loc(p_module_index, p_shelf_index, p_pog_index, p_item_index, p_width, p_height, p_dfl_x, p_dfl_y) {
	var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
	var shelfDtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
	var shelf_bottom = shelfDtl.Y - shelfDtl.H / 2 - shelfDtl.LoOverHang;
	var ItemAutoPlacing = shelfDtl.AutoPlacing;
	var shelf_end = shelfDtl.X + shelfDtl.W / 2 + shelfDtl.ROverhang;
	var peg_verti_arr = shelfDtl.peg_vert_values;
	var peg_horiz_arr = shelfDtl.peg_horiz_values;
	var peg_vert_details = [];
	var peg_horiz_details = [];
	var shelfyaxis = shelfDtl.Y;
	var yFound = "N";

	if (typeof ItemAutoPlacing == "undefined") {
		ItemAutoPlacing = "N";
	}
	if (peg_verti_arr.length > 0) {
		var j = 0;
		for (obj of peg_verti_arr) {
			peg_vert_details.push(shelfyaxis + peg_verti_arr[j]);
			j++;
		}
	}
	if (peg_horiz_arr.length > 0) {
		var k = 0;
		for (obj of peg_horiz_arr) {
			peg_horiz_details.push(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X + peg_horiz_arr[k]);
			k++;
		}
	}

	var l_finalX = -1;
	var l_finalY = -1;
	var valid = "Y";
	var hit_index = -1;
	var l_y_loc = "";
	var l_horz_idx = -1;
	var l_vert_idx = -1;
	var j = 0;
	var k = 0;

	for (l = 0; l < peg_horiz_details.length; l++) {
		l_horz_idx = l;
		if (l_finalX > -1) {
			break;
		}
		// var horiz_position = parseFloat(peg_horiz_details[l].toFixed(4));
		if (peg_horiz_details[l] + p_width + p_dfl_x < shelf_end) {
			for (j = 0; j < peg_vert_details.length; j++) {
				l_y_loc = peg_vert_details[j];
				l_vert_idx = j;
				if (peg_vert_details[j] - p_height - p_dfl_y > shelf_bottom) {
					var item_start = wpdSetFixed(peg_horiz_details[l]); //.toFixed(4));
					var item_end = wpdSetFixed(peg_horiz_details[l] + p_width); //.toFixed(4));
					var item_top = wpdSetFixed(peg_vert_details[j]); //.toFixed(4));
					var item_bottom = wpdSetFixed(peg_vert_details[j] - p_height); //.toFixed(4));

					var k = 0;
					var valid = "Y";
					var hit_index = -1;
					for (const items of itemdtl) {
						if (k != p_item_index) {
							var div_start = wpdSetFixed(items.X - items.W / 2); //.toFixed(4));
							var div_end = wpdSetFixed(items.X + items.W / 2); //.toFixed(4));
							var div_top = wpdSetFixed(items.Y + items.H / 2); //.toFixed(4));
							var div_bottom = wpdSetFixed(items.Y - items.H / 2); //.toFixed(4));

							if (((item_top > div_bottom && div_top > item_top) || item_end > shelf_end || (item_start <= div_end && div_start < item_start)) && div_start < item_start) {
								valid = "N";
								hit_index = k;
								break; //return false;
							} else {
								if ((((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) || (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) || (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) || (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) || (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) || (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
									valid = "N";
									hit_index = k;
									break;
								}
							}
						}
						k++;
					}
					if (valid == "Y") {
						var [l_finalY, top_idx] = get_top_y(item_top, itemdtl, 0.001, p_item_index, p_height, shelfDtl.ItemInfo[p_item_index]);
						if (l_vert_idx > 0) {
							l_finalY = l_finalY - p_dfl_y;
						}
						/*if (top_idx > -1) {
                        l_finalX = shelfDtl.ItemInfo[top_idx].X + (shelfDtl.ItemInfo[top_idx].W) + (shelfDtl.ItemInfo[p_item_index].W / 2) + p_dfl_x;
                        } else {*/
						l_finalX = item_start + p_width / 2 + p_dfl_x;
						//}

						if (l_horz_idx == 0) {
							l_finalX = l_finalX - p_dfl_x;
						}
						console.log("l_finalX ", l_finalX, l_finalY, itemdtl.Item);
						yFound = "Y";
						break;
					}
				} else {
					break;
				}
			}
		} else {
			break;
		}
		if (yFound == "Y") {
			break;
		}
	}
	return [l_finalX, l_finalY];
} //End ASA-1300
//ASA-1608 Issue 1

// ASA-1628 Task 3
function selectItemByGroup(pPogIndex, pGroupType, pGroupValue) {
	try {
		g_delete_details = [];
		clear_blinking();
		var compareTag;
		if (pGroupType == "IB") {
			compareTag = "Brand";
		} else if (pGroupType == "IS") {
			compareTag = "Supplier";
		} else if (pGroupType == "IG") {
			compareTag = "Group";
		} else if (pGroupType == "ID") {
			compareTag = "Dept";
		} else if (pGroupType == "IL") {
			compareTag = "Class";
		} else if (pGroupType == "IC") {
			compareTag = "SubClass";
		} else if (pGroupType == "ICDT1") {
			compareTag = "CDTLvl1";
		} else if (pGroupType == "ICDT2") {
			compareTag = "CDTLvl2";
		} else if (pGroupType == "ICDT3") {
			compareTag = "CDTLvl3";
		}
		var j = 0;
		for (const module of g_pog_json[pPogIndex].ModuleInfo) {
			if (module.ParentModule == null || module.ParentModule == "undefined") {
				var k = 0;
				for (const shelf of module.ShelfInfo) {
					if (typeof shelf !== "undefined") {
						if (shelf.ObjType !== "NOTCH" && shelf.ObjType !== "BASE" && shelf.ObjType !== "DIVIDER" && shelf.ObjType !== "TEXTBOX") {
							var l = 0;
							for (const item of shelf.ItemInfo) {
								if ((item.Item !== "DIVIDER" && pGroupValue !== "" && item[compareTag] == pGroupValue) || (pGroupValue == "" && nvl(item[compareTag]) == 0)) {
									var details = setDetailsArray(item.ObjID, j, k, item.W, item.H, item.X, item.Y, item.Z, l, shelf.ObjType, "N", "ITEM", module.MObjID, shelf.SObjID, item.ItemID, item.Item, "N", 0, 0, item.Distance, item.TopObjID, item.BottomObjID, g_start_canvas, g_present_canvas, pPogIndex);
									details["W"] = item.W;
									details["RW"] = item.RW;
									details["H"] = item.H;
									details["X"] = item.X;
									details["Y"] = item.Y;
									g_delete_details.multi_delete_shelf_ind = "";
									g_delete_details.push(details);
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

		if (g_delete_details.length > 0) {
			g_multiselect = "Y";
			g_mselect_drag = "Y";
			if (typeof g_delete_details !== "undefined") {
				$.each(g_delete_details, function (j, details) {
					var selectedObject = g_scene_objects[pPogIndex].scene.children[2].getObjectById(details.ObjID);
					g_intersected.push(selectedObject);
				});
			}
		}
		render_animate_selected();
	} catch (err) {
		error_handling(err);
	}
}

// ASA-1780 while copying the Shelf (ctrl+c+v) find the next Y position if max merch is defined or if not defined then use item height or default Max merch.
function get_yaxis_on_paste(p_cut_copy_arr, p_item_arr, p_module_index, p_shelf_index, p_pog_index) {
	try {
		logDebug("function : get_yaxis_on_paste", "S");
		var maxMerch = p_cut_copy_arr.MaxMerch;
		var maxAllowed = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].H + g_pog_json[p_pog_index].BaseH + p_cut_copy_arr.H / 2);
		let exists = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.some((shelf) => shelf.Y === maxAllowed);
		let newY = 0;
		var calcY = 0;
        if (maxMerch !== 0) {
            newY = maxMerch;
        } else if ((maxMerch === 0 || maxMerch === null) && p_item_arr.length > 0) {
            newY = Math.max(...p_item_arr.map((item) => item.H));
        } else {
            newY = Number(g_default_max_merch);
        }
        calcY = wpdSetFixed(newY + p_cut_copy_arr.Y + p_cut_copy_arr.H);

		for (let i = 1; i <= 30; i++) {
			const processed = validate_shelf_min_distance(p_module_index, p_shelf_index, calcY, p_item_arr, "N", p_module_index, p_cut_copy_arr.X, "N", p_cut_copy_arr, p_pog_index, "Y");
			if (processed !== "N") {
				break;
			} else {
                if(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[p_shelf_index].ObjType == "HANGINGBAR"){
                    calcY = calcY + newY + p_cut_copy_arr.H;
                } else {
                    calcY = calcY + newY + p_cut_copy_arr.H;;
                }
			}
		}
		if (calcY <= maxAllowed) {
			return calcY;
		} else if (calcY > maxAllowed && !exists) {
			calcY = maxAllowed;
			return calcY;
		} else {
			return -1;
		}
	} catch (err) {
		logDebug("function : get_yaxis_on_paste", "E");
		error_handling(err);
	}
}

function loadDraftVersion(p_seq_id) { //ASA-1912
	logDebug("function : loadDraftVersion; seq_id : " + p_seq_id, "S");
	console.log("loadDraftVersion", p_seq_id);
	return new Promise(function (resolve, reject) {
		apex.server.process(
			"GET_DRAFT_VERSION",
			{
				x01: p_seq_id,
			},
			{
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) !== "") {
                        resolve($.trim(pData)); // return the draft version here
                    } else {
                        resolve(null); // or reject if needed
                    }
                },
            }
		);
	});
}
