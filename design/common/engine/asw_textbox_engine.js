
function add_text_box_with_image(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_edit_ind, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_shelf_ind, p_rotation, p_slope, p_recreate, p_fontstyle, p_fontsize, p_fontbold, p_notchHead, p_pog_index) {
    logDebug("function : add_text_box_with_image; uuid : " + p_uuid + "; type : " + p_type + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_edit_ind : " + p_edit_ind + "; mod_index : " + p_mod_index + "; input_text : " + p_input_text + "; color_hex : " + p_color_hex + "; wrap_text : " + p_wrap_text + "; reducetofit : " + p_reducetofit + "; hex_color : " + p_hex_color + "; shelf_ind : " + p_shelf_ind + "; rotation : " + p_rotation + "; slope : " + p_slope + "; recreate : " + p_recreate + "; fontstyle : " + p_fontstyle + "; fontsize : " + p_fontsize + "; fontbold : " + p_fontbold, "S");
    try {
        return new Promise(function (resolve, reject) {
            var shelf_cnt = -1;
            if (p_edit_ind == "Y") {
                var selectedObject = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_ind].SObjID);
                g_world.remove(selectedObject);
                shelf_cnt = p_shelf_ind;
            } else {
                if (p_shelf_ind !== -1) {
                    shelf_cnt = p_shelf_ind;
                } else {
                    shelf_cnt = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
                }
            }
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_cnt];

            // Create an image
            var image = new Image(); // or document.createElement('img' );
            // Create texture
            var tex = new THREE.Texture(image);
            // On image load, update texture
            image.onload = () => {
                tex.needsUpdate = true;
            };
            // Set image source
            image.src = "data:image/png;base64," + shelfdtl.TextImg;
            geometry = new THREE.PlaneGeometry(p_width, p_height);
            var material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: tex,
                transparent: true,
                opacity: 1.0,
            });
            // and finally, the mesh
            var mesh = new THREE.Mesh(geometry, material);

            if (p_rotation !== 0 || p_slope !== 0) {
                g_rotation = p_rotation;
                if (p_slope > 0) {
                    p_slope = 0 - p_slope;
                } else {
                    p_slope = -p_slope;
                }
                g_slope = p_slope;

                mesh.position.x = g_pog_json[p_pog_index].CameraX;
                mesh.position.y = p_y;
                mesh.position.z = p_depth / 2 + g_pog_json[p_pog_index].BackDepth;

                var shelf_info = shelfdtl;
                mesh.FixelID = shelf_info.Shelf;

                mesh.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
                mesh.Version = g_pog_json[p_pog_index].Version; //ASA-1243
                //Start ASA-1305
                mesh.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); //.toFixed(2);
                if (shelf_info.EditNotch == "Y") {
                    mesh.Y = wpdSetFixed(shelf_info.EditNotchY * 100); //.toFixed(2);
                } else {
                    mesh.Y = wpdSetFixed(shelf_info.Y * 100 - (shelf_info.H * 100) / 2); //toFixed(roundNumber(shelf_info.Y * 100 - ((shelf_info.H * 100) / 2), 3));
                }
                mesh.Z = wpdSetFixed(shelf_info.Z * 100); //.toFixed(2);
                //mesh.X = Math.round(shelf_info.X * 100); // ASA-1243 //ASA-1305
                //mesh.Y = Math.round(shelf_info.Y * 100); // ASA-1243 //ASA-1305
                //mesh.Z = Math.round(shelf_info.Z * 100); // ASA-1243 //ASA-1305
                //End ASA-1305

                mesh.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
                mesh.W = shelf_info.W;
                mesh.H = shelf_info.H;
                mesh.D = shelf_info.D;
                mesh.Color = shelf_info.Color;
                mesh.Rotation = p_rotation;
                mesh.ItemSlope = p_slope;
                mesh.Rotation = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
                mesh.ImageExists = "Y";

                mesh.rotateY((p_rotation * Math.PI) / 180);
                if (p_rotation == 0) {
                    mesh.rotateX(((p_slope / 2) * Math.PI) / 180);
                } else {
                    mesh.rotateX((p_slope * Math.PI) / 180);
                }
                g_world.add(mesh);
                mesh.geometry.computeBoundingBox();
                var bounding_box = mesh.geometry.boundingBox;
                var box = new THREE.Box3().setFromObject(mesh);
                var box_dim = box.getSize(new THREE.Vector3());

                shelfdtl.ShelfRotateWidth = parseFloat(box_dim.x);
                shelfdtl.ShelfRotateHeight = parseFloat(box_dim.y);
                shelfdtl.ShelfRotateDepth = parseFloat(box_dim.z);

                if (g_manual_zoom_ind == "N") {
                    var details = get_min_max_xy(p_pog_index);
                    var details_arr = details.split("###");
                    set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
                }
                mesh.position.x = p_x;
                mesh.position.y = p_y;
                mesh.position.z = p_depth / 2 + g_pog_json[p_pog_index].BackDepth;
                if (p_rotation !== 0) {
                    mesh.quaternion.copy(g_camera.quaternion);
                    mesh.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
                }
                mesh.rotateY((p_rotation * Math.PI) / 180);
                if (p_rotation == 0) {
                    mesh.rotateX(((p_slope / 2) * Math.PI) / 180);
                } else {
                    mesh.rotateX((p_slope * Math.PI) / 180);
                }
                mesh.updateMatrix();
            } else {
                mesh.position.x = p_x;
                mesh.position.y = p_y;
                if (p_z == g_pog_json[p_pog_index].BackDepth) {
                    mesh.position.z = 0.001;
                } else {
                    mesh.position.z = p_z > 0.0021 ? 0.0021 : p_z == 0 ? 0.0006 : p_z;
                }
            }
            mesh.uuid = p_uuid;
            mesh.FixelID = shelfdtl.Shelf;
            mesh.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            mesh.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            mesh.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            mesh.X = wpdSetFixed(shelfdtl.X * 100 - (shelfdtl.W * 100) / 2); //.toFixed(2);
            if (shelfdtl.EditNotch == "Y") {
                mesh.Y = wpdSetFixed(shelfdtl.EditNotchY * 100); //.toFixed(2);
            } else {
                mesh.Y = wpdSetFixed(shelfdtl.Y * 100 - (shelfdtl.H * 100) / 2); //toFixed(roundNumber(shelfdtl.Y * 100 - ((shelfdtl.H * 100) / 2), 3));
            }
            mesh.Z = wpdSetFixed(shelfdtl.Z * 100); //.toFixed(2);
            //mesh.X = Math.round(shelfdtl.X * 100); // ASA-1243 //ASA-1305
            //mesh.Y = Math.round(shelfdtl.Y * 100); // ASA-1243 //ASA-1305
            //mesh.Z = Math.round(shelfdtl.Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305

            var l_wireframe_id = add_wireframe(mesh, 1);
            g_world.add(mesh);
            shelfdtl.WFrameID = l_wireframe_id;
            mesh.BorderColour = 0x000000;
            if (g_show_fixel_label == "Y") {
                var hex_color = shelfdtl.Color;
                if (hexToRgb(hex_color) == null) {
                    var red = parseInt("FF", 16);
                    var green = parseInt("FF", 16);
                    var blue = parseInt("FF", 16);
                } else {
                    var red = hexToRgb(hex_color).r;
                    var green = hexToRgb(hex_color).r;
                    var blue = hexToRgb(hex_color).g;
                }

                var text_color = getTextColor(red, green, blue); //ASA-1095
                var return_obj = addlabelText(shelfdtl.Shelf, 10, 0.018, text_color, "center", "");
                mesh.add(return_obj);
                return_obj.position.x = 0 - (shelfdtl.W / 2.4 + 0.01);
                return_obj.position.y = 0;
                return_obj.position.z = 0.005;
                shelfdtl.LObjID = return_obj.id;
            }
            if (g_show_notch_label == "Y") {
                show_notch_labels("Y", p_notchHead, "N", p_pog_index);
            }
            shelfdtl.SObjID = parseInt(mesh.id);
            //ASA-1652 #3 Start
            // if (p_edit_ind == "Y") {
            //     if (typeof shelfdtl.ManualZupdate !== "undefined") {
            //         if (shelfdtl.ManualZupdate == "N") {
            //             var shelfz = get_textbox_z(p_mod_index, shelf_cnt, p_x, p_y, p_width, p_height, p_pog_index);
            //             shelfdtl.Z = shelfz;
            //         }
            //     } else {
            //         var shelfz = get_textbox_z(p_mod_index, shelf_cnt, p_x, p_y, p_width, p_height, p_pog_index);
            //         shelfdtl.Z = shelfz;
            //     }
            // }
            //ASA-1652 #3 End
            resolve(mesh.id);
            logDebug("function : add_text_box_with_image", "E");
        });
    } catch (err) {
        error_handling(err);
    }
}

function get_textbox_z(p_module_index, p_shelf_index, p_x, p_y, p_width, p_height, p_pog_index) {
    logDebug("function : get_textbox_z; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; x : " + p_x + "; y : " + p_y + "; width : " + p_width + "; height : " + p_height, "S");
    var shelf_start = p_x - p_width / 2;
    var shelf_end = p_x + p_width / 2;
    var shelf_top = p_y + p_height / 2;
    var shelf_bottom = p_y - p_height / 2;
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    var obj_hit = "N",
        obj_z = 0;
    var i = 0;

    for (const modules of module_details) {
        if (obj_hit == "Y") {
            break;
        }
        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
            var l_shelf_details = modules.ShelfInfo;
            var j = 0;
            for (const shelfs of l_shelf_details) {
                if (obj_hit == "Y") {
                    break;
                }
                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                    if (shelfs.ItemInfo.length > 0) {
                        var item_Details = shelfs.ItemInfo;
                        var k = 0;
                        for (const items of item_Details) {
                            var div_left = items.X - items.W / 2;
                            var div_right = items.X + items.W / 2;
                            var div_top = items.Y + items.H / 2;
                            var div_bottom = items.Y - items.H / 2;
                            if ((shelf_start >= div_left && shelf_start < div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_end > div_left && shelf_end <= div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_start < div_left && shelf_end > div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top)))) {
                                obj_hit = "Y";
                                obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                                break;
                            } else if ((shelf_start >= div_left && shelf_start && shelf_top > div_top && shelf_bottom < div_bottom) || (shelf_end > div_left && shelf_end <= div_right && shelf_top > div_top && shelf_bottom < div_bottom)) {
                                obj_hit = "Y";
                                obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                                break;
                            }

                            k = k + 1;
                        }
                    } else {
                        var div_left = shelfs.X - shelfs.W / 2;
                        var div_right = shelfs.X + shelfs.W / 2;
                        var div_top = shelfs.Y + shelfs.H / 2;
                        var div_bottom = shelfs.Y - shelfs.H / 2;
                        if ((shelf_start >= div_left && shelf_start < div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_end > div_left && shelf_end <= div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_start < div_left && shelf_end > div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top)))) {
                            obj_hit = "Y";
                            obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                            break;
                        } else if ((shelf_start >= div_left && shelf_start && shelf_top > div_top && shelf_bottom < div_bottom) || (shelf_end > div_left && shelf_end <= div_right && shelf_top > div_top && shelf_bottom < div_bottom)) {
                            obj_hit = "Y";
                            obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                            break;
                        }
                    }
                }
                j = j + 1;
            }
        }
        i = i + 1;
    }

    // if (obj_hit == "N" && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 <= 0) {
    //     obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005 + g_pog_json[p_pog_index].BaseD;
    // } else if (obj_hit == "N") {
    //     obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005;
    // }
    if (obj_hit == "N") {
        var shelfExists = g_pog_json && g_pog_json[p_pog_index] && g_pog_json[p_pog_index].ModuleInfo &&
            g_pog_json[p_pog_index].ModuleInfo[p_module_index] &&
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo &&
            typeof g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index] !== "undefined";
        if (shelfExists) {
            var shelfObj = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
            if (shelfObj.Y - shelfObj.H / 2 <= 0) {
                obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005 + g_pog_json[p_pog_index].BaseD;
            } else {
                obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005;
            }
        } else {
            // fallback when shelf info missing
            obj_z = g_pog_json && g_pog_json[p_pog_index] ? g_pog_json[p_pog_index].BackDepth / 2 + 0.005 : 0.005;
        }
    }
    logDebug("function : get_textbox_z", "E");
    return wpdSetFixed(obj_z); //.toFixed(3));
}

function add_text_box(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_edit_ind, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_shelf_ind, p_rotation, p_slope, p_recreate, p_fontstyle, p_fontsize, p_fontbold, p_enlargeNo, p_pog_index, p_pogcr_enhance_textbox_fontsize = "N", p_text_direction = "H") { //ASA-1797
    logDebug("function : add_text_box; uuid : " + p_uuid + "; type : " + p_type + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_edit_ind : " + p_edit_ind + "; mod_index : " + p_mod_index + "; input_text : " + p_input_text + "; color_hex : " + p_color_hex + "; wrap_text : " + p_wrap_text + "; reducetofit : " + p_reducetofit + "; hex_color : " + p_hex_color + "; shelf_ind : " + p_shelf_ind + "; rotation : " + p_rotation + "; slope : " + p_slope + "; recreate : " + p_recreate + "; fontstyle : " + p_fontstyle + "; fontsize : " + p_fontsize + "; fontbold : " + p_fontbold, "S");
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

        if (p_edit_ind == "Y") {
            // var selectedObject = g_world.getObjectById(g_dblclick_objid);        //ASA-1669
            var selectedObject = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_ind].SObjID); //ASA-1669
            g_world.remove(selectedObject);
            // shelf_cnt = g_shelf_index;   //ASA-1669
            shelf_cnt = p_shelf_ind; //ASA-1669
        } else {
            if (p_shelf_ind !== -1) {
                shelf_cnt = p_shelf_ind;
            } else {
                shelf_cnt = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
            }
        }
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_cnt];

        var text_color = getTextColor(red, green, blue); //ASA-1095
        if (text_color == "#000000") {
            text_color = 0x000000;
        } else {
            text_color = 0xffffff;
        }
        // if (color_hex == null || red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
        // 	text_color = 0x000000;
        // } else {
        // 	text_color = 0xffffff;
        // }
        mesh = dcText(p_input_text, p_fontsize, text_color, p_color_hex, p_width, p_height, p_wrap_text, p_reducetofit, p_fontstyle, p_fontbold, p_fontsize, p_mod_index, shelf_cnt, p_enlargeNo, p_pog_index, p_pogcr_enhance_textbox_fontsize, p_text_direction); //ASA-1797

        if (p_rotation !== 0 || p_slope !== 0) {
            g_rotation = p_rotation;
            if (p_slope > 0) {
                p_slope = 0 - p_slope;
            } else {
                p_slope = -p_slope;
            }
            g_slope = p_slope;

            var l_wireframe_id = add_wireframe(mesh, 1);
            var mod_right = 0;
            var i = 0;
            if (p_recreate == "Y" && p_edit_ind == "N") {
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (modules.ParentModule == null) {
                        mod_right = Math.max(mod_right, parseFloat(modules.X) + modules.W / 2);
                    }
                    i++;
                }
                p_x = mod_right + p_width / 2;
                p_y = g_pog_json[p_pog_index].CameraY;
            }

            mesh.position.x = g_pog_json[p_pog_index].CameraX; //0 - (depth / 2);
            mesh.position.y = p_y;
            mesh.position.z = p_depth / 2 + g_pog_json[p_pog_index].BackDepth;
            mesh.uuid = p_uuid;

            var shelf_info = shelfdtl;
            mesh.FixelID = shelf_info.Shelf;
            mesh.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            mesh.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            mesh.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); //.toFixed(2);
            if (shelf_info.EditNotch == "Y") {
                mesh.Y = wpdSetFixed(shelf_info.EditNotchY * 100); //.toFixed(2);
            } else {
                mesh.Y = wpdSetFixed(shelf_info.Y * 100 - (shelf_info.H * 100) / 2); //toFixed(roundNumber(shelf_info.Y * 100 - ((shelf_info.H * 100) / 2), 3));
            }
            mesh.Z = wpdSetFixed(shelf_info.Z * 100); //.toFixed(2);
            //mesh.X = Math.round(shelf_info.X * 100); // ASA-1243 //ASA-1305
            //mesh.Y = Math.round(shelf_info.Y * 100); // ASA-1243 //ASA-1305
            //mesh.Z = Math.round(shelf_info.Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305
            mesh.NotchNo = shelf_info.NotchNo;
            mesh.Desc = shelf_info.Desc;

            mesh.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            mesh.W = shelf_info.W;
            mesh.H = shelf_info.H;
            mesh.D = shelf_info.D;
            mesh.Color = shelf_info.Color;
            mesh.Rotation = p_rotation;
            mesh.ItemSlope = p_slope;
            mesh.Rotation = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
            mesh.ImageExists = "N";

            mesh.rotateY((p_rotation * Math.PI) / 180);
            if (p_rotation == 0) {
                mesh.rotateX(((p_slope / 2) * Math.PI) / 180);
            } else {
                mesh.rotateX((p_slope * Math.PI) / 180);
            }
            g_world.add(mesh);
            mesh.geometry.computeBoundingBox();
            var bounding_box = mesh.geometry.boundingBox;
            var box = new THREE.Box3().setFromObject(mesh);
            var box_dim = box.getSize(new THREE.Vector3());
            shelfdtl.WFrameID = l_wireframe_id;
            shelfdtl.ShelfRotateWidth = parseFloat(box_dim.x);
            shelfdtl.ShelfRotateHeight = parseFloat(box_dim.y);
            shelfdtl.ShelfRotateDepth = parseFloat(box_dim.z);

            if (g_manual_zoom_ind == "N") {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index /*g_pog_index*/); //ASA-1491 Issue 1
            }
            if (p_recreate == "Y" && p_edit_ind == "N") {
                p_x = mod_right + p_width / 2;
                p_y = g_pog_json[p_pog_index].CameraY;
            }
            mesh.position.x = p_x; //0 - (depth / 2);
            mesh.position.y = p_y;
            mesh.position.z = p_depth / 2 + g_pog_json[p_pog_index].BackDepth;
            if (p_rotation !== 0) {
                mesh.quaternion.copy(g_camera.quaternion);
                mesh.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
            }
            mesh.rotateY((p_rotation * Math.PI) / 180);
            if (p_rotation == 0) {
                mesh.rotateX(((p_slope / 2) * Math.PI) / 180);
            } else {
                mesh.rotateX((p_slope * Math.PI) / 180);
            }
            mesh.updateMatrix();
        } else {
            mesh.position.x = p_x;
            mesh.position.y = p_y;
            if (p_z == g_pog_json[p_pog_index].BackDepth) {
                mesh.position.z = 0.001;
            } else {
                mesh.position.z = p_z > 0.0021 ? 0.0021 : p_z == 0 ? 0.0006 : p_z;
            }

            mesh.FixelID = shelfdtl.Shelf;
            mesh.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            mesh.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            mesh.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            mesh.X = wpdSetFixed(shelfdtl.X * 100 - (shelfdtl.W * 100) / 2); //.toFixed(2);
            if (shelfdtl.EditNotch == "Y") {
                mesh.Y = wpdSetFixed(shelfdtl.EditNotchY * 100); //.toFixed(2);
            } else {
                mesh.Y = wpdSetFixed(shelfdtl.Y * 100 - (shelfdtl.H * 100) / 2); //toFixed(roundNumber(shelfdtl.Y * 100 - ((shelfdtl.H * 100) / 2), 3));
            }
            mesh.Z = wpdSetFixed(shelfdtl.Z * 100); //.toFixed(2);
            //mesh.X = Math.round(shelfdtl.X * 100); // ASA-1243 //ASA-1305
            //mesh.Y = Math.round(shelfdtl.Y * 100); // ASA-1243 //ASA-1305
            //mesh.Z = Math.round(shelfdtl.Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305

            mesh.W = shelfdtl.W;
            mesh.H = shelfdtl.H;
            mesh.D = shelfdtl.D;
            mesh.Color = shelfdtl.Color;
            mesh.Rotation = p_rotation;
            mesh.ItemSlope = p_slope;
            mesh.Rotation = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
            mesh.ImageExists = "N";
            mesh.NotchNo = shelfdtl.NotchNo;
            mesh.Desc = shelfdtl.Desc;

            var l_wireframe_id = add_wireframe(mesh, 1);
            g_world.add(mesh);
            let buffergeometry = new THREE.BufferGeometry().setFromPoints([]);
            var buffermaterial = new THREE.LineBasicMaterial({
                color: 0x000000,
            });
            var line = new THREE.LineSegments(buffergeometry, buffermaterial);
            line.position.z = 0.0006;
            mesh.add(line);
            shelfdtl.WFrameID = l_wireframe_id;
        }

        shelfdtl.SObjID = parseInt(mesh.id);
        //ASA-1652 #3 Start
        // if (p_edit_ind == "Y") {
        //     if (typeof shelfdtl.ManualZupdate !== "undefined") {
        //         if (shelfdtl.ManualZupdate == "N") {
        //             var shelfz = get_textbox_z(p_mod_index, shelf_cnt, p_x, p_y, p_width, p_height, p_pog_index);
        //             shelfdtl.Z = shelfz;
        //         }
        //     } else {
        //         var shelfz = get_textbox_z(p_mod_index, shelf_cnt, p_x, p_y, p_width, p_height, p_pog_index);
        //         shelfdtl.Z = shelfz;
        //     }
        // }
        //ASA-1652 #3 End
        logDebug("function : add_text_box", "E");
        return parseInt(mesh.id);
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1628
function textboxHit(pPogIndex, pModuleIndex, pShelfIndex, pStart, pEnd, pTop, pBottom, pCompareItem = "Y") {
    try {
        var m = 0;
        for (const pogModule of g_pog_json[pPogIndex].ModuleInfo) {
            if (typeof pogModule.ParentModule == "undefined" || pogModule.ParentModule == null) {
                for (textbox of pogModule.ShelfInfo) {
                    if (textbox.ObjType == "TEXTBOX") {
                        var txtStr = wpdSetFixed(textbox.X - textbox.W / 2);
                        var txtEnd = wpdSetFixed(textbox.X + textbox.W / 2);
                        var txtTop = wpdSetFixed(textbox.Y + textbox.H / 2);
                        var txtBtm = wpdSetFixed(textbox.Y - textbox.H / 2);
                        if (!((pStart < txtStr && pEnd < txtStr) || (pStart > txtEnd && pEnd > txtEnd) || (pTop > txtTop && pBottom > txtTop) || (pTop < txtBtm && pBottom < txtBtm))) {
                            return true;
                        }
                    }
                }
                //ASA-1659
                //Check vertical hit with shelf in same module. Need to validate this before as now we are validating all the shelf after the position update
                if (pModuleIndex == m && pCompareItem == "N") {
                    var s = 0;
                    for (shelf of pogModule.ShelfInfo) {
                        if (s !== pShelfIndex && shelf.ObjType !== "BASE" && shelf.ObjType !== "NOTCH" && shelf.ObjType !== "DIVIDER" && shelf.ObjType !== "TEXTBOX") {
                            var shlfTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                            var shlfBtm = wpdSetFixed(shelf.Y - shelf.H / 2);
                            var shlfStr = wpdSetFixed(shelf.X - shelf.W / 2);
                            var shlfEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                            if (!((pTop > shlfTop && pBottom > shlfTop) || (pTop < shlfBtm && pBottom < shlfBtm))) {
                                if ((pStart == shlfStr && pEnd == shlfEnd) || (pStart < shlfStr && pEnd < shlfStr) || (pStart > shlfEnd && pEnd > shlfEnd)) {
                                    return true;
                                }
                            }
                        }
                        s++;
                    }
                }
            }
            m++;
        }
        return false;
    } catch (err) {
        error_handling(err);
    }
}


//ASA-1652 - Start
//ASA-1722 p_overrideZ param added
function textboxPriorityPlacing(p_sel_obj, p_pog_idx, p_manual_upd_val, p_overrideZ = "N", p_dragged = "N") {
    logDebug("function : textboxPriorityPlacing", "S");
    try {
        const selTxtboxStart = wpdSetFixed(p_sel_obj.ShelfInfo.X - p_sel_obj.ShelfInfo.W / 2);
        const selTxtboxEnd = wpdSetFixed(p_sel_obj.ShelfInfo.X + p_sel_obj.ShelfInfo.W / 2);
        const selTxtboxTop = wpdSetFixed(p_sel_obj.ShelfInfo.Y + p_sel_obj.ShelfInfo.H / 2);
        const selTxtboxBottom = wpdSetFixed(p_sel_obj.ShelfInfo.Y - p_sel_obj.ShelfInfo.H / 2);
        var txtBoxInfo = [],
            shelfInfo = [];
        var isShelfHit = "N";
        var finalZ;

        for (const modInfo of g_pog_json[p_pog_idx].ModuleInfo) {
            if (typeof modInfo.ParentModule == "undefined" || modInfo.ParentModule == null) {
                for (const shelf of modInfo.ShelfInfo) {
                    if (shelf.ObjType == "TEXTBOX" && typeof g_world.getObjectById(shelf.SObjID) !== "undefined") {
                        const hitObjStart = wpdSetFixed(shelf.X - shelf.W / 2);
                        const hitObjEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                        const hitObjTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                        const hitObjBottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                        if (selTxtboxStart < hitObjEnd && selTxtboxEnd > hitObjStart && selTxtboxTop > hitObjBottom && selTxtboxBottom < hitObjTop) {
                            txtBoxInfo.push({ shelfInfo: shelf, txtboxZ: shelf.Z, txtboxWorldZ: g_world.getObjectById(shelf.SObjID).position.z });
                        }
                    } else if (shelf.ObjType != "NOTCH") {
                        const hitObjStart = wpdSetFixed(shelf.X - shelf.W / 2);
                        const hitObjEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                        const hitObjTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                        const hitObjBottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                        if (selTxtboxStart < hitObjEnd && selTxtboxEnd > hitObjStart && selTxtboxTop > hitObjBottom && selTxtboxBottom < hitObjTop) {
                            shelfInfo.push({ shelfInfo: shelf, shelfD: shelf.D, shelfZ: shelf.Z });
                            isShelfHit = "Y";
                        } else {
                            for (const item of shelf.ItemInfo) {
                                const hitObjStart = wpdSetFixed(item.X - item.W / 2);
                                const hitObjEnd = wpdSetFixed(item.X + item.W / 2);
                                const hitObjTop = wpdSetFixed(item.Y + item.H / 2);
                                const hitObjBottom = wpdSetFixed(item.Y - item.H / 2);
                                if (selTxtboxStart < hitObjEnd && selTxtboxEnd > hitObjStart && selTxtboxTop > hitObjBottom && selTxtboxBottom < hitObjTop) {
                                    if (nvl(item.ItemID) != 0) {
                                        shelfInfo.push({ shelfInfo: shelf, shelfD: shelf.D, shelfZ: shelf.Z });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        //ASA-1722 Issue 1
        if (isShelfHit == "Y") {
            let filteredTxtBoxInfo = txtBoxInfo.filter((item) => item.shelfInfo.SObjID !== p_sel_obj.id);

            let maxTxtboxZ = filteredTxtBoxInfo.length > 0 ? Math.max(...filteredTxtBoxInfo.map((item) => item.txtboxZ)) : -Infinity;

            let maxShelfValue = shelfInfo.length > 0 ? Math.max(...shelfInfo.map((item) => item.shelfZ + item.shelfD / 2)) : -Infinity;

            if (maxTxtboxZ >= maxShelfValue) {
                isShelfHit = "N";
            } else {
                txtBoxInfo = [];
            }
        }

        if (p_overrideZ == "Y" && isShelfHit == "Y" && p_manual_upd_val != "undefined" && txtBoxInfo.length == 1) {
            //ASA-1722
            const sorto = {
                shelfD: "desc",
            };
            shelfInfo.keySort(sorto);
            const maxD = wpdSetFixed(shelfInfo[0].shelfZ + shelfInfo[0].shelfD / 2); //ASA-1722 Issue 2, shelfInfo[0].shelfD
            if (maxD > p_sel_obj.ShelfInfo.Z) {
                finalZ = 0.001;
            } else {
                finalZ = 0.0021;
            }
            p_sel_obj.position.z = finalZ;
        } else if (p_overrideZ != "Y") {
            if (txtBoxInfo.length > 1 && isShelfHit == "N") {
                const sorto = {
                    txtboxZ: "desc",
                    txtboxWorldZ: "desc",
                };
                txtBoxInfo.keySort(sorto);
                // //ASA-2000.2
                // if (txtBoxInfo[0].shelfInfo.Shelf == p_sel_obj.FixelID) {
                //     const hitObj = g_world.getObjectById(txtBoxInfo[0].shelfInfo.SObjID); //ASA-1804
                //     var maxz = Math.max(...txtBoxInfo.map((item) => item.txtboxWorldZ));
                //     hitObj.position.z = maxz + 0.0001; //ASA-1804
                //     return maxz + 0.0001; //txtBoxInfo[0].txtboxWorldZ;  //ASA-1804 issue 1
                // } //ASA-1722
                //ASA-2000 Issue 15 Start
                if (txtBoxInfo[0].shelfInfo.Shelf == p_sel_obj.FixelID && g_textbox_dragged == "Y") {
                    const hitObj = g_world.getObjectById(p_sel_obj.id); //ASA-1804
                    const maxWorldZ = Math.max(...txtBoxInfo.map(item => item.txtboxWorldZ));
                    const currentLogicalZ = p_sel_obj.ShelfInfo.Z;
                    const belowBoxes = txtBoxInfo.filter(item => item.shelfInfo.SObjID !== p_sel_obj.id).filter(item => item.txtboxZ <= currentLogicalZ);
                    const belowZ = belowBoxes.length ? Math.max(...belowBoxes.map(item => item.txtboxZ)) : currentLogicalZ;
                    p_sel_obj.ShelfInfo.Z = belowZ + 0.01;
                    hitObj.Z = (belowZ + 1) * 100;
                    hitObj.position.z = maxWorldZ + 0.0001; //ASA-1804 issue 1
                    return hitObj.position.z;
                }
                //ASA-2000 Issue 15 End
                var calcZ = txtBoxInfo[0].txtboxWorldZ,
                    prevZ = txtBoxInfo[0].txtboxWorldZ;
                var idx = 0;
                const pogJSONMaxZ = txtBoxInfo[0].txtboxZ;
                for (const txtbox of txtBoxInfo) {
                    const hitObj = g_world.getObjectById(txtbox.shelfInfo.SObjID);
                    //ASA-2000 Issue 3 Start
                    // if (txtbox.shelfInfo.SObjID == p_sel_obj.id && txtbox.shelfInfo.ManualZupdate != "Y") {                       
                    //     hitObj.Z = pogJSONMaxZ * 100 + 1;
                    //     txtbox.shelfInfo.Z = pogJSONMaxZ + 0.01;
                    //     hitObj.position.z = txtBoxInfo[0].txtboxWorldZ + 0.0001; //ASA-1722  0.00001 -> 0.0001
                    //     finalZ = txtBoxInfo[0].txtboxWorldZ + 0.0001; //ASA-1722  0.00001 -> 0.0001
                    //     break;
                    // } 
                    if (txtbox.shelfInfo.SObjID == p_sel_obj.id && txtbox.shelfInfo.ManualZupdate != "Y") {
                        const hitObj = g_world.getObjectById(txtbox.shelfInfo.SObjID);
                        const currentZ = txtbox.shelfInfo.Z;
                        let isIncrement = false;
                        for (const tbox of txtBoxInfo) {
                            if (
                                tbox.shelfInfo.SObjID !== p_sel_obj.id &&
                                tbox.shelfInfo.Z >= currentZ
                            ) {
                                isIncrement = true;
                                break;
                            }
                        }
                        if (!isIncrement) {
                            finalZ = hitObj.position.z;
                            break;
                        }
                        hitObj.Z = pogJSONMaxZ * 100 + 1;
                        txtbox.shelfInfo.Z = pogJSONMaxZ + 0.01;
                        hitObj.position.z = txtBoxInfo[0].txtboxWorldZ + 0.0001;  //ASA-1722  0.00001 -> 0.0001
                        finalZ = hitObj.position.z; //ASA-1722  0.00001 -> 0.0001
                        break;
                    }
                    //ASA-2000 Issue 3 End
                    else if (txtbox.shelfInfo.SObjID == p_sel_obj.id && txtbox.shelfInfo.ManualZupdate == "Y") {
                        hitObj.Z = typeof p_manual_upd_val == "undefined" ? hitObj.Z : p_manual_upd_val * 100;
                        txtbox.shelfInfo.Z = typeof p_manual_upd_val == "undefined" ? txtbox.shelfInfo.Z : p_manual_upd_val;
                        if (shelfInfo.length > 0) {
                            const sorto = {
                                shelfD: "desc",
                            };
                            shelfInfo.keySort(sorto);
                            const maxD = wpdSetFixed(shelfInfo[0].shelfZ + shelfInfo[0].shelfD / 2); //ASA-1722 Issue 2, shelfInfo[0].shelfD
                            if (maxD > p_manual_upd_val) {
                                calcZ = 0.001 + maxD / 1000 - 0.0001; //ASA-1652 #11       //ASA-1722  0.00001 -> 0.0001
                            } else {
                                calcZ = 0.0021;
                            }
                        }
                        hitObj.position.z = calcZ;
                        finalZ = calcZ;
                        var idx1 = 0;
                        for (const txtbox1 of txtBoxInfo) {
                            if (idx1 > idx) {
                                calcZ = calcZ - 0.0001; //ASA-1722  0.00001 -> 0.0001
                                if (g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z > calcZ) {
                                    g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z = calcZ;
                                } else {
                                    calcZ = g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z;
                                } //ASA-1652 #11
                            }
                            idx1++;
                        }
                        break;
                    }
                    idx++;
                }
            }
            else if (typeof p_manual_upd_val != "undefined") {
                if (shelfInfo.length > 0) {
                    const sorto = {
                        shelfD: "desc",
                    };
                    shelfInfo.keySort(sorto);
                    const maxD = wpdSetFixed(shelfInfo[0].shelfZ + shelfInfo[0].shelfD / 2); //ASA-1722 Issue 2, shelfInfo[0].shelfD
                    if (maxD > p_sel_obj.ShelfInfo.Z) {
                        finalZ = 0.001;
                    } else {
                        finalZ = 0.0021;
                    }
                } else {
                    finalZ = 0.001;
                }
                p_sel_obj.position.z = finalZ;
                p_sel_obj.Z = p_manual_upd_val * 100;
                p_sel_obj.ShelfInfo.Z = p_manual_upd_val;
            } else if (shelfInfo.length > 0 && isShelfHit == "N") {
                finalZ = -1;
            } else if (isShelfHit == "Y") {
                const sorto = {
                    shelfD: "desc",
                };
                shelfInfo.keySort(sorto);
                const maxD = wpdSetFixed(shelfInfo[0].shelfZ + shelfInfo[0].shelfD / 2); //ASA-1722 Issue 2, shelfInfo[0].shelfD
                if (p_sel_obj.ShelfInfo.ManualZupdate != "Y") {
                    p_sel_obj.Z = maxD * 100 + 1;
                    p_sel_obj.ShelfInfo.Z = maxD + 0.01;
                    finalZ = 0.0021;
                } else {
                    if (maxD > p_sel_obj.ShelfInfo.Z) {
                        finalZ = 0.001;
                    } else {
                        finalZ = 0.0021;
                    }
                }
                p_sel_obj.position.z = finalZ;
            } else {
                p_sel_obj.Z = 1;
                p_sel_obj.ShelfInfo.Z = 0.01;
                p_sel_obj.position.z = 0.001;
                finalZ = 0.001;
            }
        } else if (p_overrideZ == "Y" && p_sel_obj.ShelfInfo.ManualZupdate == "Y") { //ASA-1804 added else

            if (txtBoxInfo.length > 1 && isShelfHit == "N") {
                const sorto = {
                    txtboxZ: "desc",
                };
                txtBoxInfo.keySort(sorto);
                if (txtBoxInfo[0].shelfInfo.Shelf == p_sel_obj.FixelID) {
                    const hitObj = g_world.getObjectById(txtBoxInfo[0].shelfInfo.SObjID);
                    var maxz = Math.max(...txtBoxInfo.map((item) => item.txtboxWorldZ));
                    hitObj.position.z = maxz + 0.0001;
                    return maxz + 0.0001; //txtBoxInfo[0].txtboxWorldZ; //ASA-1804 issue 1
                }
                var calcZ;
                var idx = 0;
                for (const txtbox of txtBoxInfo) {
                    const hitObj = g_world.getObjectById(txtbox.shelfInfo.SObjID);
                    var maxz = Math.max(...txtBoxInfo.map((item) => (item.txtboxZ * 100)));
                    var gmaxz = Math.max(...txtBoxInfo.map((item) => (item.txtboxWorldZ)));
                    if (txtbox.shelfInfo.SObjID == p_sel_obj.id && txtbox.shelfInfo.ManualZupdate == "Y") {
                        if (shelfInfo.length > 0) {
                            const sorto = {
                                shelfD: "desc",
                            };
                            shelfInfo.keySort(sorto);
                            const maxD = wpdSetFixed(shelfInfo[0].shelfZ + shelfInfo[0].shelfD / 2);
                            if (maxD > txtbox.txtboxZ) {
                                calcZ = 0.001 + maxD / 1000 - 0.0001;
                            } else if (maxz == txtbox.txtboxZ) {
                                calcZ = gmaxz;
                            } else if (maxz > txtbox.txtboxZ) {
                                calcZ = 0.0021 - 0.0001;
                            } else {
                                calcZ = 0.0021;
                            }
                        } else {
                            if (maxz == txtbox.txtboxZ) {
                                calcZ = gmaxz;
                            } else if (maxz > txtbox.txtboxZ) {
                                calcZ = gmaxz - 0.0001;
                            } else {
                                calcZ = 0.0021;
                            }
                        }
                        g_world.getObjectById(txtbox.shelfInfo.SObjID)
                        hitObj.position.z = calcZ;
                        finalZ = calcZ;
                        if (shelfInfo.length > 0) {
                            var idx1 = 0;
                            for (const txtbox1 of txtBoxInfo) {
                                if (idx1 > idx) {
                                    calcZ = calcZ - 0.0001;
                                    if (g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z > calcZ) {
                                        g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z = calcZ;
                                    } else {
                                        calcZ = g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z;
                                    }
                                } else {
                                    if (g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z < calcZ) {
                                        g_world.getObjectById(txtbox1.shelfInfo.SObjID).position.z = 0.0021;
                                    }
                                }
                                idx1++;
                            }
                        }
                        break;
                    }
                    idx++;
                }
            } else if (isShelfHit == "Y") {
                const sorto = {
                    shelfD: "desc",
                };
                shelfInfo.keySort(sorto);
                const maxD = wpdSetFixed(shelfInfo[0].shelfZ + shelfInfo[0].shelfD / 2);
                if (maxD > p_sel_obj.ShelfInfo.Z) {
                    finalZ = 0.001;
                } else {
                    finalZ = 0.0021;
                }
                p_sel_obj.position.z = finalZ;
            }
        } //ASA-1804 end
        return finalZ;
    } catch (err) {
        error_handling(err);
    }
}
