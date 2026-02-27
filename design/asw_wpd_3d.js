// Rotation of the scene is done by rotating the g_world about its
// y-axis.  (I couldn't rotate the camera about the scene since
// the Raycaster wouldn't work with a camera that was a child
// of a rotated object.)

function add_base_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z) {
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

function create_final_module_3d(p_uuid, p_width, p_height, p_depth, p_color, p_y, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_finalX, p_edit_module_index) {
    try {
        return new Promise(function (resolve, reject) {
            g_module = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, p_depth),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );

            if (p_vert_spacing > 0 || p_horz_spacing > 0) {
                var dot_module = add_dots_to_object_3d(p_width - g_json[0].ModuleInfo[p_edit_module_index].NotchW * 2, p_height, p_depth, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, g_module, "MODULE", "", p_edit_module_index);
                dot_module.position.x = p_finalX;
                dot_module.position.y = p_y;
                dot_module.position.z = 0;
                dot_module.uuid = p_uuid;
                if (g_json[0].ModuleInfo[p_edit_module_index].NotchW > 0) {
                    add_notches_3d("MODULE" + p_edit_module_index + "_NOTCHES", g_json[0].ModuleInfo[p_edit_module_index].NotchW, p_height, p_depth, g_json[0].ModuleInfo[p_edit_module_index].NotchStart, g_json[0].ModuleInfo[p_edit_module_index].NotchSpacing, p_color, p_width, p_edit_module_index, dot_module);
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
                if (g_json[0].ModuleInfo[p_edit_module_index].NotchW > 0) {
                    add_notches_3d("MODULE" + p_edit_module_index + "_NOTCHES", g_json[0].ModuleInfo[p_edit_module_index].NotchW, p_height, p_depth, g_json[0].ModuleInfo[p_edit_module_index].NotchStart, g_json[0].ModuleInfo[p_edit_module_index].NotchSpacing, p_color, p_width, p_edit_module_index, g_module);
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

function add_pegboard_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_mod_index) {
    try {
        var shelf_cnt = 0;
        shelf_cnt = parseFloat(g_json[0].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;

        g_pegboard = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, p_depth),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );

        var dot_pegboard = add_dots_to_object_3d(p_width, p_height, p_depth, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, g_pegboard, "PEGBOARD", shelf_cnt, p_mod_index);

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

function dcText(p_text, p_font_size, p_fgcolor, p_bgcolor, p_width, p_height, p_wrap_text, p_reducetofit, p_fontstyle, p_fontbold, p_fontsize) {
    // the routine
    try {
        const [canvasWidth, canvasHeight] = get_visible_size(0.012, p_width, p_height, document.getElementById("scenecanvas"), g_camera);

        var ruler = document.getElementById("ruler");
        ruler.style.fontFamily = p_fontstyle;
        ruler.style.fontWeight = p_fontbold;
        ruler.style.fontSize = p_font_size + "px";
        ruler.style.position = "absolute";
        ruler.innerHTML = p_text;
        var text_width = ruler.offsetWidth + 5;
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

function add_text_box_with_image_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_rotation, p_slope, p_fontstyle, p_fontsize, p_font_bold, p_shelf_cnt) {
    try {
        // Create an image
        var image = new Image(); // or document.createElement('img' );
        // Create texture
        var texture = new THREE.Texture(image);
        // On image load, update texture
        image.onload = () => {
            texture.needsUpdate = true;
        };
        // Set image source
        image.src = "data:image/png;base64," + g_json[0].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_cnt].TextImg;
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
        mesh.position.z = parseFloat(p_z);

        animate_pog(0);
        render();
        return mesh.id;
    } catch (err) {
        error_handling(err);
    }
}

function add_text_box_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_rotation, p_slope, p_fontstyle, p_fontsize, p_fontbold) {
    try {
        console.log('textbox', p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_input_text, p_color_hex, p_wrap_text, p_reducetofit, p_hex_color, p_rotation, p_slope, p_fontstyle, p_fontsize, p_fontbold);
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

        shelf_cnt = parseFloat(g_json[0].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;

        if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
            text_color = 0x000000;
        } else {
            text_color = 0xffffff;
        }
        mesh = dcText(p_input_text, p_fontsize, text_color, p_color_hex, p_width, p_height, p_wrap_text, p_reducetofit, p_fontstyle, p_fontbold, p_fontsize);

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
        mesh.position.z = parseFloat(p_z);
        var l_wireframe_id = add_wireframe_3d(mesh);
        g_world.add(mesh);
        mesh.castShadow = true;
        console.log('mesh', mesh);
        animate_pog(0);
        render();
        return parseInt(mesh.id);
    } catch (err) {
        error_handling(err);
    }
}

function add_rod_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index) {
    try {
        var shelf_cnt;
        var lines_vertices_x = [];
        var lines_vertices_y = [];
        if (typeof g_module_width == "undefined" || g_module_width == "") g_module_width = parseFloat(g_json[0].ModuleInfo[p_mod_index].W);

        shelf_cnt = parseFloat(g_json[0].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;

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

function add_shelf_3d(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_mod_index, p_rotation, p_slope, p_shelf_index) {
    try {
        var shelf_cnt;        
        if (typeof g_module_width == "undefined" || g_module_width == "") g_module_width = parseFloat(g_json[0].ModuleInfo[p_mod_index].W);

        shelf_cnt = parseFloat(g_json[0].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
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
            g_shelf.position.y = p_y + parseFloat(g_json[0].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ShelfRotateHeight) / 2;
        } else if (p_slope > 0) {
            g_shelf.position.y = p_y - parseFloat(g_json[0].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].ShelfRotateHeight) / 2;
        } else {
            g_shelf.position.y = p_y;
        }
        g_shelf.position.z = parseFloat(p_z);
        g_shelf.uuid = p_uuid;
        g_world.add(g_shelf);
        g_shelf.castShadow = true;
        g_shelf.receiveShadow = true;
        render();
        g_json[0].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_index].SObjID = g_shelf.id;
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

async function add_items_with_image_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_horiz_facing, p_vert_facing, p_item_code, p_item_type, p_angle, p_recreate, p_depthfacing, p_highlightItem, p_show_side_image) {
    try {
        console.log('items', p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_horiz_facing, p_vert_facing, p_item_code, p_item_type, p_angle, p_recreate, p_depthfacing, p_highlightItem, p_show_side_image);
        return new Promise(function (resolve, reject) {
            var nesting_val = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].NVal;
            var colorValue = parseInt(p_color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            var rotation = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation;
            var slope = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Slope;
            var item_orientation = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Orientation;
            var details = g_orientation_json[item_orientation];
            var details_arr = details.split("###");
            console.log('details', details);
            var detaillist = get_orientation_list(details_arr[0]);
            var item_info = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
            var object = g_world.getObjectById(item_info.ObjID);
            g_world.remove(object);
            console.log('rotation', rotation, slope);
            var cap_style = item_info.CapStyle;
            var [org_width, org_height, org_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(item_info.Orientation, item_info.OW, item_info.OH, item_info.OD);

            var l_url = "f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=GET_ITEM_IMAGE_FOR_DESIGN:NO::AI_ITEM,AI_IMG_TYPE,AI_RANDOM_STRING:" + p_item_code + "," + p_item_type + "," + new Date().getTime();
            var img_exists = "N",
                img_index = -1,
                img_indexl = -1,
                img_indexr = -1,
                img_indext = -1;
            console.log('g_ItemImages', detaillist);
            var j = 0;
            //ASA-1150
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
            }


            console.log('img_index', img_index, img_exists);
            if (img_exists == "Y") {
                // Create an image
                var image = new Image();
                var imagel = new Image();
                var imager = new Image();
                var imaget = new Image();
                // Create texture
                var texture = new THREE.Texture(image);
                var texturel = new THREE.Texture(imagel);
                var texturer = new THREE.Texture(imager);
                var texturet = new THREE.Texture(imaget);
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

                // Set image source
                image.src = "data:image/png;base64," + g_ItemImages[img_index].ItemImage;

                if (img_indexl != -1) {
                    imagel.src = "data:image/png;base64," + g_ItemImages[img_indexl].ItemImage;
                    console.log('imagel.src', imagel.src);
                }

                if (img_indexr != -1) {
                    imager.src = "data:image/png;base64," + g_ItemImages[img_indexr].ItemImage;
                }
                if (img_indext != -1) {
                    imaget.src = "data:image/png;base64," + g_ItemImages[img_indext].ItemImage;
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
                    console.log('Imager.src is null');
                    var mat3 = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texturet
                    });

                } else {
                    var mat3 = borderMaterial;
                }

                const mat5 = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    map: texture
                });

                if (p_show_side_image == 'Y') {
                    console.log('borderMaterial', borderMaterial);
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

                    var selectedObject = g_world.getObjectById(g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);
                    if (p_recreate == "N") {
                        p_x = 0 - (g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2 - p_width / 2 - g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Distance);
                        p_y = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + p_height / 2;
                        p_z = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 - p_depth / 2;
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
                    console.log('cap_style', cap_style);
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
                        var item_info = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
                        var vert_loop = p_vert_facing + g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount;
                        var vert_start = 0;
                        var item_depth = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OD;
                        var vert_facing_cnt = p_vert_facing;
                        var new_z = p_depth / 2 + 0.0001 * g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount;
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
                                } else {
                                    var calc_height = vert_start + item_depth;
                                    new_y = calc_height - org_height / 2;
                                    vert_start = calc_height;
                                    new_z = new_z - 0.0001;
                                }
                            }

                            for (k = 0; k < p_horiz_facing; k++) {
                                var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);
                                var material = new THREE.MeshBasicMaterial({
                                    map: texture,
                                    transparent: true,
                                });

                                img_item.push(new THREE.Mesh(geometry1, material));
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
                
                if (p_highlightItem == p_uuid) {
                    g_intersected.push(items);
                    var highlightItem = highlightProduct(items, 4, p_width, p_height, p_depth, p_z);
                }
                animate_pog(0);
                render();
                console.log('imag item', items);
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
                    var selectedObject = g_world.getObjectById(g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);

                    if (p_recreate == "N") {
                        p_x = 0 - (g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2 - p_width / 2 - g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Distance);
                        p_y = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + p_height / 2;
                        p_z = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 - p_depth / 2;
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
                if (p_highlightItem == p_uuid) {
                    g_intersected.push(items);
                    var highlightItem = highlightProduct(items, 4, p_width, p_height, p_depth, p_z);
                }
                g_world.add(items);
                items.castShadow = true;
                add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height);
                render();
                resolve(items.id);
            }            
        });
    } catch (err) {
        error_handling(err);
    }
}


function add_items_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_rotation) {
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
        render();
        return items.id;
    } catch (err) {
        error_handling(err);
    }
}

function add_items_prom_3d(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_highlightItem) {
    try {
        return new Promise(function (resolve, reject) {
            var colorValue = parseInt(p_color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            var rotation = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation;
            var slope = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Slope;

            if (nvl(rotation) !== 0 || nvl(slope) !== 0) {
                items = new THREE.Mesh(
                    new THREE.BoxGeometry(p_width, p_height, p_depth),
                    new THREE.MeshBasicMaterial({
                        color: hex_decimal,
                    }));
                var selectedObject = g_world.getObjectById(g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);

                p_x = 0 - (g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2 - p_width / 2 - g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Distance);
                p_y = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + p_height / 2;
                p_z = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 - p_depth / 2;

                g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationX = p_x;
                g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationY = p_y;
                g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationZ = p_z;

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
            if (p_highlightItem == p_uuid) {
                g_intersected.push(items);
                var highlightItem = highlightProduct(items, 4, p_width, p_height, p_depth, p_z);
            } else {
                var l_wireframe_id = add_wireframe_3d(items);
            }
            items.ImageExists = 'N';
            g_world.add(items);
            items.castShadow = true;
            render();
            resolve(items.id);
        });
    } catch (err) {
        error_handling(err);
    }
}

function add_item_borders_3d(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height) {
    try {
        horiz_facing = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BHoriz;
        vert_facing = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BVert;
        var nesting = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].ItemNesting;
        var nesting_val = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].NVal;
        var cap_style = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle;
        var cap_count = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount;
        var org_height = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OH;
        var org_width = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OW;
        var item_depth = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;
        var real_height = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH;
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
        var shelf_depth = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D;
        var points = [];
        Show_Depthfacing(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height);
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
            }
        } else if (cap_style !== "0") {
            var items_cnt = 0;
            if (cap_style == "1") {
                curr_vert_value = l_vert_start;
                for (i = 1; i <= vert_facing; i++) {
                    curr_vert_value += parseFloat(org_height);
                    if (curr_vert_value < l_vert_end) verti_values.push(curr_vert_value);
                    else break;
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
                    curr_vert_value += parseFloat(item_depth);
                    if (curr_vert_value < l_vert_end) verti_values.push(curr_vert_value);
                    else break;
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            } else if (cap_style == "3") {
                curr_vert_value = l_vert_start + org_height;
                verti_values.push(curr_vert_value);
                for (i = 1; i < cap_count; i++) {
                    curr_vert_value += parseFloat(item_depth);
                    if (curr_vert_value < l_vert_end) verti_values.push(curr_vert_value);
                    else break;
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
                curr_height = p_height / vert_facing;
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

async function recreate_image_items(p_show_live_ind, p_pog_json, p_world) {
    try {
        var l = 0;

        console.log('pPOGJSON[0].ModuleInfo', p_pog_json[0].ModuleInfo);
        var mod_arr = p_pog_json[0].ModuleInfo;
        for (const modules of mod_arr) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                if (modules.ShelfInfo.length > 0) {
                    j = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            n = 0;
                            for (const items of shelfs.ItemInfo) {
                                if (items.Item !== "DIVIDER") {
                                    var selectedObject = p_world.getObjectById(items.ObjID);
                                    p_world.remove(selectedObject);
                                    if (p_show_live_ind == "Y" && items.MerchStyle != 3) {
                                        var details = g_orientation_json[g_json[0].ModuleInfo[l].ShelfInfo[j].ItemInfo[n].Orientation];
                                        var details_arr = details.split("###");
                                        var objID = await add_items_with_image_3d(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, j, n, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", items.BaseD);
                                    } else {
                                        var objID = await add_items_prom_3d(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, j, n);
                                    }
                                    p_pog_json[0].ModuleInfo[l].ShelfInfo[j].ItemInfo[n].ObjID = objID;
                                    if (p_show_live_ind == "N") {
                                        var selectedObject = p_world.getObjectById(objID);
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
                            animate_pog(0);                            
                            if (shelfs.ObjType == "SHELF") {
                                var returnval = reset_top_bottom_objects(l, j, p_world, "N", p_pog_json);
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
                                var return_val = await add_text_box_with_image_3d(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, l, shelfs.InputText, bg_color, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, shelfs.Rotation, shelfs.Slope, shelfs.FStyle, shelfs.FSize, shelfs.FBold, j);
                            } else {
                                g_dblclick_objid = shelfs.SObjID;
                                g_shelf_index = j;
                                var return_val = add_text_box_3d(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, l, shelfs.InputText, colorValue, helfs.WrapText, shelfs.ReduceToFit, shelfs.Color, j, shelfs.Rotation, shelfs.Slope, shelfs.FStyle, shelfs.FSize, shelfs.FBold);
                            }
                            var child_module_index = -1;
                            $.each(p_pog_json[0].ModuleInfo, function (m, modules) {
                                if (modules.ParentModule !== null) {
                                    if (modules.Module == shelfs.Shelf) {
                                        child_module_index = m;
                                    }
                                }
                            });
                            if (child_module_index !== -1) {
                                p_pog_json[0].ModuleInfo[child_module_index].ObjID = return_val;
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

function Show_Depthfacing(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height) {
	var points = [],
		verti_values = [],
		horiz_values = [],
		points_2 = [],
		curr_vert_value = 0,
		curr_width = 0,
		curr_depth = 0;
	curr_height = 0;
	depth = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;
	depth_facing = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BaseD;
	var real_height = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH;
	var real_width = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RW;
	var horiz_facing = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BHoriz;
	var vert_facing = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BVert;
	var l_vert_start = 0 - parseFloat(p_height) / 2;
	var l_vert_end = 0 + parseFloat(p_height) / 2;
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
	var depth_values = [];
	var material = new THREE.LineBasicMaterial({
		color: 0x000000,
	});
    if(capStyle !== 0){
        l_vert_end = l_vert_end - capHeight;
        l_capStart = l_vert_end;
        l_capEnd = l_vert_end + capHeight;
    }
	if (depth_facing > 1) {
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
		curr_height = p_height / vert_facing;
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
	var geometry = new THREE.BufferGeometry().setFromPoints(points);
	var geometry1 = new THREE.BufferGeometry().setFromPoints(points_2);

    
	var line = new THREE.LineSegments(geometry, material);
	line.position.z = 0.0005;
	p_item_object.add(line);
	var line2 = new THREE.LineSegments(geometry1, material);
	line2.position.z = 0.0005;
	p_item_object.add(line2);
    
	if (depth_facing > 1) {
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
			depth_values.push(curr_depth_value);
		}
		for (i = 0; i < depth_values.length; i++) {
			points.push(new THREE.Vector3(start, l_capStart, depth_values[i]));
			points.push(new THREE.Vector3(start, l_capEnd, depth_values[i]));
		}
		for (i = 0; i < depth_values.length; i++) {
			points_2.push(new THREE.Vector3(end, l_capStart, depth_values[i]));
			points_2.push(new THREE.Vector3(end, l_capEnd, depth_values[i]));
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
}