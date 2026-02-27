// Rotation of the scene is done by rotating the g_world about its
// y-axis.  (I couldn't rotate the camera about the scene since
// the Raycaster wouldn't work with a camera that was a child
// of a rotated object.)

//render animate will be called to render the canvas per milli seconds
function render_3danimate() {
    try {
        if (g_renderer != undefined) {
            requestAnimationFrame(perform3danimate);
        }
    } catch (err) {
        error_handling(err);
    }
}

function perform3danimate() {
    try {
        if (g_renderer != undefined) {
            g_renderer.render(g_scene, g_camera);
            requestAnimationFrame(perform3danimate);
        }
    } catch (err) {
        error_handling(err);
    }
}

function init_3d() {
    try {
        g_canvas = document.getElementById("scenecanvas");
        g_renderer = new THREE.WebGLRenderer({
            canvas: g_canvas,
            antialias: true,
        });
        g_canvas_objects.push(g_canvas);
    } catch (e) {
        document.getElementById("canvasholder").innerHTML = "<p><b>Sorry, an error occurred:<br>" + e + "</b></p>";
        return;
    }

    create3dWorld();
    g_raycaster = new THREE.Raycaster();
    window.addEventListener("resize", onWindowResize_3d, false);
    g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
    windowHeight = window.innerHeight;
    windowWidth = $('#canvasholder').innerWidth();      //window.innerWidth;    //ASA - 1652

    g_initial_windowHeight = window.innerHeight;
    g_camera.aspect = windowWidth / windowHeight;

    // adjust the FOV
    g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (windowHeight / g_initial_windowHeight));
    g_camera.updateProjectionMatrix();
    g_renderer.setSize(windowWidth, windowHeight);
    render();
    const l_controls = new OrbitControls(g_camera, g_renderer.domElement);
    l_controls.enableDamping = true;
    l_controls.enabled = true;
    l_controls.enablePan = true;
    l_controls.dampingFactor = 0.1;
    l_controls.autoRotate = false;
    l_controls.autoRotateSpeed = 0.2;
    l_controls.keyPanSpeed = 7.0;
    l_controls.enableZoom = true;
    l_controls.zoomSpeed = 1.0;
    onWindowResize_3d("", g_pog_index);
    g_renderer.shadowMap.enabled = true;
    g_renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    l_controls.update();
}

function onWindowResize_3d(p_event, p_pog_index) {
    try {
        windowHeight = window.innerHeight;
        windowWidth = $('#canvasholder').innerWidth();      //window.innerWidth;    //ASA - 1652
        g_camera.aspect = windowWidth / windowHeight;

        // adjust the FOV
        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (windowHeight / g_initial_windowHeight));

        g_renderer.setSize(windowWidth, windowHeight);
        set_camera_z(g_camera, g_json[0].CameraX - g_json[0].CameraW / 2, g_json[0].CameraY - g_json[0].CameraH / 2, g_json[0].CameraW, g_json[0].CameraH, parseFloat($v("P34_CAMERA_Z")), 0, 0, false, p_pog_index);
        g_camera.updateProjectionMatrix();
        render();
    } catch (err) {
        error_handling(err);
    }
}

async function create_module_from_json_3d(p_pogjson_arr, p_pog_index) {
    try {
        var HeadInfo = {};
        g_pog_json = [];
        var x, y, baseY;
        HeadInfo["Action"] = p_pogjson_arr[p_pog_index].Action;
        HeadInfo["SubDept"] = p_pogjson_arr[p_pog_index].SubDept;
        HeadInfo["BackDepth"] = p_pogjson_arr[p_pog_index].BackDepth;
        HeadInfo["TrafficFlow"] = p_pogjson_arr[p_pog_index].TrafficFlow;
        HeadInfo["HorzStart"] = p_pogjson_arr[p_pog_index].HorzStart;
        HeadInfo["HorzSpacing"] = p_pogjson_arr[p_pog_index].HorzSpacing;
        HeadInfo["VertStart"] = p_pogjson_arr[p_pog_index].VertStart;
        HeadInfo["VertSpacing"] = p_pogjson_arr[p_pog_index].VertSpacing;
        HeadInfo["AllowOverlap"] = p_pogjson_arr[p_pog_index].AllowOverlap;
        HeadInfo["SpecialType"] = p_pogjson_arr[p_pog_index].SpecialType;
        HeadInfo["SpecialTypeDesc"] = p_pogjson_arr[p_pog_index].SpecialTypeDesc;
        HeadInfo["DisplayMeterage"] = p_pogjson_arr[p_pog_index].DisplayMeterage;
        HeadInfo["RPTMeterage"] = p_pogjson_arr[p_pog_index].RPTMeterage;
        HeadInfo["EffStartDate"] = p_pogjson_arr[p_pog_index].EffStartDate;
        HeadInfo["BrandGroupID"] = p_pogjson_arr[p_pog_index].BrandGroupID;
        HeadInfo["Remarks"] = p_pogjson_arr[p_pog_index].Remarks;
        HeadInfo["FixtueGeneration"] = p_pogjson_arr[p_pog_index].FixtueGeneration;
        HeadInfo["FixtureType"] = p_pogjson_arr[p_pog_index].FixtureType;
        HeadInfo["StoreSegment"] = p_pogjson_arr[p_pog_index].StoreSegment;
        HeadInfo["Desc7"] = p_pogjson_arr[p_pog_index].Desc7;
        HeadInfo["Area"] = p_pogjson_arr[p_pog_index].Area;
        HeadInfo["POGCode"] = p_pogjson_arr[p_pog_index].POGCode;
        HeadInfo["Name"] = p_pogjson_arr[p_pog_index].Name;
        HeadInfo["Division"] = p_pogjson_arr[p_pog_index].Division;
        HeadInfo["Dept"] = p_pogjson_arr[p_pog_index].Dept;
        HeadInfo["Type"] = p_pogjson_arr[p_pog_index].Type;
        HeadInfo["H"] = p_pogjson_arr[p_pog_index].H;
        HeadInfo["W"] = p_pogjson_arr[p_pog_index].W;
        HeadInfo["D"] = p_pogjson_arr[p_pog_index].D;
        HeadInfo["SegmentW"] = p_pogjson_arr[p_pog_index].SegmentW;
        HeadInfo["BaseH"] = p_pogjson_arr[p_pog_index].BaseH;
        HeadInfo["BaseW"] = p_pogjson_arr[p_pog_index].BaseW;
        HeadInfo["BaseD"] = p_pogjson_arr[p_pog_index].BaseD;
        HeadInfo["NotchW"] = p_pogjson_arr[p_pog_index].NotchW;
        HeadInfo["NotchStart"] = p_pogjson_arr[p_pog_index].NotchStart;
        HeadInfo["NotchSpacing"] = p_pogjson_arr[p_pog_index].NotchSpacing;
        HeadInfo["CameraX"] = p_pogjson_arr[p_pog_index].CameraX;
        HeadInfo["CameraY"] = p_pogjson_arr[p_pog_index].CameraY;
        HeadInfo["CameraZ"] = p_pogjson_arr[p_pog_index].CameraZ;
        HeadInfo["CameraW"] = p_pogjson_arr[p_pog_index].CameraW;
        HeadInfo["CameraH"] = p_pogjson_arr[p_pog_index].CameraH;
        HeadInfo["X"] = p_pogjson_arr[p_pog_index].X;
        HeadInfo["Y"] = p_pogjson_arr[p_pog_index].Y;
        if (typeof p_pogjson_arr[p_pog_index].Color == "undefined") {
            HeadInfo["Color"] = $v("P34_POG_DEFAULT_COLOR");
        } else {
            HeadInfo["Color"] = p_pogjson_arr[p_pog_index].Color;
        }

        var halfwid = HeadInfo["CameraW"] / 2;
        var halfhig = HeadInfo["CameraH"] / 2;

        HeadInfo["BaseX"] = p_pogjson_arr[p_pog_index].BaseX - halfwid;
        HeadInfo["BaseY"] = p_pogjson_arr[p_pog_index].BaseY - halfhig;
        HeadInfo["BaseZ"] = p_pogjson_arr[p_pog_index].BaseZ;
        HeadInfo["CarPark"] = [];

        HeadInfo["ModuleInfo"] = [];
        g_pog_json.push(HeadInfo);
        x = HeadInfo["W"] / 2 - halfwid;
        y = HeadInfo["H"] / 2 + HeadInfo["BaseH"];

        HeadInfo["X"] = x;
        HeadInfo["Y"] = y;

        baseY = parseFloat(HeadInfo["BaseH"]) / 2;
        var colorValue = parseInt(HeadInfo["Color"].replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);

        HeadInfo["BaseZ"] = HeadInfo["BaseD"] / 2;

        //create base
        if (HeadInfo["BaseH"] > 0) {
            var return_val = await add_base_3d("BASE1", HeadInfo["BaseW"], HeadInfo["BaseH"], HeadInfo["BaseD"], hex_decimal, HeadInfo["BaseX"], HeadInfo["BaseY"], HeadInfo["BaseZ"], p_pog_index);
        }
        if (p_pogjson_arr[p_pog_index].ModuleInfo.length > 0) {
            var module_details = p_pogjson_arr[p_pog_index].ModuleInfo;
            var i = 0;
            for (const modules of module_details) {
                var ModuleInfo = {};
                ModuleInfo["SubDept"] = modules.SubDept;
                ModuleInfo["Rotation"] = modules.Rotation;
                ModuleInfo["HorzStart"] = modules.HorzStart;
                ModuleInfo["HorzSpacing"] = modules.HorzSpacing;
                ModuleInfo["VertStart"] = modules.VertStart;
                ModuleInfo["VertSpacing"] = modules.VertSpacing;
                ModuleInfo["AllowOverlap"] = modules.AllowOverlap;
                ModuleInfo["LNotch"] = modules.LNotch;
                ModuleInfo["Backboard"] = modules.Backboard;
                ModuleInfo["RNotch"] = modules.RNotch;
                ModuleInfo["LastCount"] = modules.LastCount;
                ModuleInfo["SeqNo"] = modules.SeqNo;
                ModuleInfo["Module"] = modules.Module;
                ModuleInfo["ParentModule"] = modules.ParentModule;
                ModuleInfo["ParentModuleIndex"] = modules.ParentModuleIndex;
                ModuleInfo["POGModuleName"] = modules.ModuleName;
                ModuleInfo["Remarks"] = modules.Remarks;
                ModuleInfo["H"] = modules.H;
                ModuleInfo["W"] = modules.W;
                ModuleInfo["D"] = modules.D;
                ModuleInfo["X"] = modules.X - halfwid;
                ModuleInfo["Y"] = modules.Y - halfhig;
                if (typeof modules.Color == "undefined") {
                    ModuleInfo["Color"] = $v("P34_MODULE_DEFAULT_COLOR");
                } else {
                    ModuleInfo["Color"] = modules.Color;
                }

                ModuleInfo["NotchW"] = modules.NotchW;
                ModuleInfo["NotchStart"] = modules.NotchStart;
                ModuleInfo["NotchSpacing"] = modules.NotchSpacing;

                ModuleInfo["Z"] = 0;

                ModuleInfo["ShelfInfo"] = [];

                g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);

                var colorValue = parseInt(ModuleInfo["Color"].replace("#", "0x"), 16);

                var hex_decimal = new THREE.Color(colorValue);
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var return_val = await create_final_module_3d(modules.Module, modules.W, modules.H, HeadInfo["BackDepth"], hex_decimal, ModuleInfo["Y"], ModuleInfo["VertStart"], ModuleInfo["VertSpacing"], ModuleInfo["HorzStart"], ModuleInfo["HorzSpacing"], ModuleInfo["X"], i, p_pog_index);
                }
                if (p_pogjson_arr[p_pog_index].ModuleInfo[i].ShelfInfo.length > 0) {
                    var return_val = await create_shelf_from_json_3d(i, p_pogjson_arr, modules.W, "Y", halfwid, halfhig, HeadInfo["BackDepth"], p_pog_index);
                }
                i = i + 1;
            }
        }
        set_camera_z_3d(g_camera, HeadInfo["CameraX"] - HeadInfo["CameraW"] / 2, HeadInfo["CameraY"] - HeadInfo["CameraH"] / 2, HeadInfo["CameraW"], HeadInfo["CameraH"], parseFloat($v("P34_CAMERA_Z")));
        render_3danimate();
        render();
        live_Image3D(); //ASA-2010 Issue 3
        removeLoadingIndicator(regionloadWait);
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

async function create_shelf_from_json_3d(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_half_width, p_half_height, p_backdept, p_pog_index) {
    try {
        var total_items = 0;
        var max_dept = 0;
        var l_itemz = 0;
        var l_item_dept = 0;
        var l_total_item_dept = 0;
        var l_item_count = 0;
        var l_originaldepth = 0;
        var l_cal_item_cnt = 0;
        if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0 && p_draft_ind == "N") {
            g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.splice(0);

            $.each(p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo, function (i, shelfs) {
                var selectedObject = g_world.getObjectById(shelfs.SObjID);
                g_world.getObjectById.remove(selectedObject);
            });
        }

        if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0) {
            $.each(p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo, function (i, Shelf) {
                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                    max_dept = Math.max(max_dept, p_backdept + Shelf.D);
                    if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.length > 0) {
                        $.each(Shelf.ItemInfo, function (j, items) {
                            max_dept = Math.max(max_dept, p_backdept + items.D);
                            if (Shelf.ObjType == "ROD") {
                                if (Shelf.DGap == 0 && Shelf.SpreadItem == "E") {
                                    if (items.BaseD > 1) {
                                        items.D = items.OD * items.BaseD;
                                    }
                                } else if (Shelf.DGap > 0 && Shelf.SpreadItem == "E") {
                                    if (items.BaseD > 1) {
                                        items.D = items.D + Shelf.DGap * (items.BaseD - 1);
                                    }
                                }
                                l_total_item_dept = l_total_item_dept + items.D;
                                if (Shelf.SpreadItem == "F") {
                                    l_originaldepth = l_originaldepth + items.OD * items.BaseD;
                                    l_cal_item_cnt = l_cal_item_cnt + items.BaseD;
                                }
                            }
                        });
                    }
                }
            });
        }

        if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0) {
            g_shelf_details = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
            var i = 0;
            for (const shelfs of g_shelf_details) {

                var ShelfInfo = {};
                ShelfInfo["X"] = shelfs.X - p_half_width;
                ShelfInfo["Y"] = shelfs.Y - p_half_height;
                ShelfInfo["Z"] = shelfs.Z;
                ShelfInfo["GrillH"] = shelfs.GrillH;
                ShelfInfo["LOverhang"] = shelfs.LOverhang;
                ShelfInfo["ROverhang"] = shelfs.ROverhang;
                ShelfInfo["SpacerThick"] = shelfs.SpacerThick;
                ShelfInfo["HorizGap"] = shelfs.HorizGap;
                ShelfInfo["SpreadItem"] = shelfs.SpreadItem;
                ShelfInfo["Combine"] = shelfs.Combine;
                ShelfInfo["AllowAutoCrush"] = shelfs.AllowAutoCrush;
                ShelfInfo["HorizSlotStart"] = shelfs.HorizSlotStart;
                ShelfInfo["HorizSlotSpacing"] = shelfs.HorizSlotSpacing;
                ShelfInfo["HorizStart"] = shelfs.HorizStart;
                ShelfInfo["HorizSpacing"] = shelfs.HorizSpacing;
                ShelfInfo["UOverHang"] = shelfs.UOverHang;
                ShelfInfo["LOverHang"] = shelfs.LoOverHang;
                ShelfInfo["VertiStart"] = shelfs.VertiStart;
                ShelfInfo["VertiSpacing"] = shelfs.VertiSpacing;
                ShelfInfo["BsktFill"] = shelfs.BsktFill;
                ShelfInfo["BsktSpreadProduct"] = shelfs.BsktSpreadProduct;
                ShelfInfo["SnapTo"] = shelfs.SnapTo;
                ShelfInfo["BsktWallH"] = shelfs.BsktWallH;
                ShelfInfo["BsktBaseH"] = shelfs.BsktBaseH;
                ShelfInfo["BsktWallThickness"] = shelfs.BsktWallThickness;
                ShelfInfo["DSlotStart"] = shelfs.DSlotStart;
                ShelfInfo["DSlotSpacing"] = shelfs.DSlotSpacing;
                ShelfInfo["DGap"] = shelfs.DGap;
                ShelfInfo["FrontOverHang"] = shelfs.FrontOverHang;
                ShelfInfo["BackOverHang"] = shelfs.BackOverHang;
                ShelfInfo["SlotDivider"] = shelfs.SlotDivider;
                ShelfInfo["AvlSpace"] = shelfs.W + shelfs.LOverhang + shelfs.ROverhang;
                ShelfInfo["WrapText"] = shelfs.WrapText;
                ShelfInfo["ReduceToFit"] = shelfs.ReduceToFit;
                ShelfInfo["Shelf"] = shelfs.Shelf;
                ShelfInfo["ObjType"] = shelfs.ObjType;
                ShelfInfo["Desc"] = shelfs.Desc;
                ShelfInfo["MaxMerch"] = shelfs.MaxMerch;
                ShelfInfo["H"] = shelfs.H;
                ShelfInfo["W"] = shelfs.W;
                ShelfInfo["D"] = shelfs.D;
                ShelfInfo["Rotation"] = shelfs.Rotation;
                ShelfInfo["Slope"] = shelfs.Slope;
                ShelfInfo["FStyle"] = shelfs.FStyle;
                ShelfInfo["FSize"] = shelfs.FSize;
                ShelfInfo["FBold"] = shelfs.FBold;
                ShelfInfo["TextImg"] = shelfs.TextImg;

                if (typeof shelfs.Color == "undefined") {
                    ShelfInfo["Color"] = $v("P34_SHELF_DEFAULT_COLOR");
                } else {
                    ShelfInfo["Color"] = shelfs.Color;
                }
                ShelfInfo["LiveImage"] = shelfs.LiveImage;
                ShelfInfo["InputText"] = shelfs.InputText;
                ShelfInfo["ItemInfo"] = [];
                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.push(ShelfInfo);
                if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE" && shelfs.ObjType !== "DIVIDER") {
                    var colorValue = parseInt(ShelfInfo["Color"].replace("#", "0x"), 16);
                    var hex_decimal = new THREE.Color(colorValue);
                    var final_height = 0;
                    if (max_dept == 0) {
                        max_dept = p_backdept / 2 + ShelfInfo["D"] / 2;
                    }
                    if (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null)) {
                        if (ShelfInfo["ObjType"] == "PEGBOARD") {
                            var return_val = add_pegboard_3d(ShelfInfo["Shelf"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], ShelfInfo["VertiStart"], ShelfInfo["VertiSpacing"], ShelfInfo["HorizStart"], ShelfInfo["HorizSpacing"], p_mod_index, p_pog_index);
                        } else if (ShelfInfo["ObjType"] == "TEXTBOX") {
                            if (g_show_live_image == "Y" && ShelfInfo["TextImg"] !== "") {
                                var return_val = add_text_box_with_image_3d(ShelfInfo["Shelf"], "TEXTBOX", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"] == 0 ? p_backdept / 2 + ShelfInfo["D"] / 2 : ShelfInfo["Z"], p_mod_index, ShelfInfo["InputText"], colorValue, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], ShelfInfo["Rotation"], ShelfInfo["Slope"], ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], i, p_pog_index);
                            } else {
                                var return_val = add_text_box_3d(ShelfInfo["Shelf"], "TEXTBOX", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"] == 0 ? p_backdept / 2 + ShelfInfo["D"] / 2 : ShelfInfo["Z"], p_mod_index, ShelfInfo["InputText"], colorValue, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], ShelfInfo["Rotation"], ShelfInfo["Slope"], ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], p_pog_index);
                            }
                            //ASA-1652 #3 Start
                            const baseStart = g_pog_json[p_pog_index].BaseX - (g_pog_json[p_pog_index].BaseW/2);
                            const baseEnd = g_pog_json[p_pog_index].BaseX + (g_pog_json[p_pog_index].BaseW/2);
                            const baseTop = g_pog_json[p_pog_index].BaseY + (g_pog_json[p_pog_index].BaseH/2);
                            const baseBottom = g_pog_json[p_pog_index].BaseY - (g_pog_json[p_pog_index].BaseH/2);

                            const txtboxStart = ShelfInfo.X - (ShelfInfo.W/2);
                            const txtboxEnd = ShelfInfo.X + (ShelfInfo.W/2);
                            const txtboxTop = ShelfInfo.Y + (ShelfInfo.H/2);
                            const txtboxBottom = ShelfInfo.Y - (ShelfInfo.H/2);
                            if(txtboxStart < baseEnd && txtboxEnd > baseStart && txtboxTop > baseBottom && txtboxBottom < baseTop){
                                if(ShelfInfo["Z"] < g_pog_json[p_pog_index].BaseD + 0.1){
                                    g_world.getObjectById(return_val).position.z = g_pog_json[p_pog_index].BaseD + 0.1;
                                    ShelfInfo["Z"] = g_pog_json[p_pog_index].BaseD + 0.1;
                                }
                            }
                            //ASA-1652 #3 End
                        } else if (ShelfInfo["ObjType"] == "ROD") {
                            var return_val = add_rod_3d(ShelfInfo["Shelf"], "SHELF", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], p_mod_index, p_pog_index);
                        } else {
                            if (ShelfInfo["ObjType"] == "BASKET" || ShelfInfo["ObjType"] == "CHEST") {
                                if (g_chest_as_pegboard == 'Y' && ShelfInfo["ObjType"] == "CHEST") {
                                    final_height = ShelfInfo["D"];
                                    ShelfInfo["D"] = ShelfInfo.BsktBaseH;
                                    ShelfInfo["Z"] = (p_backdept / 2) + (ShelfInfo.BsktBaseH / 2);
                                } else {
                                    final_height = ShelfInfo["BsktBaseH"];
                                }

                            } else {
                                final_height = ShelfInfo["H"];
                            }

                            if (ShelfInfo["ObjType"] == "HANGINGBAR") {
                                ShelfInfo["Z"] = p_backdept / 2;
                                ShelfInfo["D"] = 0.01;
                            }
                            var return_val = add_shelf_3d(ShelfInfo["Shelf"], "SHELF", ShelfInfo["W"], final_height, ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], p_mod_index, ShelfInfo["Rotation"], ShelfInfo["Slope"], i, p_pog_index);
                        }
                    }
                    if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.length > 0) {
                        item_Details = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo;
                        l_item_count = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.length;
                        l_item_dept = 0;
                        l_itemz = 0;
                        var j = 0;
                        for (const items of item_Details) {
                            var selectedObject = g_world.getObjectById(items.ObjID);
                            g_world.remove(selectedObject);

                            var ItemInfo = {};
                            ItemInfo["DimT"] = items.DimT;
                            ItemInfo["PegID"] = items.PegID;
                            ItemInfo["PegSpread"] = items.PegSpread;
                            ItemInfo["PegPerFacing"] = items.PegPerFacing;
                            ItemInfo["Fixed"] = items.Fixed;
                            ItemInfo["CapStyle"] = items.CapStyle;
                            ItemInfo["Rotation"] = items.Rotation;
                            ItemInfo["BaseD"] = items.BaseD;
                            ItemInfo["CrushHoriz"] = items.CrushHoriz;
                            ItemInfo["CrushVert"] = items.CrushVert;
                            ItemInfo["CrushD"] = items.CrushD;
                            ItemInfo["Price"] = items.Price;
                            ItemInfo["Cost"] = items.Cost;
                            ItemInfo["RegMovement"] = items.RegMovement;
                            ItemInfo["AvgSales"] = items.AvgSales;
                            ItemInfo["ItemStatus"] = items.ItemStatus;
                            ItemInfo["MoveBasis"] = items.MoveBasis;
                            ItemInfo["CHPerc"] = items.CHPerc;
                            ItemInfo["CWPerc"] = items.CWPerc;
                            ItemInfo["CDPerc"] = items.CDPerc;
                            ItemInfo["ItemNesting"] = items.ItemNesting;
                            ItemInfo["NVal"] = items.NVal;
                            ItemInfo["ItemContain"] = items.ItemContain;
                            ItemInfo["CnVal"] = items.CnVal;
                            ItemInfo["IsContainer"] = items.IsContainer;
                            ItemInfo["BsktFactor"] = items.BsktFactor;
                            ItemInfo["OverHang"] = items.OverHang;
                            ItemInfo["VertGap"] = items.VertGap;
                            ItemInfo["OW"] = items.OW;
                            ItemInfo["OH"] = items.OH;
                            ItemInfo["OD"] = items.OD;
                            ItemInfo["Quantity"] = items.Quantity;
                            ItemInfo["Dragged"] = items.Dragged;
                            ItemInfo["SpreadItem"] = items.SpreadItem;
                            ItemInfo["MHorizCrushed"] = items.MHorizCrushed;
                            ItemInfo["MVertCrushed"] = items.MVertCrushed;
                            ItemInfo["MDepthCrushed"] = items.MDepthCrushed;
                            ItemInfo["RW"] = items.RW;
                            ItemInfo["RH"] = items.RH;
                            ItemInfo["RD"] = items.RD;
                            ItemInfo["SlotDivider"] = items.SlotDivider;
                            ItemInfo["CapCount"] = items.CapCount;
                            ItemInfo["X"] = items.X - p_half_width;
                            ItemInfo["Y"] = items.Y - p_half_height;
                            ItemInfo["Z"] = items.Z;
                            total_items = total_items + 1;
                            ItemInfo["ItemID"] = items.ItemID;
                            ItemInfo["Item"] = items.Item;
                            ItemInfo["W"] = items.W;
                            ItemInfo["H"] = items.H;
                            ItemInfo["D"] = items.D;
                            if (typeof items.Color == "undefined") {
                                ItemInfo["Color"] = $v("P34_ITEM_DFT_COLOR");
                            } else {
                                ItemInfo["Color"] = items.Color;
                            }
                            ItemInfo["Desc"] = items.Desc;
                            ItemInfo["Barcode"] = items.Barcode;
                            ItemInfo["LocID"] = items.LocID;
                            ItemInfo["BHoriz"] = items.BHoriz;
                            ItemInfo["BVert"] = items.BVert;
                            ItemInfo["Orientation"] = items.Orientation;
                            ItemInfo["MerchStyle"] = items.MerchStyle;
                            ItemInfo["Supplier"] = items.Supplier;
                            ItemInfo["Brand"] = items.Brand;
                            ItemInfo["Group"] = items.Group;
                            ItemInfo["Dept"] = items.Dept;
                            ItemInfo["Class"] = items.Class;
                            ItemInfo["SubClass"] = items.SubClass;
                            ItemInfo["StdUOM"] = items.StdUOM;
                            ItemInfo["SizeDesc"] = items.SizeDesc;
                            ItemInfo["HorizGap"] = items.HorizGap;
                            ItemInfo["UW"] = items.UW;
                            ItemInfo["UH"] = items.UH;
                            ItemInfo["UD"] = items.UD;
                            ItemInfo["CW"] = items.CW;
                            ItemInfo["CH"] = items.CH;
                            ItemInfo["CD"] = items.CD;
                            ItemInfo["TW"] = items.TW;
                            ItemInfo["TH"] = items.TH;
                            ItemInfo["TD"] = items.TD;
                            ItemInfo["DW"] = items.DW;
                            ItemInfo["DH"] = items.DH;
                            ItemInfo["DD"] = items.DD;
                            ItemInfo["BaseD"] = items.BaseD;
                            ItemInfo["ImgExists"] = items.ImgExists;
                            g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.push(ItemInfo);

                            if (ShelfInfo["ObjType"] == "ROD") {
                                if (ShelfInfo["SpreadItem"] == "E" && ShelfInfo["DGap"] == 0) {
                                    ShelfInfo["DGap"] = (ShelfInfo["D"] - l_total_item_dept) / (l_item_count - 1);
                                } else if (ShelfInfo["SpreadItem"] == "E" && ShelfInfo["DGap"] > 0) {
                                    ShelfInfo["DGap"] = (ShelfInfo["D"] - l_total_item_dept) / (l_item_count - 1);
                                } else if (ShelfInfo["SpreadItem"] == "F") {
                                    ShelfInfo["DGap"] = (ShelfInfo["D"] - l_originaldepth) / (l_cal_item_cnt - 1);
                                    ItemInfo["D"] = ItemInfo["D"] + ShelfInfo["DGap"] * (ItemInfo["BaseD"] - 1);
                                }

                                if (ShelfInfo["SpreadItem"] != "FR") {
                                    if (j == 0) {
                                        l_itemz = p_backdept / 2 + ItemInfo["D"] / 2;
                                        l_item_dept = ItemInfo["D"];
                                    } else {
                                        l_itemz = l_itemz + l_item_dept / 2 + ItemInfo["D"] / 2 + ShelfInfo["DGap"];
                                    }
                                } else {
                                    if (j == 0) {
                                        l_itemz = p_backdept / 2 + ShelfInfo["D"] - ItemInfo["D"] / 2;
                                        l_item_dept = ItemInfo["D"];
                                    } else {
                                        l_itemz = l_itemz - l_item_dept / 2 - ItemInfo["D"] / 2 + ShelfInfo["DGap"];
                                    }
                                }
                                ItemInfo["Z"] = l_itemz;
                            } else if (ShelfInfo["ObjType"] == "BASKET" && (ShelfInfo["BsktSpreadProduct"] == "BT" || ShelfInfo["BsktSpreadProduct"] == "LR")) {
                                ItemInfo["D"] = ShelfInfo["D"];
                                ItemInfo["Z"] = p_backdept / 2 + ItemInfo["D"] / 2;
                            } else if (ShelfInfo["ObjType"] == "SHELF" || ShelfInfo["ObjType"] == "CHEST") {
                                if (g_chest_as_pegboard == 'Y' && ShelfInfo["ObjType"] == "CHEST") {
                                    ItemInfo["Z"] = p_backdept / 2 + ShelfInfo["BsktBaseH"] + ItemInfo["D"] / 2;
                                } else {
                                    ItemInfo["Z"] = p_backdept / 2 + ShelfInfo["D"] - ItemInfo["D"] / 2;
                                }

                            } else if (ShelfInfo["ObjType"] == "PALLET") {
                                ItemInfo["Z"] = ShelfInfo["D"] - ItemInfo["Z"];
                            } else if (ShelfInfo["ObjType"] == "HANGINGBAR") {
                                ItemInfo["Z"] = p_backdept / 2 + ItemInfo["D"] / 2;
                            } else {
                                ItemInfo["Z"] = p_backdept / 2 + ItemInfo["D"] / 2 + ShelfInfo["D"] / 2 + ShelfInfo["Z"];
                            }

                            if (ItemInfo["Item"] == "DIVIDER") {
                                var objID = add_items_3d(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, i, j, ItemInfo["Rotation"], p_pog_index);
                            } else {
                                var objID;
                                if (g_show_live_image == "Y" && items.MerchStyle != 3) {
                                    if (ItemInfo["ImgExists"] == "Y") {
                                        var details = g_orientation_json[g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].Orientation];
                                        var details_arr = details.split("###");
                                        objID = await add_items_with_image_3d(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, i, j, ItemInfo["BHoriz"], ItemInfo["BVert"], ItemInfo["Item"], parseInt(details_arr[0]), parseInt(details_arr[1]), "N", ItemInfo["BaseD"], '', $v("P34_SHOW_ITEM_SIDE_IMAGE"), p_pog_index);
                                    } else {
                                        objID = await add_items_prom_3d(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, i, j, '', p_pog_index);
                                    }
                                } else {
                                    objID = await add_items_prom_3d(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, i, j, '', p_pog_index);
                                }
                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].ObjID = objID;

                            }
                            j = j + 1;
                        }
                    }
                }
                i = i + 1;
            }
        }
    } catch (err) {
        error_handling(err);
    }
}

function add_base_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_pog_index) {
    try {
        return new Promise(function (resolve, reject) {
            g_pog_base = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, p_depth),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );
            var l_wireframe_id = add_wireframe_3d(g_pog_base);
            g_pog_base.position.x = p_x;
            g_pog_base.position.y = p_y;
            g_pog_base.position.z = p_z;
            g_pog_base.uuid = p_uuid;
            g_world.add(g_pog_base);
            g_pog_base.castShadow = true;
            render();
            resolve("SUCCESS");
        });
    } catch (err) {
        error_handling(err);
    }
}

function create_final_module_3d(p_uuid, p_width, p_height, p_depth, p_color, p_y, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_finalX, p_edit_module_index, p_pog_index) {
    try {
        return new Promise(function (resolve, reject) {
            g_module = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, p_depth),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );

            if (p_vert_spacing > 0 || p_horz_spacing > 0) {
                var dot_module = add_dots_to_object_3d(p_width - g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW * 2, p_height, p_depth, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, g_module, "MODULE", "", p_edit_module_index);
                dot_module.position.x = p_finalX;
                dot_module.position.y = p_y;
                dot_module.position.z = 0;
                dot_module.uuid = p_uuid;
                if (g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW > 0) {
                    add_notches_3d("MODULE" + p_edit_module_index + "_NOTCHES", g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW, p_height, p_depth, g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchStart, g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchSpacing, p_color, p_width, p_edit_module_index, dot_module, p_pog_index);
                }
                var l_wireframe_id = add_wireframe_3d(dot_module);
                g_world.add(dot_module);
                dot_module.castShadow = true;
                dot_module.receiveShadow = true;

                if (p_edit_module_index == 0) {
                    g_module_obj_array.splice(p_edit_module_index, p_edit_module_index + 1);
                } else {
                    g_module_obj_array.splice(p_edit_module_index, 1);
                }
                g_module_obj_array.push(dot_module);
            } else {
                g_module.position.x = p_finalX;
                g_module.position.y = p_y;
                g_module.position.z = 0;
                g_module.uuid = p_uuid;
                if (g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW > 0) {
                    add_notches_3d("MODULE" + p_edit_module_index + "_NOTCHES", g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW, p_height, p_depth, g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchStart, g_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchSpacing, p_color, p_width, p_edit_module_index, g_module, p_pog_index);
                }
                var l_wireframe_id = add_wireframe_3d(g_module);
                g_world.add(g_module);
                g_module.castShadow = true;
                g_module.receiveShadow = true;
                if (p_edit_module_index == 0) {
                    g_module_obj_array.splice(p_edit_module_index, p_edit_module_index + 1);
                } else {
                    g_module_obj_array.splice(p_edit_module_index, 1);
                }
                g_module_obj_array.push(g_module);
            }
            render();
            resolve("SUCCESS");
        });
    } catch (err) {
        error_handling(err);
    }
}

function add_notches_3d(p_uuid, p_width, p_height, p_depth, p_start, p_spacing, p_color, p_module_width, p_module_count, p_module_object) {
    try {
        var z = 0.001;
        g_notches1 = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );

        g_notches2 = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );
        add_wireframe_3d(g_notches1);
        add_wireframe_3d(g_notches2);

        var l_notch_horz_start = 0 - parseFloat(p_width) / 2;
        var l_notch_vert_start = 0 - parseFloat(p_height) / 2 + parseFloat(p_start);
        var l_notch_horz_end = 0 + parseFloat(p_width) / 2;
        var l_notch_vert_end = 0 + parseFloat(p_height) / 2;

        var curr_vert_value = l_notch_vert_start;
        var verti_values = [];

        verti_values.push(curr_vert_value);
        for (var i = 0; i < 1000; i++) {
            curr_vert_value += parseFloat(p_spacing);
            if (curr_vert_value < l_notch_vert_end) verti_values.push(curr_vert_value);
            else break;
        }

        var points = [];

        for (i = 0; i < verti_values.length; i++) {
            points.push(new THREE.Vector3(l_notch_horz_start, verti_values[i], 0));
            points.push(new THREE.Vector3(l_notch_horz_end, verti_values[i], 0));
        }
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({
            color: 0x000000,
        });

        var line1 = new THREE.LineSegments(geometry, material);
        var line2 = new THREE.LineSegments(geometry, material);

        line1.position.z = 0.001;
        line2.position.z = 0.001;
        g_notches1.add(line1);
        g_notches2.add(line2);
        var notch1_x = 0 - parseFloat(p_module_width) / 2 + parseFloat(p_width) / 2;
        var notch2_x = 0 - parseFloat(p_module_width) / 2 + (parseFloat(p_module_width) - parseFloat(p_width) / 2);
        g_notches1.position.x = notch1_x;
        g_notches1.position.y = 0;
        g_notches1.position.z = z;
        g_notches2.position.x = notch2_x;
        g_notches2.position.y = 0;
        g_notches2.position.z = z;
        p_module_object.add(g_notches1);
        p_module_object.add(g_notches2);
        render();

        g_notches1.uuid = p_uuid + 1;
        g_notches2.uuid = p_uuid + 2;
    } catch (err) {
        error_handling(err);
    }
}

function add_pegboard_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_mod_index, p_pog_index) {
    try {
        var shelf_cnt = 0;
        shelf_cnt = parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;

        g_pegboard = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, p_depth),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );

        var dot_pegboard = add_dots_to_object_3d(p_width, p_height, p_depth, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, g_pegboard, "PEGBOARD", shelf_cnt, p_mod_index, add_pegboard_3d);

        dot_pegboard.position.x = p_x;
        dot_pegboard.position.y = p_y;
        dot_pegboard.position.z = parseFloat(p_z);
        g_pegboard.uuid = p_uuid;

        var l_wireframe_id = add_wireframe_3d(dot_pegboard);
        g_world.add(dot_pegboard);
        dot_pegboard.castShadow = true;
        render();

        g_dblclick_opened = "N";
        return "SUCESS";
    } catch (err) {
        error_handling(err);
    }
}

function dcText_3d(p_text, p_font_size, p_fgcolor, p_bgcolor, p_width, p_height, p_wrap_text, p_reducetofit, p_fontstyle, p_fontbold, p_fontsize, p_pog_index) {
    // the routine
    try {
        const [canvasWidth, canvasHeight] = get_visible_size(0.012, p_width, p_height, document.getElementById("scenecanvas"), g_camera);

        //ASA - 1652 Start  
        // var ruler = document.getElementById("ruler");
        // ruler.style.fontFamily = p_fontstyle;
        // ruler.style.fontWeight = p_fontbold;
        // ruler.style.fontSize = p_font_size + "px";
        // ruler.style.position = "absolute";
        // ruler.innerHTML = p_text;
        // var text_width = ruler.offsetWidth + 5;
        //ASA - 1652 End
        var text_height = p_font_size; //ruler.offsetHeight;


        // create the canvas for the texture
        var txtcanvas = document.createElement("canvas"); // create the canvas for the texture
        var ctx = txtcanvas.getContext("2d");
        txtcanvas.width = canvasWidth;
        txtcanvas.height = canvasHeight;

        if (p_bgcolor != undefined || p_bgcolor !== null) {
            ctx.fillStyle = "#" + p_bgcolor.toString(16).padStart(6, "0");
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#" + p_fgcolor.toString(16).padStart(6, "0"); // fgcolor
        ctx.font = p_fontbold + " " + text_height + "px " + p_fontstyle;

        var txt_can_width = ctx.measureText(p_text).width;

        if (p_reducetofit == "Y" && txt_can_width > canvasWidth) {
            var new_txt_hgt = 50;
            for (i = 50; i >= 0; i--) {
                var newcanvas = document.createElement("canvas");
                var new_context = newcanvas.getContext("2d");
                newcanvas.width = canvasWidth;
                newcanvas.height = canvasHeight;
                if (p_bgcolor != undefined || p_bgcolor !== null) {
                    new_context.fillStyle = "#" + p_bgcolor.toString(16).padStart(6, "0");
                    new_context.fillRect(0, 0, canvasWidth, canvasHeight);
                }
                new_context.textAlign = "center";
                new_context.textBaseline = "middle";
                new_context.fillStyle = "#" + p_fgcolor.toString(16).padStart(6, "0"); // fgcolor
                new_context.font = p_fontbold + " " + i + "px " + p_fontstyle;
                if (new_context.measureText(p_text).width + 5 <= canvasWidth) {
                    new_txt_hgt = i;
                    break;
                }
            }

            text_height = new_txt_hgt < 50 ? new_txt_hgt : text_height;
        }

        if (p_bgcolor != undefined || p_bgcolor !== null) {
            // fill background if desired (transparent if none)
            ctx.fillStyle = "#" + p_bgcolor.toString(16).padStart(6, "0");
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#" + p_fgcolor.toString(16).padStart(6, "0"); // fgcolor
        ctx.font = p_fontbold + " " + text_height + "px " + p_fontstyle;

        var lineHeight = 25;
        txt_can_width = ctx.measureText(p_text).width;
        if (p_wrap_text == "Y" && txt_can_width > canvasWidth) {
            wrapText(ctx, p_text, canvasWidth / 2, text_height, canvasWidth, lineHeight);
        } else {
            ctx.fillText(p_text, canvasWidth / 2, canvasHeight / 2);
        }

        var texture = new THREE.CanvasTexture(txtcanvas);
        texture.minFilter = THREE.LinearFilter;
        //texture.needsUpdate = true;

        geometry = new THREE.PlaneGeometry(p_width, p_height);
        var material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
            opacity: 1.0,
        });

        material.map.minFilter = THREE.LinearFilter;
        var mesh = new THREE.Mesh(geometry, material);

        return mesh;
    } catch (err) {
        error_handling(err);
    }
}

function add_text_box_with_image_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_rotation, p_slope, p_fontstyle, p_fontsize, p_fontbold, p_shelf_cnt, p_pog_index) {
    try {
        // Create an image
        var image = new Image();
        // Create texture
        var texture = new THREE.Texture(image);
        // On image load, update texture
        image.onload = () => {
            texture.needsUpdate = true;
        };
        // Set image source
        image.src = "data:image/png;base64," + g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_cnt].TextImg;
        geometry = new THREE.PlaneGeometry(p_width, p_height);
        var material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
            opacity: 1.0,
        });
        // and finally, the mesh
        var mesh = new THREE.Mesh(geometry, material);

        if (p_rotation !== 0 || p_slope !== 0) {
            if (p_slope > 0) {
                p_slope = 0 - p_slope;
            } else {
                p_slope = -p_slope;
            }
            mesh.rotateY((p_rotation * Math.PI) / 180);
            if (p_rotation == 0) {
                mesh.rotateX(((p_slope / 2) * Math.PI) / 180);
            } else {
                mesh.rotateX((p_slope * Math.PI) / 180);
            }

            mesh.updateMatrix();
        }
        mesh.uuid = p_uuid;
        var l_wireframe_id = add_wireframe_3d(mesh);
        g_world.add(mesh);
        mesh.position.x = p_x;
        mesh.position.y = p_y;
        mesh.position.z = parseFloat(p_z) + 0.005;  //ASA-1652

        animate_pog(p_pog_index);
        render();
        return mesh.id;
    } catch (err) {
        error_handling(err);
    }
}

function add_text_box_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_rotation, p_slope, p_fontstyle, p_fontsize, p_fontbold, p_pog_index) {
    try {
        if (hexToRgb(p_hex_color) == null) {
            var red = parseInt("FF", 16);
            var green = parseInt("FF", 16);
            var blue = parseInt("FF", 16);
        } else {
            var red = hexToRgb(p_hex_color).r;
            var green = hexToRgb(p_hex_color).r;
            var blue = hexToRgb(p_hex_color).g;
        }
        var text_color;

        shelf_cnt = parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;

        if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
            text_color = 0x000000;
        } else {
            text_color = 0xffffff;
        }
        mesh = dcText_3d(p_input_text, p_fontsize, text_color, p_color_hex, p_width, p_height, p_wrap_text, p_reducetofit, p_fontstyle, p_fontbold, p_fontsize, p_pog_index);    

        if (p_rotation > 0 || p_slope > 0 || p_rotation < 0 || p_slope < 0) {
            if (p_slope > 0) {
                p_slope = 0 - p_slope;
            } else {
                p_slope = -p_slope;
            }
            g_slope = p_slope;
            mesh.rotateY((p_rotation * Math.PI) / 180);
            mesh.rotateX((p_slope * Math.PI) / 180);
        }

        mesh.position.x = p_x;
        mesh.position.y = p_y;
        mesh.position.z = parseFloat(p_z) + 0.005;  //ASA-1652
        var l_wireframe_id = add_wireframe_3d(mesh);
        g_world.add(mesh);
        mesh.castShadow = true;
        console.log('mesh', mesh);
        animate_pog(p_pog_index);
        render();
        return parseInt(mesh.id);
    } catch (err) {
        error_handling(err);
    }
}

function add_rod_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_pog_index) {
    try {
        var shelf_cnt;
        var lines_vertices_x = [];
        var lines_vertices_y = [];
        if (typeof g_module_width == "undefined" || g_module_width == "") g_module_width = parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].W);

        shelf_cnt = parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;

        g_shelf = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, p_depth),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );

        lines_vertices_x.push(0 - p_width / 2);
        lines_vertices_x.push(p_width / 2);
        lines_vertices_x.push(0 - p_width / 2);
        lines_vertices_x.push(p_width / 2);

        lines_vertices_y.push(0 - p_height / 2);
        lines_vertices_y.push(p_height / 2);
        lines_vertices_y.push(p_height / 2);
        lines_vertices_y.push(0 - p_height / 2);

        var points = [];

        points.push(new THREE.Vector3(lines_vertices_x[0], lines_vertices_y[0], 0));
        points.push(new THREE.Vector3(lines_vertices_x[1], lines_vertices_y[1], 0));
        points.push(new THREE.Vector3(lines_vertices_x[2], lines_vertices_y[2], 0));
        points.push(new THREE.Vector3(lines_vertices_x[3], lines_vertices_y[3], 0));

        let geometry = new THREE.BufferGeometry().setFromPoints(points);

        var material = new THREE.LineBasicMaterial({
            color: 0xda1b1b,
        });

        var line1 = new THREE.LineSegments(geometry, material);
        var line2 = new THREE.LineSegments(geometry, material);

        line1.position.z = p_depth / 2 + 0.001;
        line2.position.z = p_depth / 2 + 0.001;
        g_shelf.add(line1);
        g_shelf.add(line2);

        var l_wireframe_id = add_wireframe_3d(g_shelf);
        g_shelf.position.x = p_x;
        g_shelf.position.y = p_y;
        g_shelf.position.z = parseFloat(p_z);
        g_shelf.uuid = p_uuid;
        g_world.add(g_shelf);
        g_shelf.castShadow = true;
        render();
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

function add_shelf_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_rotation, p_slope, p_shelf_index, p_pog_index) {
    try {
        var shelf_cnt;
        if (typeof g_module_width == "undefined" || g_module_width == "") g_module_width = parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].W);

        shelf_cnt = parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
        g_shelf = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, p_depth),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );

        if (p_rotation > 0 || p_slope > 0 || p_rotation < 0 || p_slope < 0) {
            if (p_slope > 0) {
                p_slope = 0 - p_slope;
            } else {
                p_slope = -p_slope;
            }
            g_slope = p_slope;
            g_shelf.rotateY((p_rotation * Math.PI) / 180);
            g_shelf.rotateX((p_slope * Math.PI) / 180);
        }
        var l_wireframe_id = add_wireframe_3d(g_shelf);
        g_shelf.position.x = p_x;
        if (p_slope < 0) {
            g_shelf.position.y = p_y + parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ShelfRotateHeight) / 2;
        } else if (p_slope > 0) {
            g_shelf.position.y = p_y - parseFloat(g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ShelfRotateHeight) / 2;
        } else {
            g_shelf.position.y = p_y;
        }
        g_shelf.position.z = parseFloat(p_z);
        g_shelf.uuid = p_uuid;
        g_world.add(g_shelf);
        g_shelf.castShadow = true;
        g_shelf.receiveShadow = true;
        render();
        g_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].SObjID = g_shelf.id;
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

async function add_items_with_image_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_horiz_facing, p_vert_facing, p_item_code, p_item_type, p_angle, p_recreate, p_depthfacing, p_HighlightItem, p_show_side_image, p_pog_index) {
    try {
        return new Promise(function (resolve, reject) {
            var item_info = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
            var nesting_val = item_info.NVal;
            var colorValue = parseInt(p_color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            var rotation = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation;
            var slope = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Slope;
            var item_orientation = item_info.Orientation;
            var details = g_orientation_json[item_orientation];
            var details_arr = details.split("###");
            var detaillist = get_orientation_list(details_arr[0]);
            // var object = g_world.getObjectById(item_info.ObjID); //ASA-1623 Issue 1
            // g_world.remove(object); //ASA-1623 Issue 1
            var cap_merch = item_info.CapMerch;
            var cap_orient = item_info.CapOrientaion;
            var cap_details = g_orientation_json[item_info.CapOrientaion];
            var cap_detail_arr = cap_details.split("###");
            var cap_style = item_info.CapStyle;
            var [org_width, org_height, org_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(item_info.Orientation, item_info.OW, item_info.OH, item_info.OD);
            if (item_info.CrushHoriz > 0) {
                org_width = item_info.W / item_info.BHoriz;
            }
            if (item_info.CrushVert > 0) {
                org_height = item_info.H / item_info.BVert;
            }

            var img_exists = "N",
                img_index = -1,
                img_indexl = -1,
                img_indexr = -1,
                img_indext = -1;
            var cap_index = -1;
            var j = 0;
            if (typeof detaillist !== 'undefined') {
                for (const images_arr of g_ItemImages) {
                    if (p_item_code == images_arr.Item && details_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null) {
                        img_exists = "Y";
                        img_index = j;
                    } else if (p_item_code == images_arr.Item && detaillist[0] == images_arr.Orientation && images_arr.ItemImage !== null && img_indexl == -1) {
                        img_indexl = j;
                    } else if (p_item_code == images_arr.Item && detaillist[1] == images_arr.Orientation && images_arr.ItemImage !== null && img_indexr == -1) {
                        img_indexr = j;

                    } else if (p_item_code == images_arr.Item && detaillist[2] == images_arr.Orientation && images_arr.ItemImage !== null && img_indext == -1) {
                        img_indext = j;
                    }
                    if (p_item_code == images_arr.Item && cap_detail_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null && images_arr.MerchStyle == cap_merch) {
                        cap_index = j;
                    }
                    j++;

                };
            } else {
                for (const images_arr of g_ItemImages) {
                    if (p_item_code == images_arr.Item && details_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null) {
                        img_exists = "Y";
                        img_index = j;
                    }
                    j++;
                };
                var j = 0;
                for (const images_arr of g_ItemImages) {
                    if (p_item_code == images_arr.Item && cap_detail_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null && images_arr.MerchStyle == cap_merch) {
                        cap_index = j;
                        break; //return false;
                    }
                    j++;
                }
            }
            if (img_exists == "Y") {
                // Create an image
                var image = new Image();
                var imagel = new Image();
                var imager = new Image();
                var imaget = new Image();
                var imagecap = new Image();
                // Create texture
                var texture = new THREE.Texture(image);
                var texturel = new THREE.Texture(imagel);
                var texturer = new THREE.Texture(imager);
                var texturet = new THREE.Texture(imaget);
                var texturecap = new THREE.Texture(imagecap);
                // On image load, update texture
                image.onload = () => {
                    texture.needsUpdate = true;
                };
                imagel.onload = () => {
                    texturel.needsUpdate = true;
                };
                imager.onload = () => {
                    texturer.needsUpdate = true;
                };
                imaget.onload = () => {
                    texturet.needsUpdate = true;
                };
                imagecap.onload = () => {
                    texturecap.needsUpdate = true;
                };

                // Set image source
                image.src = "data:image/png;base64," + g_ItemImages[img_index].ItemImage;

                if (img_indexl != -1) {
                    imagel.src = "data:image/png;base64," + g_ItemImages[img_indexl].ItemImage;
                }

                if (img_indexr != -1) {
                    imager.src = "data:image/png;base64," + g_ItemImages[img_indexr].ItemImage;
                }
                if (img_indext != -1) {
                    imaget.src = "data:image/png;base64," + g_ItemImages[img_indext].ItemImage;
                }
                if (cap_index != -1) {
                    imagecap.src = "data:image/png;base64," + g_ItemImages[cap_index].ItemImage;
                }
                var borderMaterial = new THREE.MeshBasicMaterial({
                    color: hex_decimal
                });
                if (imagel.src != '') {
                    var mat1 = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texturel
                    });
                } else {
                    var mat1 = borderMaterial;
                }
                if (imager.src != '') {
                    var mat2 = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texturer
                    });
                } else {
                    var mat2 = borderMaterial;
                }

                if (imaget.src != '') {
                    var mat3 = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texturet
                    });

                } else {
                    var mat3 = borderMaterial;
                }
                if (imagecap.src != '') {
                    var matcap = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texturecap
                    });

                } else {
                    var matcap = borderMaterial;
                }

                const mat5 = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    map: texture
                });

                if (p_show_side_image == 'Y') {
                    var materials = [
                        mat1,
                        mat2,
                        mat3,
                        borderMaterial,
                        mat5,
                        borderMaterial];
                } else {
                    var materials = [
                        borderMaterial, // Left side
                        borderMaterial, // Right side
                        borderMaterial, // Top side   ---> THIS IS THE FRONT
                        borderMaterial, // Bottom side --> THIS IS THE BACK
                        mat5, // Front side
                        borderMaterial // Back side
                    ];

                }
                var geometry = new THREE.BoxGeometry(p_width, p_height, p_depth);
                if (nvl(rotation) !== 0 || nvl(slope) !== 0) {
                    items = new THREE.Mesh(geometry, materials);
                    if (nesting_val == 0) {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        if (p_angle == 90 || p_angle == 270) {
                            texture.repeat.set(p_vert_facing, p_horiz_facing);
                        } else {
                            texture.repeat.set(p_horiz_facing, p_vert_facing);
                        }
                        if (p_angle == 90) {
                            p_angle = 270;
                        } else if (p_angle == 270) {
                            p_angle = 90;
                        }
                        texture.rotation = (p_angle * Math.PI) / 180;
                    }

                    var selectedObject = g_world.getObjectById(g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);
                    if (p_recreate == "N") {
                        p_x = 0 - (g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2 - p_width / 2 - g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Distance);
                        p_y = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + p_height / 2;
                        p_z = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 - p_depth / 2;
                    }

                    items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));

                    g_scene.updateMatrixWorld();
                    items.matrixAutoUpdate = false;
                    items.applyMatrix4(selectedObject.matrix);
                } else {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texturel.wrapT = THREE.RepeatWrapping;
                    texturel.wrapS = THREE.RepeatWrapping;
                    texturer.wrapT = THREE.RepeatWrapping;
                    texturer.wrapS = THREE.RepeatWrapping;
                    texturet.wrapT = THREE.RepeatWrapping;
                    texturet.wrapS = THREE.RepeatWrapping;
                    var capHeight = item_info.CapHeight; //ASA-1170
                    if (nesting_val == 0 && cap_style == "0") {
                        if (p_angle == 90 || p_angle == 270) {
                            texture.repeat.set(p_vert_facing, p_horiz_facing);

                        } else {
                            texture.repeat.set(p_horiz_facing, p_vert_facing);
                            texturel.repeat.set(p_depthfacing, p_vert_facing);
                            texturer.repeat.set(p_depthfacing, p_vert_facing);
                            texturet.repeat.set(1, p_depthfacing);
                        }
                    }
                    if (p_angle == 90) {
                        p_angle = 270;
                    } else if (p_angle == 270) {
                        p_angle = 90;
                    }
                    texture.rotation = (p_angle * Math.PI) / 180;
                    if (cap_style == "0" || typeof cap_style == 'undefined') {
                        items = new THREE.Mesh(geometry, materials);
                    } else {
                        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        items = new THREE.Mesh(
                            new THREE.BoxGeometry(p_width, p_height, p_depth),
                            new THREE.MeshBasicMaterial({
                                color: hex_decimal,
                            }));

                        var img_item = [];
                        var next_start = 0;
                        var item_info = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
                        var vert_loop = p_vert_facing + g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount;
                        var vert_start = 0;
                        var item_depth = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OD;
                        var vert_facing_cnt = p_vert_facing;
                        var new_z = p_depth / 2 + 0.0001 * g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount;
                        for (p = 0; p < vert_loop; p++) {
                            var next_start = 0;
                            var new_y = -1;
                            if (p == 0) {
                                vert_start = - (item_info.H / 2) + org_height;
                                new_y = - (item_info.H / 2) + org_height / 2;
                                vert_facing_cnt = vert_facing_cnt - 1;
                            } else {
                                if (vert_facing_cnt > 0) {
                                    new_y = vert_start + org_height / 2;
                                    vert_start = vert_start + org_height;
                                    vert_facing_cnt = vert_facing_cnt - 1;
                                    child_uuid = "facings";
                                } else {
                                    var calc_height = vert_start + capHeight; //item_depth;
                                    new_y = calc_height - capHeight / 2;
                                    vert_start = calc_height;
                                    new_z = new_z - 0.00001;
                                    child_uuid = "cap";
                                }
                            }

                            for (k = 0; k < p_horiz_facing; k++) {

                                var material = new THREE.MeshBasicMaterial({
                                    map: texture,
                                    transparent: true,
                                });
                                if (p < p_vert_facing) {
                                    var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);
                                    new_mat = material;
                                } else {
                                    var geometry1 = new THREE.BoxGeometry(org_width, capHeight, 0.001);
                                    if (cap_index !== -1) {
                                        texturecap.wrapS = THREE.RepeatWrapping;
                                        texturecap.wrapT = THREE.RepeatWrapping;
                                        p_angle = cap_detail_arr[1];
                                        if (cap_detail_arr[1] == 90) {
                                            p_angle = 270;
                                        } else if (cap_detail_arr[1] == 270) {
                                            p_angle = 90;
                                        }
                                        texturecap.rotation = (p_angle * Math.PI) / 180;
                                    }
                                    new_mat = cap_index !== -1 ? matcap : material;
                                }
                                img_item.push(new THREE.Mesh(geometry1, new_mat));
                                items.add(img_item[img_item.length - 1]);
                                if (k == 0) {
                                    next_start = - (item_info.W / 2) + org_width;
                                    img_item[img_item.length - 1].position.x = - (item_info.W / 2) + org_width / 2;
                                } else {
                                    img_item[img_item.length - 1].position.x = next_start + org_width / 2;
                                    next_start = next_start + org_width;
                                }
                                img_item[img_item.length - 1].position.y = new_y;
                                img_item[img_item.length - 1].position.z = new_z;
                            }
                        }
                    }

                    items.position.x = p_x;
                    items.position.z = p_z;
                    items.position.y = p_y;
                }
                items.uuid = p_uuid;
                items.ImageExists = 'Y';
                g_world.add(items);
                items.castShadow = true;

                add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, p_pog_index);
                if (p_HighlightItem == p_uuid) {
                    g_intersected.push(items);
                    var highlightItem = highlightProduct(items, 4, p_width, p_height, p_depth, p_z);
                }
                animate_pog(p_pog_index);
                render();
                resolve(items.id);
            } else {
                var colorValue = parseInt(p_color.replace("#", "0x"), 16);
                var hex_decimal = new THREE.Color(colorValue);
                items = new THREE.Mesh(
                    new THREE.BoxGeometry(p_width, p_height, p_depth),
                    new THREE.MeshStandardMaterial({
                        color: hex_decimal,
                    }));

                if (rotation !== 0 || slope !== 0) {
                    var selectedObject = g_world.getObjectById(g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);

                    if (p_recreate == "N") {
                        p_x = 0 - (g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2 - p_width / 2 - g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Distance);
                        p_y = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + p_height / 2;
                        p_z = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 - p_depth / 2;
                    }

                    items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));
                    g_scene.updateMatrixWorld();
                    items.matrixAutoUpdate = false;
                    items.applyMatrix4(selectedObject.matrix);
                } else {
                    items.position.x = p_x;
                    items.position.z = p_z;
                    items.position.y = p_y;
                }
                items.uuid = p_uuid;
                items.ImageExists = 'N';
                if (p_HighlightItem == p_uuid) {
                    g_intersected.push(items);
                    var highlightItem = highlightProduct(items, 4, p_width, p_height, p_depth, p_z);
                }
                g_world.add(items);
                items.castShadow = true;
                add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, p_pog_index);
                render();
                resolve(items.id);
            }
        });
    } catch (err) {
        error_handling(err);
    }
}


function add_items_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_rotation, p_pog_index) {
    try {
        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);

        items = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, p_depth),
            new THREE.MeshStandardMaterial({
                color: hex_decimal,
            })
        );
        if (p_rotation !== 0) {
            items.rotateY((p_rotation * Math.PI) / 180);
        }

        items.position.x = p_x;
        items.position.z = p_z;
        items.position.y = p_y;
        items.uuid = p_uuid;
        items.ImageExists = 'N';
        var l_wireframe_id = add_wireframe_3d(items);
        g_world.add(items);
        add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, p_pog_index);
        render();

        return items.id;
    } catch (err) {
        error_handling(err);
    }
}

function add_items_prom_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_HighlightItem, p_pog_index) {
    try {
        return new Promise(function (resolve, reject) {
            var colorValue = parseInt(p_color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            var rotation = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation;
            var slope = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Slope;

            if (nvl(rotation) !== 0 || nvl(slope) !== 0) {
                items = new THREE.Mesh(
                    new THREE.BoxGeometry(p_width, p_height, p_depth),
                    new THREE.MeshBasicMaterial({
                        color: hex_decimal,
                    }));
                var selectedObject = g_world.getObjectById(g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);

                p_x = 0 - (g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2 - p_width / 2 - g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Distance);
                p_y = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + p_height / 2;
                p_z = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 - p_depth / 2;

                g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationX = p_x;
                g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationY = p_y;
                g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationZ = p_z;

                items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));
                // apply transforms of mesh on top
                g_scene.updateMatrixWorld();
                items.matrixAutoUpdate = false;
                items.applyMatrix4(selectedObject.matrix);
            } else {
                items = new THREE.Mesh(
                    new THREE.BoxGeometry(p_width, p_height, p_depth),
                    new THREE.MeshStandardMaterial({
                        color: hex_decimal,
                    }));
                items.position.x = p_x;
                items.position.z = p_z;
                items.position.y = p_y;
            }
            items.uuid = p_uuid;
            if (p_HighlightItem == p_uuid) {
                g_intersected.push(items);
                var highlightItem = highlightProduct(items, 4, p_width, p_height, p_depth, p_z);
            } else {
                var l_wireframe_id = add_wireframe_3d(items);
            }
            items.ImageExists = 'N';
            g_world.add(items);
            items.castShadow = true;
            add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, p_pog_index);
            render();
            resolve(items.id);
        });
    } catch (err) {
        error_handling(err);
    }
}

function Show_Depthfacing(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height, p_pog_index) {
    var points = [],
        verti_values = [],
        horiz_values = [],
        points_2 = [],
        curr_vert_value = 0,
        curr_width = 0,
        curr_depth = 0;
    curr_height = 0;
    var item_info = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
    depth = item_info.D;
    depth_facing = item_info.BaseD;
    var real_height = item_info.RH;
    var real_width = item_info.RW;
    var horiz_facing = item_info.BHoriz;
    var vert_facing = item_info.BVert;
    var l_vert_start = 0 - parseFloat(p_height) / 2;
    var new_height = p_height;
    var cap_height = p_height;
    if (item_info.CapCount > 0) {
        new_height = p_height - ((item_info.CapCount * 2) * item_info.CapHeight);
        cap_height = p_height - ((item_info.CapCount) * item_info.CapHeight);
    }
    var l_vert_end = 0 + parseFloat(new_height) / 2;
    var l_horz_start = 0 - parseFloat(p_width) / 2;
    var l_horz_end = 0 + parseFloat(p_width) / 2;
    var l_depth_start = 0 - parseFloat(depth) / 2;
    var l_depth_end = 0 + parseFloat(depth) / 2;
    var start = 0 - parseFloat(p_width) / 2;
    var end = 0 + parseFloat(p_width) / 2;
    var capStyle = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle; //ASA-1179
    var capHeight = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHeight; //ASA-1179
    var capDepthCount = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth; //ASA-1179
    var l_capStart = -1, l_capEnd = -1;
    var nesting_value = item_info.NVal;
    var nesting_type = item_info.ItemNesting;

    if (capStyle !== 0) {
        l_capStart = l_vert_end;
        l_capEnd = l_vert_end + (capHeight * item_info.CapCount);
    }
    var depth_values = [], cap_depth_values = [];
    var material = new THREE.LineBasicMaterial({
        color: 0x000000,
    });

    if (depth_facing > 1) {
        if (nesting_type == "" || typeof nesting_type == "undefined") {
            curr_depth = depth / depth_facing;

            var curr_depth_value = l_depth_start;
            for (i = 1; i < depth_facing; i++) {
                curr_depth_value += parseFloat(curr_depth);
                depth_values.push(curr_depth_value);
            }
            for (i = 0; i < depth_values.length; i++) {
                points.push(new THREE.Vector3(start, l_vert_start, depth_values[i]));
                points.push(new THREE.Vector3(start, l_vert_end, depth_values[i]));
            }
            for (i = 0; i < depth_values.length; i++) {
                points_2.push(new THREE.Vector3(end, l_vert_start, depth_values[i]));
                points_2.push(new THREE.Vector3(end, l_vert_end, depth_values[i]));
            }
        }
        //ASA-1519 S
        if (nesting_value !== "" && nesting_type === "D") {
            // Calculate the first item's depth
            var firstItemDepth = item_info.RD - ((item_info.BaseD - 1) * parseFloat(nesting_value));

            //    points.push(new THREE.Vector3(start, l_vert_start, firstItemDepth));
            //    points.push(new THREE.Vector3(start, l_vert_end, firstItemDepth));

            //    points_2.push(new THREE.Vector3(end, l_vert_start, firstItemDepth));
            //    points_2.push(new THREE.Vector3(end, l_vert_end, firstItemDepth));

            var curr_depth_value = l_depth_start;
            var depth_values = [];

            for (var i = 1; i < depth_facing; i++) {
                curr_depth_value += parseFloat(nesting_value);  // Increment by nesting_value
                depth_values.push(curr_depth_value);            // Store the new depth value
            }

            for (var i = 0; i < depth_values.length; i++) {
                points.push(new THREE.Vector3(start, l_vert_start, depth_values[i]));
                points.push(new THREE.Vector3(start, l_vert_end, depth_values[i]));
            }

            for (var i = 0; i < depth_values.length; i++) {
                points_2.push(new THREE.Vector3(end, l_vert_start, depth_values[i]));
                points_2.push(new THREE.Vector3(end, l_vert_end, depth_values[i]));
            }
        }

        //ASA-1519 E
    }

    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var geometry1 = new THREE.BufferGeometry().setFromPoints(points_2);

    var line = new THREE.LineSegments(geometry, material);
    line.position.z = 0.0005;
    p_item_object.add(line);
    var line2 = new THREE.LineSegments(geometry1, material);
    line2.position.z = 0.0005;
    p_item_object.add(line2);
    points = [];
    points_2 = [];

    if (vert_facing > 1) {
        curr_height = (cap_height) / vert_facing;
        curr_vert_value = l_vert_start;
        for (i = 1; i < vert_facing; i++) {
            curr_vert_value += parseFloat(curr_height);
            verti_values.push(curr_vert_value);
        }
        for (i = 0; i < verti_values.length; i++) {
            points.push(new THREE.Vector3(start, verti_values[i], l_depth_start));
            points.push(new THREE.Vector3(start, verti_values[i], l_depth_end));
        }
        for (i = 0; i < verti_values.length; i++) {
            points_2.push(new THREE.Vector3(end, verti_values[i], l_depth_start));
            points_2.push(new THREE.Vector3(end, verti_values[i], l_depth_end));
        }
    }
    //ASA-1179
    if (item_info.CapCount > 0) {
        curr_height = item_info.CapHeight;
        curr_vert_value = l_vert_start + p_height - ((item_info.CapCount + 1) * item_info.CapHeight);
        for (i = 0; i < item_info.CapCount; i++) {
            curr_vert_value += parseFloat(curr_height);
            verti_values.push(curr_vert_value);
        }
        for (i = 0; i < verti_values.length; i++) {
            points.push(new THREE.Vector3(start, verti_values[i], l_depth_start));
            points.push(new THREE.Vector3(start, verti_values[i], l_depth_end));
        }
        for (i = 0; i < verti_values.length; i++) {
            points_2.push(new THREE.Vector3(end, verti_values[i], l_depth_start));
            points_2.push(new THREE.Vector3(end, verti_values[i], l_depth_end));
        }
    }
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var geometry1 = new THREE.BufferGeometry().setFromPoints(points_2);


    var line = new THREE.LineSegments(geometry, material);
    line.position.z = 0.0005;
    p_item_object.add(line);
    var line2 = new THREE.LineSegments(geometry1, material);
    line2.position.z = 0.0005;
    p_item_object.add(line2);
    points = [];
    points_2 = [];
    if (depth_facing > 1) {
        if (nesting_type == "" || typeof nesting_type == "undefined") {
            curr_depth = depth / depth_facing;
            var curr_depth_value = l_depth_start;
            for (i = 1; i < depth_facing; i++) {
                curr_depth_value += parseFloat(curr_depth);
                depth_values.push(curr_depth_value);
            }
            for (i = 0; i < depth_values.length; i++) {
                points.push(new THREE.Vector3(l_horz_start, l_vert_end, depth_values[i]));
                points.push(new THREE.Vector3(l_horz_end, l_vert_end, depth_values[i]));
            }
        }
        if (nesting_type == "D") {  //ASA-1519 S
            var firstItemDepth = item_info.RD - ((item_info.BaseD - 1) * parseFloat(nesting_value));
            var curr_depth_value = l_depth_start;
            for (i = 1; i < depth_facing; i++) {
                curr_depth_value += parseFloat(nesting_value);
                depth_values.push(curr_depth_value);
            }
            for (i = 0; i < depth_values.length; i++) {
                points.push(new THREE.Vector3(l_horz_start, l_vert_end, depth_values[i]));
                points.push(new THREE.Vector3(l_horz_end, l_vert_end, depth_values[i]));
            }

        }  //ASA-1519 E

    }
    var geometry1 = new THREE.BufferGeometry().setFromPoints(points);
    var line2 = new THREE.LineSegments(geometry1, material);
    line2.position.z = 0.0005;
    p_item_object.add(line2);
    points = [];
    points_2 = [];

    if (capDepthCount > 1) {
        curr_depth = depth / capDepthCount;

        var curr_depth_value = l_depth_start;
        for (i = 1; i < capDepthCount; i++) {
            curr_depth_value += parseFloat(curr_depth);
            cap_depth_values.push(curr_depth_value);
        }
        for (i = 0; i < cap_depth_values.length; i++) {
            points.push(new THREE.Vector3(start, l_capStart, cap_depth_values[i]));
            points.push(new THREE.Vector3(start, l_capEnd, cap_depth_values[i]));
        }
        for (i = 0; i < cap_depth_values.length; i++) {
            points_2.push(new THREE.Vector3(end, l_capStart, cap_depth_values[i]));
            points_2.push(new THREE.Vector3(end, l_capEnd, cap_depth_values[i]));
        }
    }

    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var geometry1 = new THREE.BufferGeometry().setFromPoints(points_2);

    var line = new THREE.LineSegments(geometry, material);
    line.position.z = 0.0005;
    p_item_object.add(line);
    var line2 = new THREE.LineSegments(geometry1, material);
    line2.position.z = 0.0005;
    p_item_object.add(line2);

    points = [];
    points_2 = [];
    if (capDepthCount > 1) {
        curr_depth = depth / capDepthCount;

        var curr_depth_value = l_depth_start;
        for (i = 1; i < capDepthCount; i++) {
            curr_depth_value += parseFloat(curr_depth);
            cap_depth_values.push(curr_depth_value);
        }
        for (i = 0; i < cap_depth_values.length; i++) {
            points.push(new THREE.Vector3(l_horz_start, l_capEnd, cap_depth_values[i]));
            points.push(new THREE.Vector3(l_horz_end, l_capEnd, cap_depth_values[i]));
        }
    }
    var geometry1 = new THREE.BufferGeometry().setFromPoints(points);

    var line2 = new THREE.LineSegments(geometry1, material);
    line2.position.z = 0.0005;
    p_item_object.add(line2);
}

function add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height, p_pog_index) {
    try {
        var item_info = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
        horiz_facing = item_info.BHoriz;
        vert_facing = item_info.BVert;
        var nesting = item_info.ItemNesting;
        var nesting_val = item_info.NVal;
        var cap_style = item_info.CapStyle;
        var cap_count = item_info.CapCount;
        var [org_width, org_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(item_info.Orientation, item_info.OW, item_info.OH, item_info.OD);
        var item_depth = item_info.D;
        var real_height = item_info.RH;
        var verti_values = [],
            horiz_values = [],
            nesting_negetive = "N",
            curr_width = 0,
            curr_vert_value = 0,
            curr_height = 0;
        var l_horz_start = 0 - parseFloat(p_width) / 2;
        var l_vert_start = 0 - parseFloat(p_height) / 2;
        var l_horz_end = 0 + parseFloat(p_width) / 2;
        var l_vert_end = 0 + parseFloat(p_height) / 2;
        var l_cap_end = l_vert_end;
        var new_height = p_height;
        var cap_height = 0;
        if (item_info.CapCount > 0) {
            cap_height = item_info.CapHeight;
            new_height = p_height - ((item_info.CapCount * 2) * item_info.CapHeight);
            l_cap_end = 0 + parseFloat(new_height) / 2;
        }

        var shelf_depth = g_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D;
        var points = [];
        Show_Depthfacing(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height, p_pog_index);
        if ((nesting_val > 0 || nesting_val < 0) && (vert_facing > 1 || horiz_facing > 1)) {
            if (nesting_val < 0) {
                nesting_val = nesting_val * -1;
                nesting_negetive = "Y";
            }
            if (nesting == "H") {
                if (nesting_negetive == "N") {
                    curr_vert_value = l_vert_start + org_height;
                    verti_values.push(curr_vert_value);
                } else {
                    curr_vert_value = l_vert_start;
                }
                for (i = 1; i < vert_facing; i++) {
                    curr_vert_value += parseFloat(nesting_val);
                    if (curr_vert_value < l_vert_end) verti_values.push(curr_vert_value);
                    else break;
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
                if (horiz_facing > 1) {
                    curr_width = p_width / horiz_facing;

                    var curr_horiz_value = l_horz_start;
                    for (i = 1; i < horiz_facing; i++) {
                        curr_horiz_value += parseFloat(curr_width);
                        if (curr_horiz_value < l_vert_end) horiz_values.push(curr_horiz_value);
                        else break;
                    }
                    for (i = 0; i < horiz_values.length; i++) {
                        points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                        points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                    }
                }
            } else if (nesting == "W") {
                if (nesting_negetive == "N") {
                    curr_vert_value = l_horz_start + org_width;
                    horiz_values.push(curr_vert_value);
                } else {
                    curr_vert_value = l_horz_start;
                }
                for (i = 1; i < horiz_facing; i++) {
                    curr_vert_value += parseFloat(nesting_val);
                    if (curr_vert_value < l_horz_end) horiz_values.push(curr_vert_value);
                    else break;
                }

                for (i = 0; i < horiz_values.length; i++) {
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                }
                if (vert_facing > 1) {
                    curr_height = p_height / vert_facing;

                    curr_vert_value = l_vert_start;
                    for (i = 1; i < vert_facing; i++) {
                        curr_vert_value += parseFloat(curr_height);
                        if (curr_vert_value < l_vert_end) verti_values.push(curr_vert_value);
                        else break;
                    }
                    for (i = 0; i < verti_values.length; i++) {
                        points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                        points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                    }
                }
            } else { //ASA-1519 S
                if (vert_facing > 1) {
                    curr_height = (p_height - cap_height) / vert_facing;
                    curr_vert_value = l_vert_start;
                    for (i = 1; i < vert_facing; i++) {
                        curr_vert_value += parseFloat(curr_height);
                        verti_values.push(curr_vert_value);
                    }
                    for (i = 0; i < verti_values.length; i++) {
                        points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                        points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                    }
                }
                if (horiz_facing > 1) {
                    curr_width = p_width / horiz_facing;

                    var curr_horiz_value = l_horz_start;
                    for (i = 1; i < horiz_facing; i++) {
                        curr_horiz_value += parseFloat(curr_width);
                        horiz_values.push(curr_horiz_value);
                    }
                    for (i = 0; i < horiz_values.length; i++) {
                        points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                        points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                    }
                }
            } //ASA-1519 E
        } else if (cap_style !== "0") {
            var items_cnt = 0;
            if (cap_style == "1") {
                curr_vert_value = l_vert_start;
                for (i = 1; i <= vert_facing; i++) {
                    curr_vert_value += parseFloat(org_height);
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }
                for (i = 1; i < cap_count; i++) {
                    curr_vert_value += parseFloat(item_info.CapHeight); //ASA-1170
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }
                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            } else if (cap_style == "2") {
                curr_vert_value = l_vert_start;
                for (i = 1; i <= vert_facing; i++) {
                    curr_vert_value += org_height;
                    verti_values.push(curr_vert_value);
                }
                for (i = 1; i < cap_count; i++) {
                    curr_vert_value += parseFloat(item_info.CapHeight); //ASA-1170
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            } else if (cap_style == "3") {
                curr_vert_value = l_vert_start + (org_height);
                verti_values.push(curr_vert_value);
                for (i = 1; i < cap_count; i++) {
                    curr_vert_value += parseFloat(item_info.CapHeight); //ASA-1170
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            }
            if (horiz_facing > 1) {
                curr_width = p_width / horiz_facing;

                var curr_horiz_value = l_horz_start;
                for (i = 1; i < horiz_facing; i++) {
                    curr_horiz_value += parseFloat(curr_width);
                    if (curr_horiz_value < l_vert_end) horiz_values.push(curr_horiz_value);
                    else break;
                }
                for (i = 0; i < horiz_values.length; i++) {
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                }
            }
        } else {
            if (vert_facing > 1) {
                curr_height = (p_height - cap_height) / vert_facing;
                curr_vert_value = l_vert_start;
                for (i = 1; i < vert_facing; i++) {
                    curr_vert_value += parseFloat(curr_height);
                    verti_values.push(curr_vert_value);
                }
                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            }
            if (horiz_facing > 1) {
                curr_width = p_width / horiz_facing;

                var curr_horiz_value = l_horz_start;
                for (i = 1; i < horiz_facing; i++) {
                    curr_horiz_value += parseFloat(curr_width);
                    horiz_values.push(curr_horiz_value);
                }
                for (i = 0; i < horiz_values.length; i++) {
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                }
            }
        }
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({
            color: 0x000000,
        });

        var line = new THREE.LineSegments(geometry, material);

        line.position.z = item_depth / 2;
        p_item_object.add(line);
    } catch (err) {
        error_handling(err);
    }
}

function get_canvas_camera(p_location) {
    try {
        return g_camera;
    } catch (err) {
        error_handling(err);
    }
}

async function get_img_indexeddb() {
    const DBOpenRequest = indexedDB.open("myDatabase", 2);
    var dba;
    var myRecord;
    DBOpenRequest.onsuccess = (event) => {
        console.log("success 1");
        dba = DBOpenRequest.result;
        // Run the getData() function to get the data from the database
        getData();
    };

    function getData() {
        // open a read/write db transaction, ready for retrieving the data
        const transaction = dba.transaction("myDatabaseStore", "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = (event) => {
            console.log("complete");
        };

        transaction.onerror = (event) => {
            console.log("error");
        };

        // create an object store on the transaction
        const objectStore = transaction.objectStore("myDatabaseStore");

        // Make a request to get a record by key from the object store
        const objectStoreRequest = objectStore.get("ImageDetail");

        objectStoreRequest.onsuccess = (event) => {
            console.log("success", objectStoreRequest.result);
            myRecord = objectStoreRequest.result;
            g_ItemImages = myRecord.ImgData;
        };
    }
}

async function recreate_image_items(p_show_live_ind, p_pogjson, p_pog_index) {
    try {
        var l = 0;

        var mod_arr = p_pogjson[p_pog_index].ModuleInfo;
        for (const modules of mod_arr) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                if (modules.ShelfInfo.length > 0) {
                    j = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            n = 0;
                            for (const items of shelfs.ItemInfo) {
                                if (items.Item !== "DIVIDER") {
                                    var selectedObject = g_world.getObjectById(items.ObjID);
                                    g_world.remove(selectedObject);
                                    if (p_show_live_ind == "Y" && items.MerchStyle != 3) {
                                        var details = g_orientation_json[g_json[p_pog_index].ModuleInfo[l].ShelfInfo[j].ItemInfo[n].Orientation];
                                        var details_arr = details.split("###");
                                        var objID = await add_items_with_image_3d(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, j, n, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", items.BaseD, '', $v("P34_SHOW_ITEM_SIDE_IMAGE"), p_pog_index);
                                    } else {
                                        var objID = await add_items_prom_3d(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, j, n, '', p_pog_index);
                                    }
                                    p_pogjson[p_pog_index].ModuleInfo[l].ShelfInfo[j].ItemInfo[n].ObjID = objID;
                                    if (p_show_live_ind == "N") {
                                        var selectedObject = g_world.getObjectById(objID);
                                        if (items.Status == "N") {
                                            selectedObject.BorderColour = g_status_error_color;
                                            selectedObject.Status = "N";
                                            selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                                        } else {
                                            selectedObject.BorderColour = 0x000000;
                                        }
                                    } else {
                                        if (items.Status == "N") {
                                            selectedObject.BorderColour = g_status_error_color;
                                            selectedObject.Status = "N";
                                        } else {
                                            if (typeof selectedObject !== "undefined") {
                                                selectedObject.BorderColour = 0x000000;
                                            }
                                        }
                                    }
                                }
                                n = n + 1;
                            }
                            animate_pog(p_pog_index);
                            if (shelfs.ObjType == "SHELF") {
                                var returnval = reset_top_bottom_objects(l, j, "N", p_pog_index);
                            }
                        }
                        else if (shelfs.TextImg !== "" && typeof shelfs.TextImg !== "undefined" && shelfs.ObjType == "TEXTBOX" && shelfs.TextImg !== null) {
                            var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            if (shelfs.Color.charAt(1) == "#" && shelfs.ObjType == "TEXTBOX") {
                                var bg_color = null;
                            } else {
                                var bg_color = colorValue;
                            }
                            if (p_show_live_ind == "Y" && shelfs.TextImg !== "" && typeof shelfs.TextImg !== "undefined" && shelfs.TextImg !== null) {
                                var return_val = await add_text_box_with_image_3d(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, l, shelfs.InputText, bg_color, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, shelfs.Rotation, shelfs.Slope, shelfs.FStyle, shelfs.FSize, shelfs.FBold, j, p_pog_index);
                            } else {
                                g_dblclick_objid = shelfs.SObjID;
                                g_shelf_index = j;
                                var return_val = add_text_box_3d(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, l, shelfs.InputText, colorValue, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, shelfs.Rotation, shelfs.Slope, shelfs.FStyle, shelfs.FSize, shelfs.FBold, p_pog_index);
                            }
                            var child_module_index = -1;
                            $.each(p_pogjson[p_pog_index].ModuleInfo, function (m, modules) {
                                if (modules.ParentModule !== null) {
                                    if (modules.Module == shelfs.Shelf) {
                                        child_module_index = m;
                                    }
                                }
                            });
                            if (child_module_index !== -1) {
                                p_pogjson[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
                            }
                        }
                        j = j + 1;
                    }
                }
            }
            l = l + 1;
        }
    } catch (err) {
        error_handling(err);
    }
}

//ASA-2010 Issue 3 Start
async function live_Image3D() {
    if (typeof g_pog_json != "undefined" && g_pog_json.length > 0) {
        $('#LIVE_IMAGE').addClass('apex_disabled');
        g_scene_objects = [];
        objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        g_scene_objects.push(objects);
        var return_val = await recreate_image_items(g_show_live_image, g_pog_json, g_pog_index);
        $('#LIVE_IMAGE').removeClass('apex_disabled');
    }
}
//ASA-2010 Issue 3 End