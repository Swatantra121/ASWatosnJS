
//asw_pdf.js: Handles PDF generation, scene cloning, rendering, and export logic for POG layouts.

async function init_pdf(p_canWidth, p_canHeight, p_scale, p_addWorld = "N", p_rendering = "Y") {
    try {
        logDebug("function : init_pdf", "S");

        if (typeof g_scene_pdf !== "undefined") await clearThree(g_scene_pdf);

        if (typeof g_renderer_pdf !== "undefined" && g_renderer_pdf !== null && g_renderer_pdf !== "") {
            //Bug_26122 pdf error issue
            g_renderer_pdf.forceContextLoss();
            g_renderer_pdf.dispose();
        }

        g_scene_pdf = {};
        g_camera_pdf = {};

        g_new_canvas = document.createElement("canvas");
        w = p_canWidth;
        h = p_canHeight;
        scale = p_scale;
        g_new_canvas.width = w * scale;
        g_new_canvas.height = h * scale;
        g_renderer_pdf = new THREE.WebGLRenderer({
            canvas: g_new_canvas,
        });


        if (p_rendering == "Y") {
            g_renderer_pdf.domElement.style.imageRendering = "pixelated";
        }
        g_renderer_pdf.domElement.style.width = w * scale + "px";
        g_renderer_pdf.domElement.style.height = h * scale + "px";

        g_scene_pdf = new THREE.Scene();
        g_camera_pdf = new THREE.PerspectiveCamera(25, g_new_canvas.width / g_new_canvas.height, 0.1, 700); //set 700 to squeeze the FPS.
        g_camera_pdf.lookAt(new THREE.Vector3(0, 0, 0));

        if (p_rendering == "Y") {
            g_renderer_pdf.setPixelRatio(1);
        } else {
            g_renderer_pdf.setPixelRatio(window.devicePixelRatio);
        }
        g_camera_pdf.add(new THREE.PointLight(0xdcd9d9, 0.1)); // point light at g_camera_pdf position
        g_scene_pdf.add(g_camera_pdf);
        g_renderer_pdf.setClearColor(0xffffff); //0xe2dede);
        g_renderer_pdf.setSize(g_new_canvas.width, g_new_canvas.height);
        var directionlight = new THREE.DirectionalLight(0xffffff, 1);
        directionlight.position.set(-1, 2, 4).normalize();
        g_scene_pdf.add(directionlight);
        g_camera_pdf.aspect = g_new_canvas.width / g_new_canvas.height;
        g_camera_pdf.updateProjectionMatrix();
        if (p_addWorld == "Y") {
            g_world_pdf = new THREE.Object3D();
            g_scene_pdf.add(g_world_pdf);
            g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
        }
        logDebug("function : init_pdf", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function create_scene(p_module_index, p_new_item_label, p_show_item_desc, p_mod_count, p_show_live_img, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_noDataModuleWidth = 0, p_pog_index) {
    logDebug("function : create_scene; p_module_index : " + p_module_index + "; new_item_label : " + p_new_item_label, "S");
    try {
        if (typeof g_pog_json[p_pog_index].ModuleInfo[p_module_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ParentModule == null) {
            if (g_pog_json[p_pog_index].BaseH > 0) {
                var colorValue = parseInt(g_pog_json[p_pog_index].ModuleInfo[p_module_index].Color.replace("#", "0x"), 16);
                var hex_decimal = new THREE.Color(colorValue);
                var POGBase = new THREE.Mesh(
                    new THREE.BoxGeometry(g_pog_json[p_pog_index].ModuleInfo[p_module_index].W + p_noDataModuleWidth, g_pog_json[p_pog_index].BaseH, 0.001),
                    new THREE.MeshStandardMaterial({
                        color: hex_decimal,
                    })
                );
                var l_wireframe_id = add_wireframe(POGBase, 2);
                POGBase.position.x = (g_pog_json[p_pog_index].ModuleInfo[p_module_index].W + p_noDataModuleWidth) / 2;
                POGBase.position.y = g_pog_json[p_pog_index].BaseH / 2;
                POGBase.position.z = 0;
                g_scene_pdf.add(POGBase);
                var moduleY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H / 2 + g_pog_json[p_pog_index].BaseH;
            } else {
                var moduleY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H / 2;
            }
            g_world = g_scene_objects[p_pog_index].scene.children[2];
            var module = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_index].MObjID);
            var moduleX = g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2;
            var new_module = module.clone(true);
            new_module.material = module.material.clone(true);
            g_scene_pdf.add(new_module);
            new_module.position.set(moduleX, moduleY, 0);
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length > 0) {
                j = 0;
                for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.SplitChest !== "Y") {
                        //Bug-26122 - splitting the chest
                        var shelf = g_world.getObjectById(shelfs.SObjID);
                        var shelfX = -1;
                        var created_ind = "N";
                        if (shelfs.ObjType == "TEXTBOX") {
                            if ((shelfs.W < g_pog_json[p_pog_index].W && p_mod_count > 1) || p_mod_count == 1) {
                                var new_shelf = new THREE.Mesh(shelf.geometry, shelf.material);
                                new_shelf.material.transparent = false;
                                var l_wireframe_id = add_wireframe(new_shelf, 12);
                                if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                    if (shelfs.Slope > 0) {
                                        slope = 0 - shelfs.Slope;
                                    } else {
                                        slope = -shelfs.Slope;
                                    }

                                    new_shelf.rotateY((shelfs.Rotation * Math.PI) / 180);
                                    if (shelfs.Rotation == 0) {
                                        new_shelf.rotateX(((slope / 2) * Math.PI) / 180);
                                    } else {
                                        new_shelf.rotateX((slope * Math.PI) / 180);
                                    }
                                }
                                created_ind = "Y";
                                shelfX = shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2);
                                if (typeof shelfs.MergeTextbox !== "undefined") {
                                    if (shelfs.MergeTextbox == "Y") {
                                        shelfX = moduleX;
                                    }
                                }
                            }
                        } else if (shelfs.ObjType == "CHEST" && g_pogcr_pdf_chest_split == "Y") {
                            var new_shelf = new THREE.Mesh(
                                new THREE.BoxGeometry(shelfs.W, shelfs.H, 0.0001), //shelfs.D),
                                new THREE.MeshStandardMaterial({
                                    color: shelfs.Color,
                                })
                            );
                            var l_wireframe_id = add_wireframe(new_shelf, 2);
                            new_shelf.material = shelf.material.clone(true);

                            // var new_shelf = shelf.clone(true);
                            shelfX = shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2);
                            created_ind = "Y";
                        } else {
                            var new_shelf = shelf.clone(true);
                            shelfX = shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2);
                            new_shelf.material = shelf.material.clone(true);
                            var l_wireframe_id = add_wireframe(new_shelf, 4);
                            created_ind = "Y";
                        }
                        if (created_ind == "Y") {
                            g_scene_pdf.add(new_shelf);
                            var shelf_start = shelfX - shelfs.W / 2;
                            g_scene_pdf.updateMatrixWorld();

                            var shelfZ = 0;

                            if (shelfs.ObjType == "TEXTBOX") {
                                shelfZ = g_world.getObjectById(shelfs.SObjID).position.z; //shelfs.Z > 0.0021 ? 0.0021 : shelfs.Z == 0 ? 0.0006 : shelfs.Z;   //ASA-1652 #10
                            } else if (shelfs.ObjType == "PEGBOARD") {
                                shelfZ = 0.003;
                            } else {
                                if (isShelfOnPegboard(shelfs.X, shelfs.Y, p_module_index, p_pog_index, shelfs, g_pog_json)) {
                                    shelfZ = 0.005;
                                } else {
                                    // shelfZ = 0.0005;
                                    shelfZ = g_world.getObjectById(shelfs.SObjID).position.z//ASA-2024.2
                                } //ASA - 1544 Issue 2
                            }
                            new_shelf.position.set(shelfX, shelfs.Y, shelfZ);
                        }
                        k = 0;
                        update_item_distance(p_module_index, j, p_pog_index, "N"); //Bug-26122 - splitting the chest

                        for (const items of shelfs.ItemInfo) {
                            var item = g_world.getObjectById(items.ObjID);
                            if (typeof item !== "undefined") {
                                var new_item = new THREE.Mesh(item.geometry, item.material);
                                // if (shelfs.SpreadItem == "F" || items.CapStyle !== "0" || show_item_desc == "Y") {
                                for (const objects of item.children) {
                                    if (objects.uuid !== "wireframe") {
                                        var child_item = objects.clone(true);
                                        child_item.uuid = objects.uuid;
                                        var new_z;
                                        if (child_item.uuid == "facings") {
                                            new_z = 0.001;
                                        } else if (child_item.uuid == "cap") {
                                            new_z = new_z - 0.0001;
                                        } else if (child_item.uuid == "ITEM_DESC") {
                                            // new_z = 0.005; //ASA-1729 Issue 7
                                            new_z = 0.0006; //ASA-1839 0.0008; //ASA-1729 Issue 7
                                        } else {
                                            new_z = objects.position.z; //ASA-1538    //ASA-1729  //0.009
                                        }
                                        child_item.position.z = new_z;
                                        new_item.add(child_item);
                                    }
                                }
                                // }
                                g_scene_pdf.updateMatrixWorld();
                                new_item.updateMatrixWorld();
                                if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                    var x = items.RotationX;
                                    var y = items.RotationY;
                                    var z = items.RotationZ;
                                    var relativeMeshOffset = new THREE.Vector3(x, y, z);

                                    var offsetPosition = relativeMeshOffset.applyMatrix4(new_shelf.matrixWorld);

                                    new_item.position.x = offsetPosition.x;
                                    new_item.position.y = offsetPosition.y;
                                    new_item.position.z = offsetPosition.z;
                                    new_item.quaternion.copy(new_shelf.quaternion);
                                    new_item.updateMatrix();
                                } else {
                                    if (shelfs.ObjType == "PEGBOARD") {
                                        var new_z = 0.016;
                                    } else {
                                        if (isShelfOnPegboard(shelfs.X, shelfs.Y, p_module_index, p_pog_index, shelfs, g_pog_json)) {
                                            var new_z = 0.005 + shelfs.D / 1000;
                                        } else {
                                            var new_z = 0.001 + shelfs.D / 1000; // ASA - 1573 Issue 1 (0.001 ), ASA- 1608 Issue 1
                                        } //ASA - 1544 Issue 2
                                    }
                                    var new_x = -1;
                                    if (shelfs.ObjType == "BASKET" && shelfs.BsktSpreadProduct == "BT") {
                                        new_x = shelf_start + items.W / 2;
                                    } else {
                                        new_x = shelf_start + items.Distance + items.W / 2;
                                    }
                                    new_item.position.set(new_x, items.Y, new_z);
                                }
                                g_scene_pdf.add(new_item);
                                var l_wireframe_id = add_wireframe(new_item, 4);
                                add_item_borders(p_module_index, j, k, new_item, items.W, items.H, items.BHoriz, p_pog_index, "N"); //Bug-26122 - splitting the chest
                                if (p_new_item_label == "Y") {
                                    var return_val = update_item_label(p_module_index, j, k, new_item, "Y", p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, "N"); //Bug-26122 - splitting the chest
                                }
                            }
                            k = k + 1;
                        }
                    }
                    j = j + 1;
                }
            }
            //Start Bug-26122 - splitting the chest
            //ASA-1506 issue 1, 2
            if (nvl(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ChestInfo) !== 0 && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ChestInfo.length > 0) {
                j = 0;
                for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ChestInfo) {
                    var shelf = g_world.getObjectById(shelfs.SObjID);
                    var shelfX = -1;
                    var created_ind = "N";
                    if (shelfs.ObjType == "CHEST" && g_pogcr_pdf_chest_split == "Y") {
                        var new_shelf = new THREE.Mesh(
                            new THREE.BoxGeometry(shelfs.W, shelfs.H, 0.0001), //shelfs.D),
                            new THREE.MeshStandardMaterial({
                                color: shelfs.Color,
                            })
                        );
                        var l_wireframe_id = add_wireframe(new_shelf, 2);
                        new_shelf.material = shelf.material.clone(true);

                        // var new_shelf = shelf.clone(true);
                        shelfX = shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2);
                        created_ind = "Y";
                    }
                    if (created_ind == "Y") {
                        g_scene_pdf.add(new_shelf);
                        var shelf_start = shelfX - shelfs.W / 2;
                        g_scene_pdf.updateMatrixWorld();
                        var shelfZ = 0;
                        shelfZ = 0.0005;
                        new_shelf.position.set(shelfX, shelfs.Y, shelfZ);
                    }
                    k = 0;
                    update_item_distance(p_module_index, j, p_pog_index, "Y");

                    for (const items of shelfs.ItemInfo) {
                        var item = g_world.getObjectById(items.ObjID);
                        if (typeof item !== "undefined") {
                            var new_item = new THREE.Mesh(item.geometry, item.material);
                            // if (shelfs.SpreadItem == "F" || items.CapStyle !== "0" || show_item_desc == "Y") {
                            for (const objects of item.children) {
                                if (objects.uuid !== "wireframe") {
                                    var child_item = objects.clone(true);
                                    child_item.uuid = objects.uuid;
                                    var new_z;
                                    if (child_item.uuid == "facings") {
                                        new_z = 0.001;
                                    } else if (child_item.uuid == "cap") {
                                        new_z = new_z - 0.0001;
                                    } else if (child_item.uuid == "ITEM_DESC") {
                                        // new_z = 0.005; //ASA-1729 Issue 7
                                        new_z = 0.0006; //ASA-1839 0.0008; //ASA-1729 Issue 7
                                    } else {
                                        new_z = objects.position.z; //ASA-1538    //ASA-1729  //0.009
                                    }
                                    child_item.position.z = new_z;
                                    new_item.add(child_item);
                                }
                            }
                            // }
                            g_scene_pdf.updateMatrixWorld();
                            new_item.updateMatrixWorld();
                            if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                var x = items.RotationX;
                                var y = items.RotationY;
                                var z = items.RotationZ;
                                var relativeMeshOffset = new THREE.Vector3(x, y, z);

                                var offsetPosition = relativeMeshOffset.applyMatrix4(new_shelf.matrixWorld);

                                new_item.position.x = offsetPosition.x;
                                new_item.position.y = offsetPosition.y;
                                new_item.position.z = offsetPosition.z;
                                new_item.quaternion.copy(new_shelf.quaternion);
                                new_item.updateMatrix();
                            } else {
                                var new_z = 0.001 + shelfs.D / 1000;
                                var new_x = -1;
                                new_x = shelf_start + items.Distance + items.W / 2;
                                new_item.position.set(new_x, items.Y, new_z);
                            }
                            g_scene_pdf.add(new_item);
                            var l_wireframe_id = add_wireframe(new_item, 4);
                            add_item_borders(p_module_index, j, k, new_item, items.W, items.H, items.BHoriz, p_pog_index, "Y"); //Bug-26122 - splitting the chest
                            if (p_new_item_label == "Y") {
                                var return_val = update_item_label(p_module_index, j, k, new_item, "Y", p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, "Y"); //Bug-26122 - splitting the chest
                            }
                        }
                        k = k + 1;
                    }
                    j = j + 1;
                }
            }
            //End Bug-26122 - splitting the chest
            if (g_renderer_pdf !== null) {
                animate_pog_pdf();
            }
        }
        logDebug("function : create_scene", "E");
        return "success";
    } catch (err) {
        error_handling(err);
        throw err;
    }
}

async function merge_textboxes_pdf(p_new_pogjson, p_pog_index) {
    try {
        var max_y = -1;
        for (const modules of p_new_pogjson[p_pog_index].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                for (const shelfs of modules.ShelfInfo) {
                    if (shelfs.ObjType == "TEXTBOX") {
                        max_y = Math.max(max_y, shelfs.Y);
                    }
                }
            }
        }
        l_cnt = 0;
        l_index_arr = [];
        var i = 0;
        for (const modules of p_new_pogjson[p_pog_index].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (shelfs.ObjType == "TEXTBOX") {
                        if (shelfs.W > modules.W && shelfs.W < p_new_pogjson[p_pog_index].W && shelfs.Y >= max_y) {
                            l_cnt++;
                            l_index_arr.push(j);
                        }
                    }
                    j++;
                }
            }
        }
        if (l_cnt > 1) {
            var i = 0;
            for (const modules of p_new_pogjson[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var j = 0;
                    var hit = "N";
                    for (const module_in of p_new_pogjson[p_pog_index].ModuleInfo) {
                        if (hit == "Y") {
                            hit = "N";
                            break;
                        }
                        if ((typeof module_in.ParentModule == "undefined" || module_in.ParentModule == null) && i !== j) {
                            var k = 0;
                            for (const shelfs of module_in.ShelfInfo) {
                                if (shelfs.ObjType == "TEXTBOX") {
                                    var shelf_start = shelfs.X - shelfs.W / 2;
                                    var shelf_end = shelfs.X + shelfs.W / 2;
                                    if (modules.X - modules.W / 2 + modules.W / 3 >= shelf_start && modules.X + modules.W / 2 <= shelf_end && shelfs.Y >= max_y) {
                                        shelfs.MergeTextbox = "Y";
                                        p_new_pogjson[p_pog_index].ModuleInfo[i].ShelfInfo.push(shelfs);
                                        hit = "Y";
                                        break;
                                    }
                                }
                                k++;
                            }
                        }
                        j++;
                    }
                }
                i++;
            }
            var i = 0;
            for (const modules of p_new_pogjson[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var mod_start = modules.X - modules.W / 2;
                    var mod_end = modules.X + modules.W / 2;
                    var k = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType == "TEXTBOX") {
                            var shelf_start = shelfs.X - shelfs.W / 2;
                            var shelf_end = shelfs.X + shelfs.W / 2;
                            if (((shelf_start > mod_start && shelf_start >= mod_end) || (shelf_start < mod_start && shelf_end <= mod_start)) && shelfs.Y >= max_y) {
                                p_new_pogjson[p_pog_index].ModuleInfo[i].ShelfInfo.splice(k, 1);
                            }
                        }
                        k++;
                    }
                }
                i++;
            }
        }
        return p_new_pogjson;
    } catch (err) {
        error_handling(err);
        throw err;
    }
}


//ASA-1870 Added new parameters from p_enhance_pdf_image to p_pog_pdf_request
async function create_pdf(p_pog_details, p_save_pdf, p_save_pog, p_camera, p_draftPogInd, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrDescListArr, p_NotchHead, p_resetZoomInd = "Y", p_pog_index, p_genLiveImg, p_allPogFlag, p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_ItemNumLblPos, p_DispItemInfo, p_DelistDftColor, p_WorkflowSave = "N", p_DraftSeqID = "", p_ItemDtlList, p_create_img = "Y",
    p_enhance_pdf_image, p_enhance_pdf_ratio, p_canvas_size, p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, p_pegb_dft_horiz_spacing, p_pegboard_dft_vert_spacing, p_basket_dft_wall_thickness, p_chest_wall_thickness, p_pegb_max_arrange, p_default_wrap_text, p_cr_default_text_size, p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_default_basket_fill, p_default_basket_spread, p_bay_live_image, p_bay_without_live_image, p_bulk_pdf_request) {
    try {
        logDebug("function : create_pdf; p_pog_details : " + p_pog_details + "; save_pdf : " + p_save_pdf + "; save_pog : " + p_save_pog, "S");
        if (p_resetZoomInd == "Y") {
            reset_zoom(p_pog_index);
        }
        var details_arr = p_pog_details.TemplateDetails.split("-");

        var new_live_image = "N";
        var new_item_label = "N";
        var donot_recreate = "N";
        p_create_img = (p_create_img || "").trim() || "Y"; //ASA-1975.1
        if ((details_arr[1] == "Y" && g_show_notch_label == "N") || (details_arr[1] == "Y" && g_show_notch_label == "Y") || (details_arr[1] == "N" && g_show_notch_label == "Y")) {
            show_notch_labels("Y", p_NotchHead, "Y", p_pog_index);
        } else if (details_arr[1] == "N") {
            show_notch_labels("N", p_NotchHead, "Y", p_pog_index);
        }
        if ((details_arr[2] == "Y" && g_show_fixel_label == "N") || (details_arr[2] == "Y" && g_show_fixel_label == "Y") || (details_arr[2] == "N" && g_show_fixel_label == "Y")) {
            show_fixel_labels("Y", p_pog_index);
        } else if (details_arr[2] == "N") {
            show_fixel_labels("N", p_pog_index);
        }
        add_merch("Y", p_pog_index); //ASA-1531 issue 21
        add_merch("N", p_pog_index); //ASA-1531 issue 21
        if (details_arr[6] == "Y" && g_show_item_desc == "N" && p_create_img == "Y") {
            if (g_show_live_image == "Y") {
                var return_val = await recreate_image_items("N", p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_ItemNumLblPos, p_DispItemInfo, p_DelistDftColor, p_NotchHead, p_pog_index, "N", "", p_ItemDtlList);
                new_live_image = "N";
            }
            var res = await showHideItemDescription("Y", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
        } else if (details_arr[6] == "N" && g_show_item_desc == "Y" && p_create_img == "Y") {
            var res = await showHideItemDescription("N", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
        }
        var old_fixel_label = g_show_fixel_label,
            old_notch_label = g_show_notch_label,
            old_item_label = g_show_item_label,
            old_item_desc = g_show_item_desc;

        //if (g_show_live_image == "N" && details_arr[7] == "Y" && details_arr[6] == "N" && p_create_img == "Y") {
        if ((p_save_pdf == "Y" || g_show_live_image === "N") && details_arr[7] === "Y" && details_arr[6] === "N" && p_create_img === "Y") { //Regression 4 
            var return_val = await recreate_image_items("Y", p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_ItemNumLblPos, p_DispItemInfo, p_DelistDftColor, p_NotchHead, p_pog_index, "N", "", p_ItemDtlList);
            new_live_image = "Y";
        } else if (g_show_live_image == "Y" && details_arr[7] == "N" && p_create_img == "Y") {
            var return_val = await recreate_image_items("N", p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_ItemNumLblPos, p_DispItemInfo, p_DelistDftColor, p_NotchHead, p_pog_index, "N", "", p_ItemDtlList);
            new_live_image = "N";
        } else if (g_show_days_of_supply == "Y" && details_arr[12] == "N" && g_show_live_image == "Y") {  //ASA-1975.2 Start
            //ASA-1608 Issue 1
            //await showHideDaysOfSupplyLabel("N", "N", p_pog_index, "Y", "N", "", p_ItemDtlList);
            await showHideDaysOfSupplyLabel("Y", "N", p_pog_index, "Y", "N", "", p_ItemDtlList); //ASA-1975.2
            new_live_image = g_show_live_image;
        } else if (g_show_days_of_supply == "Y" && details_arr[12] == "Y") {
            await showHideDaysOfSupplyLabel("N", "N", p_pog_index, "Y", "N", "", p_ItemDtlList);
            new_live_image = g_show_live_image;
        }  //ASA-1975.2 End
        else {
            new_live_image = g_show_live_image;
        }
        if (g_sublabel_type !== "") {
            //ASA-1533
            showItemSubLabel(g_sublabel_type, "Y", p_ItemNumLblColor, p_ItemNumLblPos, p_pog_index);
        }
        animate_pog(p_pog_index);
        old_live_iamge = g_show_item_desc == "N" ? g_show_live_image : "N";

        if (details_arr[3] == "Y" && g_show_item_label == "N") {
            new_item_label = "Y";
            show_item_labels("Y", p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index);
        } else if (details_arr[3] == "N") {
            new_item_label = "N";
            show_item_labels("N", p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index);
        }
        await timeout(200);
        var retval = await set_scene(p_pog_details, p_save_pdf, old_notch_label, old_fixel_label,
            old_item_label, details_arr[4], p_save_pog, details_arr[5], new_item_label, details_arr[6], p_draftPogInd, old_item_desc, old_live_iamge, new_live_image, p_pog_index, p_genLiveImg, p_WorkflowSave, p_DraftSeqID,
            details_arr[9], details_arr[1], details_arr[2], details_arr[3],
            p_enhance_pdf_image, p_enhance_pdf_ratio, p_canvas_size, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_Buid, p_MerchStyle, p_NotchHead, p_LoadImgFrom, p_pogcrDescListArr, p_DelistDftColor,
            p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, p_pegb_dft_horiz_spacing, p_pegboard_dft_vert_spacing, p_basket_dft_wall_thickness,
            p_chest_wall_thickness, p_pegb_max_arrange, p_default_wrap_text, p_cr_default_text_size, p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_default_basket_fill, p_default_basket_spread, p_bay_live_image, p_bay_without_live_image, p_bulk_pdf_request); //ASA-1870 added new parameters
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
        throw err;
    }
}

//This function is used inside create_pdf to create each module in different canvas and take screenshot. to place them into pdf.
//ASA-1870, Moved from page_25_wpd_2.js to main.js and added Added new parameters from p_enhance_pdf_image to p_pog_pdf_request
async function set_scene(p_pog_details, p_save_pdf, p_notch_label, p_fixel_label, p_item_label, p_pdf_lang, p_save_pog,
    p_mime_type, p_new_item_label, p_show_item_desc, p_draftPogInd, p_item_desc, p_old_live_iamge,
    p_loaded_live_img, p_pog_index, p_generateLiveImg, p_workflowSave = "N", p_draftSeqID = "", p_combineImgInd, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel,
    p_enhance_pdf_image, p_enhance_pdf_ratio, p_canvas_size, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_Buid, p_MerchStyle, p_NotchHead, p_LoadImgFrom, p_pogcrDescListArr, p_DelistDftColor,
    p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, p_pegb_dft_horiz_spacing, p_pegboard_dft_vert_spacing, p_basket_dft_wall_thickness,
    p_chest_wall_thickness, p_pegb_max_arrange, p_default_wrap_text, p_cr_default_text_size, p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_default_basket_fill, p_default_basket_spread, p_bay_live_image, p_bay_without_live_image, p_bulk_pdf_request) //ASA-1870 added new parameters 
{
    logDebug("function : set_scene; p_pog_details : " + p_pog_details + "; save_pdf : " + p_save_pdf + "; notch_label : " + p_notch_label + "; fixel_label : " + p_fixel_label + "; item_label : " + p_item_label + "; pdf_lang : " + p_pdf_lang + "; save_pog : " + p_save_pog + "; mime_type : " + p_mime_type + "; new_item_label : " + p_new_item_label, "S");
    var img_arr = [];
    render(p_pog_index);
    var base64;
    var comp_data = "";
    var noDataModuleWIdth = 0;
    var nodataModule = false;
    var enhance = 0.5;
    if (p_enhance_pdf_image == "Y") {
        enhance = parseFloat(p_enhance_pdf_ratio);
    }
    if (typeof p_combineImgInd !== "undefined") {
        var combine_details = p_combineImgInd.split("###");
    } else {
        var combine_details = [];
    }
    reset_zoom();
    var new_pogjson = [];
    if (p_bulk_pdf_request == "N") {
        set_pegid(p_pog_index);
    }
    // ASA-1235
    // Replaced new_pogjson and new_pogjson[0] to new_pogjson[p_pog_index]

    if (p_mime_type == "xlsx") {
        var res = await save_pog_to_json([g_pog_json[p_pog_index]]);
    }

    //ASA-1235 START
    var updateOrgPOGJSON = JSON.parse(JSON.stringify(g_pog_json));
    //Start Sprint 20240122 - Regression Issue 10
    // according to requirement if there is a chest spanning to more than one module then we need to split them into
    //pieces which will fit into each module for purpose of PDF.
    await get_chest_split_details(g_pogcr_pdf_chest_split, p_pog_index); // Sprint 20240122 - Regression Issue 10

    new_pogjson = JSON.parse(JSON.stringify(g_pog_json));

    //if text boxes are out of the module then we need to change that to the module where max width is occupied.
    if (g_textbox_merge_pdf == "Y") {
        var new_pogjson = await merge_textboxes_pdf(new_pogjson, p_pog_index); //0
    }
    var i = 0;
    var mod_count = 0;
    for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
            mod_count++;
        }
    }

    //ASA-1702 Issue 1, shifted to dynamic action of SAVE_POG/SAVE_PDF button
    //Regression 9 20241025
    // apex.server.process(
    //     "TRUNC_MOD_IMG_COLL", {
    //     x01: "",
    // }, {
    //     dataType: "text",
    //     success: function (pData) {
    //         console.log('Module Image collection truncated');
    //     }
    // });
    var i = 0;
    //this loop will create module wise image with shelf and items.
    for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
            /*if (typeof g_renderer_pdf !== "undefined" && g_renderer_pdf !== null && g_renderer_pdf !== "") { //ASA-1366
            g_renderer_pdf.forceContextLoss();
            g_renderer_pdf.context = null;
            g_renderer_pdf.domElement = null;
            g_renderer_pdf = null;
            }*/
            var can_dim_arr = p_canvas_size.split(":"); //start ASA-1310 prasanna ASA-1310_25890
            await init_pdf(parseInt(can_dim_arr[0]), parseInt(can_dim_arr[1]), 3 + (enhance == 0.5 ? 0 : 3 * enhance), "N", "Y"); //added clearthree function in init_pdf so aded await
            //end ASA-1310 prasanna ASA-1310_25890
            try {
                nodataModule = false;
                var k = 0;
                noDataModuleWIdth = 0;
                var prevModule = "-1";
                if (!modules.Module.includes(g_nodataModuleName)) {
                    var moduleX = new_pogjson[p_pog_index].ModuleInfo[i].W;
                    for (var mod of new_pogjson[p_pog_index].ModuleInfo) {
                        prevModule = modules.Module;
                        if (k > i) {
                            if (nvl(mod.ParentModule) == 0 && mod.Module.includes(g_nodataModuleName)) {
                                var module = g_world.getObjectById(mod.MObjID);
                                var moduleY = mod.H / 2 + g_pog_json[p_pog_index].BaseH;
                                noDataModuleWIdth = noDataModuleWIdth + mod.W + 0.01;
                                moduleX = moduleX + mod.W / 2 + 0.01;
                                var new_module = module.clone(true);
                                new_module.material = module.material.clone(true);
                                g_scene_pdf.add(new_module);
                                new_module.position.set(moduleX, moduleY, 0);
                                moduleX = moduleX + mod.W / 2;
                                g_scene_pdf.updateMatrixWorld();
                            }
                        }
                        k++;
                    }
                }
                //this function will create the object for one module at a time in g_new_canvas, which is hidden and will not show to the
                //user. we take screen shot of this canvas in a loop and add in array.
                var return_val = await create_scene(i, p_new_item_label, p_show_item_desc, mod_count, p_loaded_live_img, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, noDataModuleWIdth, p_pog_index); //ASA-1870
            } catch (err) {
                error_handling(err);
            }
            var details = get_min_max_xy_module(modules, i, modules.W + noDataModuleWIdth, modules.H, modules.X + noDataModuleWIdth, new_pogjson[p_pog_index].W, mod_count);
            var details_arr = details.split("###");
            var [cameraz, new_y] = set_camera_z_offside(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, 0, parseFloat(details_arr[5]), true, p_pog_index);
            g_camera_pdf.position.x = parseFloat(details_arr[2]);
            g_camera_pdf.position.y = parseFloat(details_arr[3]);
            g_camera_pdf.position.z = cameraz; //ASA-1370  isssue 2 + g_offset_z
            if (g_renderer_pdf !== null) {
                animate_pog_pdf();
                g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
            }

            base64 = "";
            //g_nodataModuleName will have few module names. that do not be printed in PDF. so we avoid that.
            if (!modules.Module.includes(g_nodataModuleName)) {
                var dataURL = await g_new_canvas.toDataURL("image/jpeg", enhance);
                var img_details = {};
                img_details["Module"] = modules.Module;
                img_details["MIndex"] = i;
                img_details["Bay"] = (modules.W * 100).toFixed(2);
                img_details["TotalBay"] = (modules.H * 100).toFixed(2) + "*" + (modules.W * 100).toFixed(2);
                img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
                img_arr.push(img_details);
            }
        }
        i++;
    }

    //ASA-1627 Start
    /*
        Added a for loop because we need to remove the whitespace from each screenshot of an module.
        Except removing of whitespace all code is existing which is written under if block(if(imgCount == img_arr.length))
     */
    var imgCount = 0;
    for (const mod_img of img_arr) {
        const webglImage = "data:image/jpeg;base64," + mod_img.ImgData;
        console.log(webglImage);
        const img = new Image();
        img.src = webglImage;
        // img.onload = async function () { //ASA-1710
        await new Promise(
            (resolve) =>
            (img.onload = async function () {
                const canvas2D = document.createElement("canvas");
                canvas2D.width = img.width;
                canvas2D.height = img.height;
                const ctx2D = canvas2D.getContext("2d");
                ctx2D.drawImage(img, 0, 0);
                //ASA-1787, added combine_details[4] == "Y", crop_img_ind
                if (combine_details[4] == "Y") {
                    var [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D); //ASA-1820
                    new_pogjson[p_pog_index].ModuleInfo[mod_img.MIndex].ScaleToFit = scaleToFit; //ASA-1820
                    if (imgCount == 0) {
                        if (scaleToFit == "Y") {
                            new_pogjson[p_pog_index].PageBreakInit = "Y"; //ASA-1820
                        } else {
                            new_pogjson[p_pog_index].PageBreakInit = "N"; //ASA-1820
                        }
                    }
                    var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
                } else {
                    var [cropCanvas, scaleToFit] = cropCanvasToContent(canvas2D); //ASA-1831
                    new_pogjson[p_pog_index].ModuleInfo[mod_img.MIndex].ScaleToFit = scaleToFit; //ASA-1831
                    var croppedCanvas = cropCanvasToContent_old(canvas2D);
                    var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
                }
                img_arr[imgCount].ImgData = croppedDataURL.match(/,(.*)$/)[1];
                imgCount++;
                if (imgCount == img_arr.length) {
                    if (img_arr.length > 0) {
                        //to send module image first and then combine so the array length is less. //ASA-1366
                        await send_to_db(g_pog_json[p_pog_index].POGCode, img_arr); //ASA -1374 passing hardcode index to pog and mulitple pog not getting the image of module g_pog_json[0] -->g_pog_json[p_pog_index]
                        img_arr = [];
                    }

                    for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
                        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                            for (const shelfs of modules.ShelfInfo) {
                                if (shelfs.ObjType == "TEXTBOX") {
                                    var shelf = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                                    if (typeof shelf !== "undefined") {
                                        shelf.material.transparent = true;
                                    }
                                }
                            }
                        }
                    }
                    g_pog_json = updateOrgPOGJSON; //ASA-1235 ASA-1300 this was inside the dowload pdf before recreate, but which was taken before recreate inside combine. so added before.
                    var combine_img = [];
                    if (combine_details[3] == "Y") {
                        //ASA-1730 Start
                        // var totMod = g_pog_json[p_pog_index].ModuleInfo.length;
                        var totMod = 0;
                        for (const module of g_pog_json[p_pog_index].ModuleInfo) {
                            if (typeof module.ParentModule == "undefined" || module.ParentModule == null) {
                                totMod++;
                            }
                        }
                        //ASA-1730 End
                        var bayCount = 0;
                        if (totMod <= 5) {
                            bayCount = totMod;
                        } else {
                            bayCount = parseInt(totMod / 2);
                        }
                        combine_img = await create_combine_pog(bayCount, g_show_live_image, "N", p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, parseFloat(p_pegb_dft_horiz_spacing), parseFloat(p_pegboard_dft_vert_spacing), parseFloat(p_basket_dft_wall_thickness), parseFloat(p_chest_wall_thickness), p_pegb_max_arrange, p_default_wrap_text, parseInt(p_cr_default_text_size), p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pogcrItemLabelPosition, p_NotchHead, p_default_basket_fill, p_default_basket_spread, p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr, combine_details[3]); //ASA-1331 kush fix
                        for (const obj of combine_img) {
                            img_arr.push(obj);
                        }
                        // animate_pog_pdf();
                        // render(p_pog_index);
                    } //ASA-1640
                    //below logic is specifically for PNSHK. where we combine multiple modules based on the setup in sm_pog_pdf_template and take screen shots
                    //and place in the PDF before report of item details.
                    else if (combine_details[0] == "Y") {
                        if (combine_details[1] == "Y") {
                            combine_img = await create_combine_pog(p_bay_live_image, "Y", "N", p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, parseFloat(p_pegb_dft_horiz_spacing), parseFloat(p_pegboard_dft_vert_spacing), parseFloat(p_basket_dft_wall_thickness), parseFloat(p_chest_wall_thickness), p_pegb_max_arrange, p_default_wrap_text, parseInt(p_cr_default_text_size), p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pogcrItemLabelPosition, p_NotchHead, p_default_basket_fill, p_default_basket_spread, p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr); //ASA-1331 kush fix
                            for (const obj of combine_img) {
                                img_arr.push(obj);
                            }
                        }
                        if (combine_details[2] !== "N") {
                            //ASA-1366
                            combine_img = await create_combine_pog(p_bay_without_live_image, "N", combine_details[2], p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, parseFloat(p_pegb_dft_horiz_spacing), parseFloat(p_pegboard_dft_vert_spacing), parseFloat(p_basket_dft_wall_thickness), parseFloat(p_chest_wall_thickness), p_pegb_max_arrange, p_default_wrap_text, parseInt(p_cr_default_text_size), p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pogcrItemLabelPosition, p_NotchHead, p_default_basket_fill, p_default_basket_spread, p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr); //ASA-1331 kush fix
                            for (const obj of combine_img) {
                                img_arr.push(obj);
                            }
                            p_loaded_live_img = "N";
                            p_item_desc = "N";
                        }
                        // animate_pog_pdf();
                        // render(p_pog_index);
                    } else {
                        var main_canvas;
                        main_canvas = await get_full_canvas(p_pog_index, 3);
                        var dataURL = main_canvas.toDataURL("image/jpeg", 0.9);
                        var img_details = {};
                        img_details["Module"] = "POG";
                        img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
                        img_arr.push(img_details);
                    }
                    //ASA-1640 #8 Start
                    imgCount = 0;
                    for (const mod_img of img_arr) {
                        const webglImage = "data:image/jpeg;base64," + mod_img.ImgData;
                        console.log(webglImage);
                        const img = new Image();
                        img.src = webglImage;
                        img.onload = async function () {
                            const canvas2D = document.createElement("canvas");
                            canvas2D.width = img.width;
                            canvas2D.height = img.height;
                            const ctx2D = canvas2D.getContext("2d");
                            ctx2D.drawImage(img, 0, 0);

                            //ASA-1787, added combine_details[4] == "Y", crop_img_ind
                            if (combine_details[3] == "Y") {
                                if (combine_details[4] == "Y") {
                                    var [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D); //ASA-1820
                                    var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
                                } else {
                                    var croppedCanvas = cropCanvasToContent_old(canvas2D);
                                    var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
                                }
                            } else {
                                var croppedCanvas = cropCanvasToContent_old(canvas2D); //ASA-1831 To run cropCanvasToContent_old when combine_details[3] = N
                                croppedDataURL = canvas2D.toDataURL("image/jpeg", enhance);
                            } //ASA-1640 #8
                            img_arr[imgCount].ImgData = croppedDataURL.match(/,(.*)$/)[1];
                            imgCount++;
                            if (imgCount == img_arr.length) {
                                if (combine_details[3] == "Y" || combine_details[0] == "Y") {
                                    animate_pog_pdf();
                                    render(p_pog_index);
                                }
                                var return_val = await send_to_db(new_pogjson[p_pog_index].POGCode, img_arr);
                                if (p_bulk_pdf_request == "N") {
                                    await uploadImage(0);
                                }
                                else {
                                    set_pegid(new_pogjson, p_pog_index);
                                }
                                await create_item_compare(p_pog_details.POGCode, p_pog_details.POGVersion);

                                var p_pog_version = "";
                                p_pog_version = new_pogjson[p_pog_index].Version;
                                if (p_bulk_pdf_request == "Y") {
                                    //calling PDF creation function
                                    var p = apex.server.process(
                                        "DOWNLOAD_PDF", {
                                        x01: p_pog_details.SeqNo,
                                        x02: p_pog_details.POGCode,
                                        x03: p_pog_details.POGVersion,
                                        x04: p_pog_details.Selection_Type,
                                        x05: p_pog_details.Print_Type,
                                        x06: p_pog_details.TemplateId,
                                        x07: p_pog_details.SequenceId,
                                        x08: 'Y', //save_pog_pdf
                                        x09: '', // pog_module
                                        p_clob_01: JSON.stringify(new_pogjson),
                                    }, {
                                        dataType: "html",
                                    });
                                    p.done(function (data) {
                                        console.log(' download_pdf end', getDateTime());
                                        g_req_count++;
                                        removeLoadingIndicator(regionloadWait);
                                        return "success";
                                    });
                                    console.log('after download pdf');
                                }
                                else {
                                    //calling PDF creation function
                                    var p = apex.server.process(
                                        "DOWNLOAD_PDF",
                                        {
                                            x01: p_pog_details.SeqNo,
                                            x02: new_pogjson[p_pog_index].POGCode,
                                            x03: p_pog_version,
                                            x04: p_pog_details.Selection_Type,
                                            x05: "P",
                                            x06: p_pog_details.TemplateId,
                                            x07: p_workflowSave == "Y" ? p_draftSeqID : "",
                                            x08: p_save_pdf,
                                            x09: p_draftPogInd, // ASA-1444
                                            x10: $v("P25_EXISTING_DRAFT_VER"), //ASA-1444
                                            x11: $v("P25_DEFAULT_LIVE_VERSION"), //ASA-1677 #4
                                            x12: $v("P25_PREV_PDF_POG_VERSION"), //ASA-1677 #4
                                            p_clob_01: JSON.stringify(new_pogjson[p_pog_index]),
                                        },
                                        {
                                            dataType: "html",
                                        }
                                    );
                                    p.done(function (data) {
                                        //we on few labels in the WPD pog for the setup done in sm_pog_pdf_template to get the image of Module wise image.
                                        //we need to reset all the labels bask to the original that was before creating PDF.
                                        p_fixel_label == "Y" ? (g_show_fixel_label = "Y") : (g_show_fixel_label = "N");
                                        p_item_label == "Y" ? (g_show_item_label = "Y") : (g_show_item_label = "N");
                                        p_notch_label == "Y" ? (g_show_notch_label = "Y") : (g_show_notch_label = "N");
                                        p_item_desc == "Y" ? (g_show_item_desc = "Y") : (g_show_item_desc = "N");
                                        if (p_pog_version === undefined || p_pog_version === null) {
                                            //ASA-1813
                                            p_pog_version = "";
                                        }

                                        var l_url = "f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=OPEN_PDF:NO::AI_RANDOM_STRING,P25_OPEN_POG_CODE,P25_OPEN_POG_VERSION:" + new Date().getTime() + "," + new_pogjson[p_pog_index].POGCode + "," + p_pog_version; //ASA-1553
                                        try {
                                            if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function") {
                                                removeLoadingIndicator(regionloadWait);
                                            }
                                        } catch {
                                            console.log("no loading");
                                        }

                                        logDebug("function : Download PDF", "E");
                                        if (g_all_pog_flag == "N") {
                                            window.open(l_url, "new data");
                                        }

                                        async function do_something() {
                                            if (p_old_live_iamge == "N" && p_loaded_live_img == "Y" && p_generateLiveImg != "N") {
                                                var return_val = await recreate_image_items("N", p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrDescListArr, p_DelistDftColor, p_NotchHead, p_pog_index, g_show_days_of_supply, "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST') //ASA-1608 added g_show_days_of_supply, before "N"
                                            } else if (p_old_live_iamge == "Y" && p_loaded_live_img == "N" && p_generateLiveImg != "N") {
                                                var return_val = await recreate_image_items("Y", p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrDescListArr, p_DelistDftColor, p_NotchHead, p_pog_index, g_show_days_of_supply, "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST') //ASA-1608 added g_show_days_of_supply, before "N"
                                            }
                                            if (p_show_item_desc == "Y" && p_item_desc == "N") {
                                                var res = await showHideItemDescription("N", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
                                            } else if (p_show_item_desc == "N" && p_item_desc == "Y") {
                                                var res = await showHideItemDescription("Y", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
                                            }
                                            if (g_show_notch_label == "Y") {
                                                await show_notch_labels("Y", p_NotchHead, "Y", p_pog_index);
                                            } else {
                                                await show_notch_labels("N", p_NotchHead, "Y", p_pog_index);
                                            }
                                            if (g_show_fixel_label == "Y") {
                                                await show_fixel_labels("Y", p_pog_index);
                                            } else {
                                                await show_fixel_labels("N", p_pog_index);
                                            }
                                            if (g_show_item_label == "Y") {
                                                await show_item_labels("Y", p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index);
                                            } else {
                                                await show_item_labels("N", p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index);
                                            }
                                            await showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index); //ASA-1182
                                        }
                                        do_something();
                                    });
                                }
                            }
                        };
                    }
                }
                resolve(); //ASA-1710
            })
        );
    }
    //ASA-1627 End

    logDebug("function : set_scene", "E");
}

//Replace this with new dynamic (cropCanvasToContent) once enhanced for all bu's 
//ASA-1870, Moved from page_25_wpd_1.js to main.js
function cropCanvasToContent_old(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let cropTop = null, cropBottom = null, cropLeft = null, cropRight = null;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            // ASA-1706, if (data[index] < 250 || data[index + 1] < 250 || data[index + 2] < 250) {
            if (data[index] !== 255 && data[index + 1] !== 255 && data[index + 2] !== 255) {
                if (cropTop === null) cropTop = y;
                cropBottom = y;
                if (cropLeft === null || x < cropLeft) cropLeft = x;
                if (cropRight === null || x > cropRight) cropRight = x;
            }
        }
    }

    if (cropTop === null) return canvas;

    //ASA-1925 Calculate content dimensions
    const contentWidth = cropRight - cropLeft + 1;

    var croppedWidth = cropRight - cropLeft + 40; //ASA-1706, 80
    var croppedHeight = cropBottom - cropTop + 40;
    var cropWidthDiff = width - croppedWidth;
    var cropHeightDiff = height - croppedHeight;

    const croppedCanvas = document.createElement("canvas");

    //ASA-1706
    if (cropWidthDiff >= cropHeightDiff) {
        cropWidthDiff = width - cropHeightDiff;
        croppedWidth = cropWidthDiff;
        croppedCanvas.width = cropWidthDiff;
        croppedCanvas.height = croppedHeight;
    } else {
        cropHeightDiff = height - cropWidthDiff;
        croppedHeight = cropHeightDiff;
        croppedWidth = cropRight + 40;   //ASA-1730
        croppedCanvas.width = croppedWidth;
        croppedCanvas.height = cropHeightDiff;
    }
    // croppedCanvas.width = croppedWidth; //ASA-1706
    // croppedCanvas.height = croppedHeight;//ASA-1706
    const centerX = (croppedCanvas.width - contentWidth) / 2; //ASA-1925
    const croppedCtx = croppedCanvas.getContext("2d");
    croppedCtx.fillStyle = "white";
    croppedCtx.fillRect(0, 0, croppedWidth, croppedHeight);
    // croppedCtx.drawImage(canvas, cropLeft, cropTop, croppedWidth, croppedHeight, 40, 20, croppedWidth, croppedHeight); //ASA-1706
    // croppedCtx.drawImage(canvas, cropLeft, cropTop, croppedWidth, croppedHeight, cropLeft - 40, 20, croppedWidth, croppedHeight);//ASA-1706 //ASA-1730
    // croppedCtx.drawImage(canvas, cropLeft, cropTop, croppedWidth, croppedHeight, cropLeft - 40, (cropTop - 40 < 0 ? 20 : cropTop - 40), croppedWidth, croppedHeight);//ASA-1706 //ASA-1730
    croppedCtx.drawImage(canvas, cropLeft, cropTop, croppedWidth, croppedHeight, centerX, 40, croppedWidth, croppedHeight);//ASA-1706 //ASA-1730 Issue 1 //ASA-1925
    return croppedCanvas;
}

//ASA-1787, Modfied primary logic to centre the image and maintain aspect raio
//ASA-1870, Moved from page_25_wpd_1.js to main.js
function cropCanvasToContent(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let cropTop = null,
        cropBottom = null,
        cropLeft = null,
        cropRight = null;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            // Only exclude pure white
            if (data[index] !== 255 || data[index + 1] !== 255 || data[index + 2] !== 255) {
                if (cropTop === null) cropTop = y;
                cropBottom = y;
                if (cropLeft === null || x < cropLeft) cropLeft = x;
                if (cropRight === null || x > cropRight) cropRight = x;
            }
        }
    }

    if (cropTop === null) return canvas; // all white

    const contentWidth = cropRight - cropLeft + 1;
    const contentHeight = cropBottom - cropTop + 1;

    const scaleToFit = parseFloat((contentHeight / contentWidth).toFixed(1)) >= 1.2 ? 'Y' : 'N'; //ASA-1820
    let finalWidth = contentWidth;
    let finalHeight = contentHeight;

    // Adjust to maintain original aspect ratio
    // const contentAspect = contentWidth / contentHeight;

    // if (contentAspect > originalAspect) {
    // 	// Too wide, add vertical padding
    // 	finalHeight = Math.round(contentWidth / originalAspect);
    // } else if (contentAspect < originalAspect) {
    // 	// Too tall, add horizontal padding
    // 	finalWidth = Math.round(contentHeight * originalAspect);
    // }

    const offsetX = Math.floor((finalWidth - contentWidth) / 2);
    const offsetY = Math.floor((finalHeight - contentHeight) / 2);

    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = finalWidth;
    resultCanvas.height = finalHeight;

    const resultCtx = resultCanvas.getContext("2d");
    resultCtx.fillStyle = "white";
    resultCtx.fillRect(0, 0, finalWidth, finalHeight);

    resultCtx.drawImage(canvas, cropLeft, cropTop, contentWidth, contentHeight, offsetX, offsetY, contentWidth, contentHeight);

    return [resultCanvas, scaleToFit];
}



async function create_combine_pog(p_BayCount, p_showLiveImg, p_Desc, p_Vdate, p_PogDftColor, p_ModDftColor, p_DftSpreadProduct, p_DftHorizSpac, p_DftVertSpac, p_BskWallThick, p_ChestWallThick, p_PegItemAutoPlace, p_DftWrapText, p_TextDftSize, p_TextDftColor, p_ShelfDftColor, p_DivColor, p_SlotDivider, p_SlotOrient, p_DivFixed, p_ItemDftColor, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_DispItemInfo, p_ItemNumLblPos, p_NotchHead, p_DftBskFill, p_DftBaskSprd, p_pog_index, p_pdfnotchlabel, p_PdfFixelLabel, p_PdfItemLabel, p_enhance, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_split_ind = "N" /*ASA-1640*/) {
    try {
        var old_live_image = g_show_live_image;
        var old_item_desc = g_show_item_desc;
        var mod_array = [];
        var z = 0;
        var next_mod = 0;
        var mod_width = 0;
        var base_width = 0;
        var img_arr = [];
        var total_width = 0;
        var total_height = 0;
        var total_depth = 0;
        var bay = "";
        var total_mod_cnt = 0;
        var count = 0;
        if (p_Desc == "Y" || p_Desc == "IDVURPCO" || p_Desc == "IFEC") {
            await recreate_image_items("N", p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_ItemNumLblPos, p_DispItemInfo, p_DelistDftColor, p_NotchHead, p_pog_index, "N", "N,0.018", []);
            var res = await showHideItemDescription("Y", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
            render(p_pog_index);
        } else if (g_show_live_image == "N" && p_showLiveImg == "Y") {
            await recreate_image_items("Y", p_MerchStyle, p_LoadImgFrom, p_Buid, p_ItemNumLblColor, p_ItemNumLblPos, p_DispItemInfo, p_DelistDftColor, p_NotchHead, p_pog_index, "N", "N,0.018", []);
        }
        g_world = g_scene_objects[p_pog_index].scene.children[2];
        animate_pog(p_pog_index);
        var updatePogjson = JSON.parse(JSON.stringify(g_pog_json)); //ASA-1235
        var old_pogjson = JSON.parse(JSON.stringify(g_pog_json));
        var new_pogjson = JSON.parse(JSON.stringify([g_pog_json[p_pog_index]]));
        console.log("old_pogjson[0].ModuleInfo", old_pogjson[0].ModuleInfo);

        if (p_showLiveImg == "Y") {
            g_show_live_image = "Y";
            g_show_item_desc = "N";
        } else if (p_Desc == "Y" || p_Desc == "IDVURPCO" || p_Desc == "IFEC") {
            if (p_Desc == "IDVURPCO" || p_Desc == "IFEC") {
                g_temp_desc = p_Desc;
            } else {
                g_temp_desc = "N";
            }
            g_show_live_image = "N";
            g_show_item_desc = "Y";
        }
        if (p_pdfnotchlabel == "Y") {
            g_show_notch_label = "Y";
        } else {
            g_show_notch_label = "N";
        }
        if (p_PdfFixelLabel == "Y") {
            g_show_fixel_label = "Y";
        } else {
            g_show_fixel_label = "N";
        }
        if (p_PdfItemLabel == "Y") {
            g_show_item_label = "Y";
        } else {
            g_show_item_label = "N";
        }

        //ASA-1235 START
        var pogChests = [];
        var mIndex = 0;
        for (const modules of old_pogjson[p_pog_index].ModuleInfo) {
            //ASA-1331 KUSH fix
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                total_mod_cnt++;
                total_width = total_width + modules.W;
                total_height = Math.max(total_height, modules.H);
                total_depth = Math.max(total_depth, modules.D);

                if (g_pogcr_pdf_chest_split == "Y") {
                    var sIndex = 0;
                    var moduleStart = wpdSetFixed(modules.X - modules.W / 2); //.toFixed(4));
                    var moduleEnd = wpdSetFixed(modules.X + modules.W / 2); //.toFixed(4));
                    for (const shelf of modules.ShelfInfo) {
                        if (shelf.ObjType == "CHEST") {
                            var shelfStart = wpdSetFixed(shelf.X - shelf.W / 2); //.toFixed(4));
                            var shelfEnd = wpdSetFixed(shelf.X + shelf.W / 2); //.toFixed(4));
                            if ((moduleStart > shelfStart && moduleEnd < shelfEnd) || (moduleStart >= shelfStart && moduleEnd < shelfEnd) || (moduleStart < shelfStart && moduleEnd < shelfEnd && moduleEnd > shelfStart) || (moduleStart > shelfStart && moduleEnd > shelfEnd && moduleStart < shelfEnd)) {
                                //Regression-10 issue for chest pdf, added =
                                shelf.MIndex = mIndex;
                                shelf.SIndex = sIndex;
                                pogChests.push(shelf);
                                new_pogjson[0].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1);
                                g_pog_json[p_pog_index].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1); //ASA-1306
                            }
                        }
                        sIndex++;
                    }
                }
            }
            mIndex++;
        }

        if (g_pogcr_pdf_chest_split == "Y") {
            var ci = 0; //ASA-1314
            for (chest of pogChests) {
                var chest_insert = "N"; //ASA-1306
                // update old_pogjson modules with individual chest and updated item info
                var chestStart = wpdSetFixed(chest.X - chest.W / 2); //.toFixed(4));
                var chestEnd = wpdSetFixed(chest.X + chest.W / 2); //.toFixed(4));
                var chestItems = chest.ItemInfo;
                var mi = 0;
                for (const modules of new_pogjson[0].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var mStart = wpdSetFixed(modules.X - modules.W / 2); //.toFixed(4));
                        var mEnd = wpdSetFixed(modules.X + modules.W / 2); //.toFixed(4));
                        var newChest = JSON.parse(JSON.stringify(chest));

                        if (mStart >= chestStart && mEnd <= chestEnd) {
                            //Regression-10 issue for chest pdf, added =
                            chest_insert = "Y"; //ASA-1306
                            newChest.W = modules.W;
                            newChest.X = modules.X;
                        } else if (mStart <= chestStart && mEnd <= chestEnd && mEnd > chestStart) {
                            //ASA-1351 issue 5
                            chest_insert = "Y"; //ASA-1306
                            newChest.W = wpdSetFixed(mEnd - chestStart); //.toFixed(4));
                            newChest.X = wpdSetFixed(chestStart + newChest.W / 2); //.toFixed(4));
                        } else if (mStart >= chestStart && mEnd >= chestEnd && mStart < chestEnd) {
                            //ASA-1351 issue 5
                            chest_insert = "Y"; //ASA-1306
                            newChest.W = wpdSetFixed(chestEnd - mStart); //.toFixed(4));
                            newChest.X = wpdSetFixed(mStart + newChest.W / 2); //.toFixed(4));
                        }
                        var newChestItems = [];
                        var newChestStart = wpdSetFixed(newChest.X - newChest.W / 2); //.toFixed(4));
                        var newChestEnd = wpdSetFixed(newChest.X + newChest.W / 2); //.toFixed(4));
                        module_no = chest.MIndex + 1; //ASA-1314 it was using mi before
                        for (items of chestItems) {
                            if (items.X >= newChestStart && items.X <= newChestEnd) {
                                items.ModuleNo = module_no; //ASA-1314
                                newChestItems.push(items);
                            }
                        }
                        if (chest_insert == "Y") {
                            //ASA-1306
                            newChest.ItemInfo = newChestItems;
                            new_pogjson[0].ModuleInfo[mi].ShelfInfo.push(newChest);
                            g_pog_json[p_pog_index].ModuleInfo[mi].ShelfInfo.push(newChest); //ASA-1306
                            chest_insert = "N";
                        }
                    }
                    mi++;
                }
                ci++;
            }
        }
        //ASA-1235 END
        var total_mod_dis = 0;
        var z = 0;
        var q = 0;
        var bay_cnt = 0;
        for (const modules of new_pogjson[0].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                modules.MIndex = z;
                mod_array.push(JSON.parse(JSON.stringify(modules)));
                next_mod++;
                base_width = base_width + modules.W;

                console.log("next_mod", next_mod, p_BayCount);
                if (next_mod == p_BayCount || total_mod_cnt == q + 1) {
                    //ASA-1730 Issue 1, was z + 1
                    /*if (typeof g_renderer_pdf !== "undefined" && g_renderer_pdf !== null && g_renderer_pdf !== "") {//Bug_26122 pdf error issue
                    g_renderer_pdf.forceContextLoss();
                    g_renderer_pdf.context = null;
                    g_renderer_pdf.domElement = null;
                    g_renderer_pdf = null;
                    }*/
                    bay_cnt++;
                    var mod_ind = 0;
                    var mod_end = 0;
                    await init_pdf(window.innerWidth, window.innerHeight, 2, "Y", "N");
                    for (obj_mod of mod_array) {
                        try {
                            g_world = g_scene_objects[p_pog_index].scene.children[2];
                            console.log("combine loop", g_world);
                            var returnval = await clone_combine_pog(obj_mod.MIndex, mod_ind, g_show_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, mod_end, base_width);
                            console.log("returnval", returnval, g_renderer_pdf);
                        } catch (err) {
                            console.log("error", err);
                            throw err;
                        }
                        mod_end = mod_end + obj_mod.W;
                        //await create_module_from_json_lib(new_pogjson, "T", "F", "N", "N", "Y", "Y", p_Vdate, p_PogDftColor, p_ModDftColor, null, false, "Y", null, p_DftSpreadProduct, p_DftHorizSpac, p_DftVertSpac, p_BskWallThick, p_ChestWallThick, p_PegItemAutoPlace, p_DftWrapText, p_TextDftSize, p_TextDftColor, p_ShelfDftColor, p_DivColor, p_SlotDivider, p_SlotOrient, p_DivFixed, p_ItemDftColor, p_DelistDftColor, g_peg_holes_active, p_ShelfDftColor, 1, p_MerchStyle, p_LoadImgFrom, p_Buid, p_DelistDftColor, p_ItemNumLblColor, p_DispItemInfo, p_ItemNumLblColor, p_ItemNumLblPos, p_NotchHead, "N", p_DftBskFill, p_DftBaskSprd, g_camera, 0, 0);
                        bay = "";

                        mod_ind++;
                    }
                    await timeout(200);

                    for (const mod_dtl of mod_array) {
                        mod_width = mod_width + mod_dtl.W;
                        if (bay == "") {
                            bay = (mod_dtl.W * 100).toFixed(2);
                        } else {
                            bay = bay + "|" + (mod_dtl.W * 100).toFixed(2);
                        }
                    }
                    //ASA-1702
                    // for (const modules of g_pog_json[0].ModuleInfo) {
                    for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                            for (const shelfs of modules.ShelfInfo) {
                                if (shelfs.ObjType == "TEXTBOX") {
                                    var selectedObject = g_world.getObjectById(shelfs.SObjID);
                                    if (typeof selectedObject !== "undefined") {
                                        selectedObject.material.transparent = false;
                                    }
                                }
                            }
                        }
                    }

                    next_mod = 0;
                    var temp_json = [];
                    var details = {};
                    details.W = base_width;
                    details.H = g_pog_json[p_pog_index].H;
                    temp_json.push(details);
                    temp_json[0].ModuleInfo = mod_array;
                    var total_width = 0;
                    if (bay_cnt > 1) {
                        total_width = total_mod_dis;
                    }
                    total_mod_dis = total_mod_dis + base_width;
                    base_width = 0;

                    var details = get_min_max_xy_combine(temp_json, total_width);
                    var details_arr = details.split("###");
                    set_camera_z(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, 0);
                    console.log("combine g_renderer_pdf", g_renderer_pdf, g_scene_pdf, g_camera_pdf);
                    if (g_renderer_pdf !== null) {
                        g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
                    }
                    animate_pog_pdf();
                    console.log("inside", new_pogjson, mod_array, g_camera_pdf, g_scene_pdf.children.length, g_scene_pdf);
                    mod_array = [];
                    var dataURL = g_new_canvas.toDataURL("image/jpeg", p_enhance);
                    console.log(" after  base64 ", getDateTime());
                    var img_details = {};
                    img_details["Module"] = "COMBINE";
                    img_details["Bay"] = bay;
                    bay = "";
                    img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
                    img_arr.push(img_details);

                    if (p_pog_split_ind == "Y" && total_mod_cnt % 2 != 0 && total_mod_cnt <= q + p_BayCount + 2) {
                        //ASA-1730 was z + p_BayCount + 2
                        p_BayCount = p_BayCount + 1;
                    } //ASA-1640
                }
                q++; //ASA-1730
            }
            z++;
        }
        /*if (typeof g_renderer_pdf !== "undefined" && g_renderer_pdf !== null && g_renderer_pdf !== "") {
        g_renderer_pdf.forceContextLoss();
        g_renderer_pdf.context = null;
        g_renderer_pdf.domElement = null;
        g_renderer_pdf = null;
        }*/
        g_temp_desc = "N";
        g_show_live_image = old_live_image;
        g_show_item_desc = old_item_desc;
        g_pog_json = updatePogjson; //ASA-1235
        render(p_pog_index);
        return img_arr;
    } catch (err) {
        console.log("error", err);
        error_handling(err);
        throw err;
    }
}

async function clone_combine_pog(p_module_index, p_run_cnt, p_new_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, p_prev_mod_end, p_base_width) {
    try {
        logDebug("function : create_scene; p_module_index : " + p_module_index + "; new_item_label : " + p_new_item_label, "S");
        if (typeof g_pog_json[p_pog_index].ModuleInfo[p_module_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ParentModule == null) {
            var mod_start = 0;
            if (g_pog_json[p_pog_index].BaseH > 0) {
                var colorValue = parseInt(g_pog_json[p_pog_index].ModuleInfo[p_module_index].Color.replace("#", "0x"), 16);
                var hex_decimal = new THREE.Color(colorValue);
                var POGBase = new THREE.Mesh(
                    new THREE.BoxGeometry(p_base_width, g_pog_json[p_pog_index].BaseH, 0.001),
                    new THREE.MeshStandardMaterial({
                        color: hex_decimal,
                    })
                );
                var l_wireframe_id = add_wireframe(POGBase, 2);
                POGBase.position.x = p_base_width / 2;
                POGBase.position.y = g_pog_json[p_pog_index].BaseH / 2;
                POGBase.position.z = 0;
                g_scene_pdf.add(POGBase);
                var moduleY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H / 2 + g_pog_json[p_pog_index].BaseH;
            } else {
                var moduleY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H / 2;
            }
            if (p_run_cnt == 0) {
                var moduleX = g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2;
            } else {
                var moduleX = p_prev_mod_end + g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2;
            }
            mod_start = moduleX - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2;
            var module = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_index].MObjID);

            var new_module = module.clone(true);
            new_module.material = module.material.clone(true);
            g_scene_pdf.add(new_module);
            new_module.position.set(moduleX, moduleY, 0);
            console.log("module ", new_module, new_module.children);
            for (objects of new_module.children) {
                console.log("objects", objects.uuid, objects.position);
            }
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length > 0) {
                j = 0;
                for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                        var shelf = g_world.getObjectById(shelfs.SObjID);
                        var shelfX = -1;
                        var created_ind = "N";
                        if (shelfs.ObjType == "TEXTBOX") {
                            var new_shelf = new THREE.Mesh(shelf.geometry, shelf.material);
                            new_shelf.material.transparent = false;
                            var l_wireframe_id = add_wireframe(new_shelf, 12);
                            if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                if (shelfs.Slope > 0) {
                                    slope = 0 - shelfs.Slope;
                                } else {
                                    slope = -shelfs.Slope;
                                }

                                new_shelf.rotateY((shelfs.Rotation * Math.PI) / 180);
                                if (shelfs.Rotation == 0) {
                                    new_shelf.rotateX(((slope / 2) * Math.PI) / 180);
                                } else {
                                    new_shelf.rotateX((slope * Math.PI) / 180);
                                }
                            }
                            created_ind = "Y";
                            if (p_module_index > 0) {
                                shelfX = mod_start + (shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2));
                            } else {
                                shelfX = shelfs.X;
                            }
                        } else if (shelfs.ObjType == "CHEST" && g_pogcr_pdf_chest_split == "Y") {
                            var new_shelf = new THREE.Mesh(
                                new THREE.BoxGeometry(shelfs.W, shelfs.H, 0.0001), //shelfs.D),
                                new THREE.MeshStandardMaterial({
                                    color: shelfs.Color,
                                })
                            );
                            var l_wireframe_id = add_wireframe(new_shelf, 2);
                            new_shelf.material = shelf.material.clone(true);

                            // var new_shelf = shelf.clone(true);
                            if (p_module_index > 0) {
                                shelfX = mod_start + (shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2));
                            } else {
                                shelfX = shelfs.X;
                            }
                            created_ind = "Y";
                        } else {
                            var new_shelf = shelf.clone(true);
                            if (p_module_index > 0) {
                                shelfX = mod_start + (shelfs.X - (g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2));
                            } else {
                                shelfX = shelfs.X;
                            }
                            new_shelf.material = shelf.material.clone(true);
                            var l_wireframe_id = add_wireframe(new_shelf, 4);
                            created_ind = "Y";
                        }
                        if (created_ind == "Y") {
                            g_scene_pdf.add(new_shelf);
                            var shelf_start = shelfX - shelfs.W / 2;
                            g_scene_pdf.updateMatrixWorld();

                            var shelfZ = 0;

                            if (shelfs.ObjType == "TEXTBOX") {
                                //shelfZ = g_world.getObjectById(shelfs.SObjID).position.z; //shelfs.Z > 0.0021 ? 0.0021 : shelfs.Z == 0 ? 0.0006 : shelfs.Z;   //ASA-1652 #10 
                                shelfZ = g_world.getObjectById(shelfs.SObjID).position.z + 0.004;; // ASA-1976 Issue 4
                                // shelfZ = 0.006; // ASA-1976 Issue 4
                            } else if (shelfs.ObjType == "PEGBOARD") {
                                shelfZ = 0.003;
                            } else {
                                if (isShelfOnPegboard(shelfs.X, shelfs.Y, p_module_index, p_pog_index, shelfs, g_pog_json)) {
                                    shelfZ = 0.005;
                                } else {
                                    shelfZ = 0.0005;
                                } //ASA - 1544 Issue 2
                            }
                            new_shelf.position.set(shelfX, shelfs.Y, shelfZ);
                            console.log("new_shelf ", shelfs.ObjType, shelfs.Shelf, new_shelf, shelfX, shelfs.Y, shelfZ);
                        }
                        k = 0;
                        update_item_distance(p_module_index, j, p_pog_index, "N"); //Bug-26122 - splitting the chest

                        for (const items of shelfs.ItemInfo) {
                            var item = g_world.getObjectById(items.ObjID);
                            if (typeof item !== "undefined") {
                                var new_item = new THREE.Mesh(item.geometry, item.material);
                                // if (shelfs.SpreadItem == "F" || items.CapStyle !== "0" || show_item_desc == "Y") {
                                for (const objects of item.children) {
                                    if (objects.uuid !== "wireframe") {
                                        var child_item = objects.clone(true);
                                        child_item.uuid = objects.uuid;
                                        var new_z;
                                        if (child_item.uuid == "facings") {
                                            new_z = 0.001;
                                        } else if (child_item.uuid == "cap") {
                                            new_z = new_z - 0.0001;
                                        } else if (child_item.uuid == "ITEM_DESC") {
                                            // new_z = 0.005; //ASA-1729 Issue 7
                                            //new_z = shelfZ +  0.003; //0.0006; //ASA-1729 Issue 7
                                            new_z = shelfZ   // ASA-1976 Issue 4
                                        } else {
                                            new_z = objects.position.z; //ASA-1538    //ASA-1729  //0.009
                                        }
                                        child_item.position.z = new_z;
                                        new_item.add(child_item);
                                    }
                                }
                                // }
                                g_scene_pdf.updateMatrixWorld();
                                new_item.updateMatrixWorld();
                                if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                    var x = items.RotationX;
                                    var y = items.RotationY;
                                    var z = items.RotationZ;
                                    var relativeMeshOffset = new THREE.Vector3(x, y, z);

                                    var offsetPosition = relativeMeshOffset.applyMatrix4(new_shelf.matrixWorld);

                                    new_item.position.x = offsetPosition.x;
                                    new_item.position.y = offsetPosition.y;
                                    new_item.position.z = offsetPosition.z;
                                    new_item.quaternion.copy(new_shelf.quaternion);
                                    new_item.updateMatrix();
                                } else {
                                    if (shelfs.ObjType == "PEGBOARD") {
                                        var new_z = 0.016;
                                    } else {
                                        var new_z = 0.005 + shelfs.D / 1000; //20241014 Reg 9     //0.001
                                    }
                                    var new_x = -1;
                                    if (shelfs.ObjType == "BASKET" && shelfs.BsktSpreadProduct == "BT") {
                                        new_x = shelf_start + items.W / 2;
                                    } else {
                                        new_x = shelf_start + items.Distance + items.W / 2;
                                    }
                                    new_item.position.set(new_x, items.Y, new_z);
                                }
                                g_scene_pdf.add(new_item);
                                var l_wireframe_id = add_wireframe(new_item, 4);
                                add_item_borders(p_module_index, j, k, new_item, items.W, items.H, items.BHoriz, p_pog_index, "N"); //Bug-26122 - splitting the chest
                                if (p_new_item_label == "Y") {
                                    var return_val = update_item_label(p_module_index, j, k, new_item, "Y", p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, "N"); //Bug-26122 - splitting the chest
                                }
                            }
                            k = k + 1;
                        }
                    }
                    j = j + 1;
                }
            }
            if (g_renderer_pdf !== null) {
                animate_pog_pdf();
            }
        }
        logDebug("function : create_scene", "E");
        return "success";
    } catch (err) {
        error_handling(err);
        throw err;
    }
}

function download_pog_pdf(p_pog_code, p_pog_version) {
    logDebug("function : download_pog_pdf", "S");
    try {
        var l_url = "f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=DOWNLOAD_POG_PDF:NO::AI_RANDOM_STRING,AI_POG_CODE,AI_POG_VERSION:" + new Date().getTime() + "," + p_pog_code + "," + p_pog_version;
        const a = document.createElement("a");
        a.href = l_url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        logDebug("function : download_pog_pdf", "E");
    } catch (err) {
        error_handling(err);
        removeLoadingIndicator(regionloadWait);
    }
}


async function get_full_canvas(p_pog_index, p_scale) {
    try {
        var header = document.getElementById("t_Header");
        var top_bar = document.getElementById("top_bar");
        var side_nav = document.getElementById("t_Body_nav");
        var button_cont = document.getElementById("side_bar");
        var devicePixelRatio = window.devicePixelRatio;
        var header_height = header !== null ? header.offsetHeight * devicePixelRatio : 0;
        var top_bar_height = top_bar !== null ? top_bar.offsetHeight * devicePixelRatio : 0;
        var side_nav_width = side_nav !== null ? side_nav.offsetWidth * devicePixelRatio : 0;
        var btn_cont_width = button_cont !== null ? button_cont.offsetWidth * devicePixelRatio : 0;

        var main_canvas = document.createElement("canvas");

        g_windowHeight = window.innerHeight - (header_height + top_bar_height);
        windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);
        main_canvas.width = windowWidth * p_scale;
        main_canvas.height = g_windowHeight * p_scale;

        g_camera = g_scene_objects[p_pog_index].scene.children[0];
        g_scene_objects[p_pog_index].scene.children[0].aspect = main_canvas.width / main_canvas.height;
        g_scene_objects[p_pog_index].scene.children[0].updateProjectionMatrix();
        var details = get_min_max_xy(p_pog_index);
        var details_arr = details.split("###");
        set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);

        var context = main_canvas.getContext("2d");
        context.imageSmoothingEnabled = true; // Enable anti-aliasing
        g_renderer.setPixelRatio(window.devicePixelRatio);
        var canvas_width = main_canvas.width;
        var canvas_height = main_canvas.height;

        g_renderer.setSize(canvas_width, canvas_height);
        g_renderer.render(g_scene_objects[p_pog_index].scene, g_scene_objects[p_pog_index].scene.children[0]);
        context.drawImage(g_renderer.domElement, 0, 0, canvas_width, canvas_height);
        g_scene_objects[p_pog_index].scene.children[0].aspect = g_canvas_objects[p_pog_index].width / g_canvas_objects[p_pog_index].height;
        g_scene_objects[p_pog_index].scene.children[0].updateProjectionMatrix();
        return main_canvas;
    } catch (err) {
        //Start ASA1310_20240307 crush item onload
        error_handling(err);
        throw err;
    }
}
