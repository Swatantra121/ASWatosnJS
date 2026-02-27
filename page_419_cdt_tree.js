var g_before_edit_label = "", //Start ASA-1459 code cleaning - change normal varialbes to global variables
    g_before_edit_node = {},
    g_before_edit_ele,
    g_node_master = [],
    g_node_index = [],
    g_parent_master = [],
    g_node_no_arr = [],
    g_parent_no_arr = [],
    g_id_no_arr = [],
    g_final_node_list = [],
    g_temp_json,
    g_matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/, //constant will not change//ASA-1274 issue 1
    g_img_zoom_scale = parseFloat($v("P419_CDT_IMG_ZOOM_SCALE")), //ASA-1274 issue 1 //ASA-1458 issue 1
    g_tree_zoom_scale = parseFloat($v("P419_CDT_TREE_ZOOM_SCALE")); //ASA-1458 issue 1

function getMembers(list) {
    list.forEach(function (item, index) {
        var icon_dtl = item.icon.split("-");
        g_node_no_arr.push(icon_dtl[5]);
        g_parent_no_arr.push(icon_dtl[6]);
        g_node_master.push(item.label);
        g_node_index.push(index);
        g_id_no_arr.push(item.id);
        g_parent_master.push(item._parent !== null ? item._parent.label : "");
        if (item.children) {
            getMembers(item.children);
        }
    });
}

function getWidthOfInput(input_ele) {
    var tmp = document.createElement("span");
    tmp.className = "input-element tmp-element";
    tmp.style.fontWeight = "bold";
    tmp.style.fontSize = "1.5vh";
    tmp.innerHTML = input_ele.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    document.body.appendChild(tmp);
    var theWidth = tmp.getBoundingClientRect().width;
    document.body.removeChild(tmp);
    return theWidth / window.devicePixelRatio + 10;
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

function set_node_details(treeId) {
    //ASA-1162 -X2
    var tree_veiw = $("#" + treeId);
    //$(".asw_tree_custom .a-TreeView-content ").css("display", "block");
    if (tree_veiw.length > 0) {
        $("#" + treeId + " .a-TreeView-content")
            .children("span.a-item-cnt")
            .each(function (index) {
                $("#item_cnt_" + index).remove();

                var details = $(this).attr("class");
                var details_list = details.substring(details.indexOf(" ") + 1).split("-");

                $("#" + treeId + " .a-TreeView-content")
                    .eq(index)
                    .append('<div id="item_cnt_' + index + '">> ' + details_list[3] + " Items</div>");
            });

        $("#" + treeId + "_0 .a-TreeView-label")
            .css("font-size", "1.5vh")
            .css("font-weight", "bold");
    }
}

function delete_node(treeId, assortment) {
    var tree$ = $("#" + treeId);
    var selection = tree$.treeView("getSelection");
    var selected_id = tree$.treeView("getSelectedNodes")[0].id;
    var selected_node = $("#" + treeId).treeView("getSelectedNodes");

    if (selected_node[0]._parent == null) {
        alert(get_message("CDT_FIRST_LVL_ERR"));
    } else {
        var icon_arr = selected_node[0].icon.split("-");
        var title = tree$.treeView("getSelectedNodes")[0].label;
        var parent_id = tree$.treeView("getSelectedNodes")[0]._parent.label;
        var parent_icon = tree$.treeView("getSelectedNodes")[0]._parent.icon.split("-");
        var select_icon = tree$.treeView("getSelectedNodes")[0].icon.split("-");
        //ASA-997
        var Superparent = tree$.treeView("getSelectedNodes")[0]._parent._parent;
        var Superparent_id = Superparent !== null ? tree$.treeView("getSelectedNodes")[0]._parent._parent.label : null;

        console.log("selected_node", selected_node, selected_node[0]);
        var parnticon_arr = tree$.treeView("getSelectedNodes")[0]._parent.icon.split("-")[3];
        var child_cnt = tree$.treeView("getSelectedNodes")[0]._parent.children.length; //task 24244
        console.log("size", parnticon_arr, Superparent_id, parent_id, title, selected_id, selected_node[0], selected_node[0].children);

        if (icon_arr[3] > 0 || selected_node[0].children.length > 0) {
            if (selected_node[0].children.length > 0) {
                //ASA-813
                alert(get_message("CDT_PARENT_NO_DEL"));
            } else if (parnticon_arr != icon_arr[3] || child_cnt > 1) {
                //task 24244
                alert(get_message("CDT_NO_DEL_WITH_ITEM"));
            } else {
                //Task_29818 - Start
                // ax_message.set({
                //     //Start ASA-1459 button reverse. so fixing regression issue
                //     labels: {
                //         ok: get_message("SHCT_YES"),
                //         cancel: get_message("SHCT_NO"),
                //     },
                // });

                // ax_message.set({
                //     buttonReverse: true,
                // }); //End ASA-1459
                // ax_message.confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), function (e) {
                //     if (e) {
                //         apex.server.process(
                //             "DELETE_MEMBER",
                //             {
                //                 x01: selected_id,
                //                 x02: title,
                //                 x03: parent_id,
                //                 x04: Superparent_id,
                //                 x05: select_icon[5],
                //                 x06: parent_icon[5],
                //                 x07: assortment,
                //             },
                //             {
                //                 dataType: "text",
                //                 success: function (pData) {
                //                     if ($.trim(pData) == "") {
                //                         tree$.treeView("deleteNodes", selection);
                //                         //tree$.treeView("refresh");    //ASA-1199
                //                         //tree$.treeView("expandAll");   //ASA-1199
                //                         // apex.region("item_details").refresh();
                //                         // apex.region("node_details").refresh();
                //                         apex.event.trigger("#P419_MOVE_MULTIPLE", "apexrefresh");
                //                         //set_node_details(treeId);
                //                         apex.message.showPageSuccess("Node Deleted");

                //                         async function update_details() {
                //                             apex.region("item_details").refresh();
                //                             apex.region("node_details").refresh();
                //                             $("#" + treeId).treeView("refresh");
                //                             await update_node_index("", treeId, assortment);
                //                             set_node_details(treeId);
                //                             // apex.submit("delete_node");
                //                         }
                //                         update_details();
                //                     }
                //                 },
                //             }
                //         );
                //     }
                // });


                confirm(
                    get_message("SHCT_DELETE_CONFIRM_MSG"),
                    get_message("SHCT_YES"),
                    get_message("SHCT_NO"),
                    function(){
                        apex.server.process(
                            "DELETE_MEMBER",
                            {
                                x01: selected_id,
                                x02: title,
                                x03: parent_id,
                                x04: Superparent_id,
                                x05: select_icon[5],
                                x06: parent_icon[5],
                                x07: assortment,
                            },
                            {
                                dataType: "text",
                                success: function (pData) {
                                    if ($.trim(pData) == "") {
                                        tree$.treeView("deleteNodes", selection);
                                        //tree$.treeView("refresh");    //ASA-1199
                                        //tree$.treeView("expandAll");   //ASA-1199
                                        // apex.region("item_details").refresh();
                                        // apex.region("node_details").refresh();
                                        apex.event.trigger("#P419_MOVE_MULTIPLE", "apexrefresh");
                                        //set_node_details(treeId);
                                        apex.message.showPageSuccess("Node Deleted");

                                        async function update_details() {
                                            apex.region("item_details").refresh();
                                            apex.region("node_details").refresh();
                                            $("#" + treeId).treeView("refresh");
                                            await update_node_index("", treeId, assortment);
                                            set_node_details(treeId);
                                            // apex.submit("delete_node");
                                        }
                                        update_details();
                                    }
                                },
                            }
                        );
                    }
                );

                //Task_29818 - End
            }
        } else {
            /*ax_message.set({
                labels: {
                    ok: "&AI_CONFIRM_OK_TEXT.",
                    cancel: "&AI_CONFIRM_CANCEL_TEXT.",
                },
            });*/
            //Start ASA-1440 issue 1
            //Task_29818 - Start
            // ax_message.set({
            //     labels: {
            //         ok: get_message("SHCT_YES"),
            //         cancel: get_message("SHCT_NO"),
            //     },
            // });
            // //End ASA-1440 issue 1

            // ax_message.set({
            //     buttonReverse: true,
            // });

            // ax_message.confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), function (e) {
            //     if (e) {
            //         apex.server.process(
            //             "DELETE_MEMBER",
            //             {
            //                 x01: selected_id,
            //                 x02: title,
            //                 x03: parent_id,
            //                 x04: Superparent_id,
            //                 x05: select_icon[5],
            //                 x06: parent_icon[5],
            //                 x07: assortment,
            //             },
            //             {
            //                 dataType: "text",
            //                 success: function (pData) {
            //                     if ($.trim(pData) == "") {
            //                         tree$.treeView("deleteNodes", selection);
            //                         //tree$.treeView("refresh"); //ASA-1199
            //                         //tree$.treeView("expandAll");   //ASA-1199
            //                         apex.region("item_details").refresh();
            //                         apex.region("node_details").refresh();
            //                         apex.event.trigger("#P419_MOVE_MULTIPLE", "apexrefresh");
            //                         apex.message.showPageSuccess("Node Deleted");

            //                         async function update_details() {
            //                             apex.region("item_details").refresh();
            //                             apex.region("node_details").refresh();
            //                             $("#" + treeId).treeView("refresh");
            //                             var returnval = await update_node_index("", treeId, assortment);
            //                             set_node_details(treeId);
            //                             //apex.submit("delete_node");
            //                         }
            //                         update_details();
            //                     }
            //                 },
            //             }
            //         );
            //     }
            // });


            confirm(
                get_message("SHCT_DELETE_CONFIRM_MSG"),
                get_message("SHCT_YES"),
                get_message("SHCT_NO"),
                function(){
                    apex.server.process(
                        "DELETE_MEMBER",
                        {
                            x01: selected_id,
                            x02: title,
                            x03: parent_id,
                            x04: Superparent_id,
                            x05: select_icon[5],
                            x06: parent_icon[5],
                            x07: assortment,
                        },
                        {
                            dataType: "text",
                            success: function (pData) {
                                if ($.trim(pData) == "") {
                                    tree$.treeView("deleteNodes", selection);
                                    //tree$.treeView("refresh"); //ASA-1199
                                    //tree$.treeView("expandAll");   //ASA-1199
                                    apex.region("item_details").refresh();
                                    apex.region("node_details").refresh();
                                    apex.event.trigger("#P419_MOVE_MULTIPLE", "apexrefresh");
                                    apex.message.showPageSuccess("Node Deleted");

                                    async function update_details() {
                                        apex.region("item_details").refresh();
                                        apex.region("node_details").refresh();
                                        $("#" + treeId).treeView("refresh");
                                        var returnval = await update_node_index("", treeId, assortment);
                                        set_node_details(treeId);
                                        //apex.submit("delete_node");
                                    }
                                    update_details();
                                }
                            },
                        }
                    );
                }
            );

            //Task_29818 - End
        }
    }
}

function update_node_index(p_need_state, treeId, assortment) {
    var prev_expand_nodes = $v("P419_PREV_EXPND_NODES"); //task 24309
    console.log("p_need_state", p_need_state);
    return new Promise(function (resolve, reject) {
        var master_data_obj = [$("#" + treeId).treeView("getNodeAdapter").data];
        g_node_master = [];
        g_node_index = [];
        g_parent_master = [];
        g_node_no_arr = [];
        g_parent_no_arr = [];
        g_id_no_arr = [];
        getMembers(master_data_obj);
        console.log("g_node_master", g_node_master, g_parent_master);
        apex.server.process(
            "UPDATE_NODE_INDEX",
            {
                x01: assortment,
                f01: g_node_master,
                f02: g_node_index,
                f03: g_parent_master,
                f04: g_node_no_arr,
                f05: g_parent_no_arr,
                f06: g_id_no_arr,
            },
            {
                dataType: "text",
                success: function (pData) {
                    console.log("update node index done ", pData, "need state ", p_need_state, " assortment ", assortment, " prev ", prev_expand_nodes);
                    apex.server.process(
                        "UPDATE_NODE_NO",
                        {
                            x01: p_need_state,
                            x02: assortment,
                            x03: prev_expand_nodes,
                        },
                        {
                            dataType: "json",
                            // dataType: "text",
                            success: function (pData) {
                                console.log("update node no done");
                                var id_data = typeof pData.need_no !== "undefined" ? pData.need_no : "";
                                var final_expnd_nodes = typeof pData.final_expand_node !== "undefined" ? pData.final_expand_node : "";
                                $s("P419_PREV_EXPND_NODES", final_expnd_nodes); //task 24309
                                async function update_final_nodes(ajax_data) {
                                    var retval = await update_final_icon_details(treeId, assortment);
                                    resolve(ajax_data);
                                }
                                update_final_nodes(id_data);
                            },
                        }
                    );
                },
            }
        );
    });
}

function update_final_icon_details(treeId, assortment) {
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "UPDATE_NEED_SEQ",
            {
                x01: assortment,
            },
            {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) !== "") {
                        console.log($.trim(pData));
                        g_temp_json = $.trim(pData);
                        console.log("g_temp_json", JSON.parse(g_temp_json));
                        try {
                            g_final_node_list = [];
                            g_final_node_list = JSON.parse($.trim(pData));
                            for (const objects of g_final_node_list) {
                                var node_div = $("#" + treeId).treeView("find", {
                                    depth: -1,
                                    match: function (n) {
                                        return n.id == objects.C004 && n.label == objects.C001;
                                    },
                                });
                                var node_detail = $("#" + treeId).treeView("getNodes", node_div);
                                if (typeof node_detail !== "undefined" && node_detail.length > 0) {
                                    //task 24244
                                    var node_icon = node_detail[0].icon.split("-");
                                    node_icon[3] = objects.C006 == null || objects.C006 == "" ? 0 : objects.C006;
                                    node_icon[5] = objects.N003;
                                    node_detail[0].id = objects.N003;//ASA-1486
                                    node_icon[6] = objects.N004 == null ? "" : objects.N004;
                                    node_detail[0].icon = node_icon.join("-");
                                    $(node_div)
                                        .find("span")
                                        .first()
                                        .attr("class", "a-item-cnt " + node_icon.join("-"));
                                }
                            }
                            resolve("SUCCESS");
                        } catch (err) {
                            apex.message.clearErrors();
                            apex.message.showErrors([
                                {
                                    type: "error",
                                    location: "page",
                                    message: get_message("SAR_JSON_PARSE_ERROR"),
                                },
                            ]);
                            resolve("FAIL");
                        }
                    }
                },
            }
        );
    });
}

function add_node(p_location, treeId, assortment) {
    var tree$ = $("#" + treeId);
    var selection = $("#" + treeId).treeView("getSelection");
    var curr_node = $("#" + treeId).treeView("getSelectedNodes");
    var selected_id = tree$.treeView("getSelectedNodes").id;
    var l_detail_1 = $v("P419_CDT_SEARCH_TYPE") == "M" ? $v("P419_GROUP") : $v("P419_POG_DIV");
    var l_detail_2 = $v("P419_CDT_SEARCH_TYPE") == "M" ? $v("P419_DEPT") : $v("P419_POG_DEPT");
    var l_detail_3 = $v("P419_CDT_SEARCH_TYPE") == "M" ? $v("P419_CLASS") : $v("P419_POG_SUBDEPT");
    var parentID = $v("P419_SELECTED_NODE");
    var final_parent, parent_detail;

    if (curr_node[0]._parent == null && p_location !== "AAB") {
        alert(get_message("CDT_TOP_ERR"));
    } else {
        if (p_location == "AAF") {
            console.log("AAF");
            final_parent = $("#" + treeId).treeView("find", {
                depth: -1,
                match: function (n) {
                    return n.id == curr_node[0]._parent.id;
                },
            });
            parent_detail = $("#" + treeId).treeView("getNodes", final_parent);
            parentID = parent_detail[0].label;
        } else if (p_location == "AAA") {
            console.log("AAA");
            if (curr_node[0]._parent !== null) {
                var parent_node = $("#" + treeId).treeView("find", {
                    depth: -1,
                    match: function (n) {
                        return n.id == curr_node[0]._parent.id;
                    },
                });
            }
            parent_detail = $("#" + treeId).treeView("getNodes", parent_node);
            if (parent_detail[0]._parent !== null) {
                final_parent = $("#" + treeId).treeView("find", {
                    depth: -1,
                    match: function (n) {
                        return n.id == parent_detail[0]._parent.id;
                    },
                });
                parentID = $("#" + treeId).treeView("getNodes", final_parent)[0].label;
            }
        } else {
            final_parent = $("#" + treeId).treeView("getSelection");
        }
        if (p_location == "AAA" && parent_detail[0]._parent == null) {
            alert(get_message("CDT_ABOVE_TOP_ERR"));
        } else {
            apex.server.process(
                "GET_NEW_NODE_ID",
                {
                    x01: "",
                },
                {
                    dataType: "text",
                    success: function (pData) {
                        if ($.trim(pData) !== "") {
                            var newNodeID = $.trim(pData);
                            console.log("newNodeID", newNodeID);
                            var parent_details = $("#" + treeId).treeView("getNodes", final_parent);
                            var icon_details = parent_details[0].icon.split("-");
                            console.log("parent_details[0].icon", parent_details[0].icon, icon_details, parent_details[0]);
                            apex.server.process(
                                "MAX_NODE_VALIDATION",
                                {
                                    x01: parentID,
                                    x02: p_location,
                                    x03: "Child Node" + newNodeID,
                                    x04: newNodeID,
                                    x05: icon_details[5],
                                    x06: assortment,
                                },
                                {
                                    dataType: "text",
                                    success: function (pData) {
                                        if ($.trim(pData) !== "") {
                                            alert($.trim(pData));
                                        } else {
                                            var parent_details = $("#" + treeId).treeView("getNodes", final_parent);
                                            var icon_details = parent_details[0].icon.split("-");
                                            console.log("sunaina" + icon_details);
                                            console.log("parent_details ", parent_details, l_detail_1, l_detail_2, l_detail_3, parentID, $.trim(pData), p_location, icon_details[5]);
                                            apex.server.process(
                                                "ADD_NODE",
                                                {
                                                    x01: l_detail_1,
                                                    x02: l_detail_2,
                                                    x03: l_detail_3,
                                                    x04: "Child Node" + newNodeID,
                                                    x05: parentID,
                                                    x06: $.trim(pData),
                                                    x07: p_location,
                                                    x08: icon_details[5],
                                                    x09: assortment,
                                                },
                                                {
                                                    dataType: "text",
                                                    success: function (pData) {
                                                        if ($.trim(pData) !== "") {
                                                            var detail_arr = $.trim(pData).split("-");
                                                            console.log("detail_arr cnt ", detail_arr);
                                                            if (detail_arr[0] == "cnt") {
                                                                var node_details = {};
                                                                node_details["icon"] = "asw-item-cnt-" + detail_arr[1] + "-" + "Y" + "-" + detail_arr[2] + "-" + detail_arr[3]; //(p_location == 'AAB' ? 'Y' : 'N');
                                                                node_details["label"] = "Child Node" + newNodeID;
                                                                node_details["tooltip"] = "Child Node" + newNodeID;
                                                                node_details["id"] = newNodeID;
                                                                node_details["_parent"] = final_parent;
                                                                node_details["children"] = [];
                                                                console.log("node_details", node_details);
                                                                tree$.treeView("addNode", final_parent, 2, node_details);
                                                                //tree$.treeView("refresh");   //ASA-1199
                                                                //tree$.treeView("expandAll");   //ASA-1199
                                                                console.log("parent_details 1", parent_details);
                                                                var icon_details = parent_details[0].icon.split("-");
                                                                icon_details[4] = "N";
                                                                parent_details[0].icon = icon_details.join("-");
                                                                console.log("parent_details 2", parent_details);
                                                                console.log("node added");
                                                            }
                                                        }

                                                        async function doSomething() {
                                                            console.log("before node index");
                                                            var returnval = await update_node_index("Child Node" + newNodeID, treeId, assortment);
                                                            console.log("returnval inside something", returnval);
                                                            var parent_no = returnval.split("-");
                                                            var node_dtl = $("#" + treeId).treeView("find", {
                                                                depth: -1,
                                                                match: function (n) {
                                                                    return n.id == newNodeID;
                                                                },
                                                            });
                                                            var node_arr = $("#" + treeId).treeView("getNodes", node_dtl);
                                                            var details_arr = node_arr[0].icon.split("-");
                                                            console.log("after update", node_arr, details_arr);
                                                            details_arr[5] = parent_no[0].replace("\n", "");
                                                            details_arr[6] = parent_no[1].replace("\n", "");
                                                            node_arr[0].icon = details_arr.join("-");
                                                            $s("P419_SELECTED_CHILD_LIST", `${details_arr[5]}`);
                                                            $s("P419_SELECT_NEED_SEQ", `${details_arr[5]}`);
                                                            apex.region("item_details").refresh();
                                                            apex.region("node_details").refresh();
                                                            apex.event.trigger("#P419_MOVE_MULTIPLE", "apexrefresh");
                                                            set_node_details(treeId);
                                                            apex.message.showPageSuccess("Node Added");
                                                        }
                                                        doSomething();
                                                    },
                                                }
                                            );
                                        }
                                    },
                                }
                            );
                        }
                    },
                }
            );
        }
    }
}

function update_node(event, ui, treeId, assortment) {
    if (ui.status == "complete") {
        var tree$ = $("#" + treeId);
        var selected_id = g_before_edit_node.id;
        //var selected_node = tree$.treeView("getSelectedNodes");
        //  console.log('before label', g_before_edit_label, 'before node ', g_before_edit_node.label, (g_before_edit_node.label).length);
        if (g_before_edit_node.label.toUpperCase() !== g_before_edit_label.toUpperCase()) {
            var details_arr = g_before_edit_node.icon.split("-");
            console.log("before_edit_nodek", g_before_edit_node.label, details_arr[5]);
            apex.server.process(
                "CHECK_DUPLICATE",
                {
                    x01: g_before_edit_node.label,
                    x02: details_arr[5],
                    x03: assortment,
                },
                {
                    dataType: "text",
                    success: function (pData) {
                        //    var parent_id = (tree$.treeView("getSelectedNodes")[0])._parent.label;

                        if ($.trim(pData) == "" && g_before_edit_node.label.length < 255) {
                            var details_arr = g_before_edit_node.icon.split("-");
                            apex.server.process(
                                "UPDATE_NODE",
                                {
                                    x01: selected_id,
                                    x02: g_before_edit_node.label,
                                    x03: g_before_edit_label,
                                    x04: details_arr[5],
                                    x05: details_arr[6],
                                    x06: assortment,
                                },
                                {
                                    dataType: "text",
                                    success: function (pData) {
                                        console.log("updated text", $.trim(pData));
                                        if ($.trim(pData) == "node updated") {
                                            var final_parent = $("#" + treeId).treeView("find", {
                                                depth: -1,
                                                match: function (n) {
                                                    return n.id == selected_id;
                                                },
                                            });
                                            var node_detail = $("#" + treeId).treeView("getNodes", final_parent);
                                            node_detail[0].tooltip = g_before_edit_node.label; //node_detail[0].label;
                                            //tree$.treeView("getSelectedNodes")[0].tooltip = tree$.treeView("getSelectedNodes")[0].label;
                                            // $s('P419_SELECTED_CHILD_LIST', `${g_before_edit_node.label}`);
                                            //$s('P419_SELECTED_CHILD_LIST', `${g_before_edit_node.id}`);
                                            // var parent_id = (tree$.treeView("getSelectedNodes")[0])._parent.label;
                                            //tree$.treeView("refresh");  //ASA-1199
                                            //tree$.treeView("expandAll");  //ASA-1199
                                            //apex.region('item_details').refresh();
                                            apex.region("node_details").refresh();
                                            apex.event.trigger("#P419_MOVE_MULTIPLE", "apexrefresh");
                                            set_node_details(treeId);
                                        }
                                    },
                                }
                            );
                        } else {
                            if (g_before_edit_node.label.length > 255) {
                                alert(get_message("CDT_MAX_TEXT_LIMIT_ERR"));
                            } else {
                                alert($.trim(pData));
                            }

                            var final_parent = $("#" + treeId).treeView("find", {
                                depth: -1,
                                match: function (n) {
                                    return n.id == selected_id;
                                },
                            });
                            var node_detail = $("#" + treeId).treeView("getNodes", final_parent);
                            node_detail[0].label = g_before_edit_label;
                            //tree$.treeView("getSelectedNodes")[0].label = g_before_edit_label;
                            //tree$.treeView("refresh");  //ASA-1199
                            //tree$.treeView("expandAll");  //ASA-1199
                            set_node_details(treeId);
                        }
                    },
                }
            );
        }
    }
    set_node_details(treeId);
}
//ASA-1
function save_node_detail() {
    var [assortment, treeId] = getAssormentDetails();
    var tree$ = $("#" + treeId);
    var model = apex.region("node_details").widget().interactiveGrid("getViews", "grid").model;
    var finalData = []; //task 24309
    var NodeDetails = [];
    model.forEach(function (record) {
        if (model.getValue(record, "MOVE_TO").v !== "") {
            var details = {};
            var move_node_arr = model.getValue(record, "MOVE_TO").v.split("-");
            finalData.push(move_node_arr[1]);
            details["NeedState"] = model.getValue(record, "NEED_STATE");
            details["MoveTo"] = move_node_arr[1];
            details["PNodeLevel"] = parseInt(move_node_arr[3]);//ASA-1486 //ASA-1486 issue 1,2
            details["NeedNo"] = model.getValue(record, "NODE_NO");
            details["ParentNo"] = model.getValue(record, "PARENT_NO");
            details["NodeLevel"] = parseInt(model.getValue(record, "NODE_LEVEL"));//ASA-1486 //ASA-1486 issue 1,2
            NodeDetails.push(details);
        }
    });
    //var level_list = ''; //ASA-1543
    //ASA-1486 Start
    var leaf_list = '';
    var error_flag = ''
    for (obj of NodeDetails) {
        var ChildDiv = tree$.treeView("find", {
            depth: -1,
            match: function (n) {
                return n.id == obj.NeedNo;
            },
        });
        var ChildDetail = tree$.treeView("getNodes", ChildDiv);
        var ParentDiv = tree$.treeView("find", {
            depth: -1,
            match: function (n) {
                return n.id == obj.MoveTo;
            },
        });
        var ParentDetail = tree$.treeView("getNodes", ParentDiv);

        if (typeof ParentDetail[0].children == "undefined") {
            ParentDetail[0].children = [];
        }
        if (typeof ChildDetail[0].children == "undefined") {
            ChildDetail[0].children = [];
        }
        //ASA-1543
        /*if (obj.NodeLevel !== obj.PNodeLevel + 1 && ChildDetail[0].children.length > 0) { //ASA-1486 issue 1,2
            level_list = level_list + ', ' + obj.NeedState + ' (' + obj.NodeLevel + ' : ' + (obj.PNodeLevel + 1) + ')';
        }*/
        if (ParentDetail[0].children.length == 0 && ChildDetail[0].children.length > 0) {
            leaf_list = leaf_list + ', ' + obj.NeedState;
        }
    }
    //ASA-1543
    /*if (level_list !== '') {
        alert(get_message('CDT_NODE_MOVE_ERROR', level_list.substring(2)));
    } else*/ 
    if (leaf_list !== '') {
        alert(get_message('CDT_NODE_MOVE_ERROR_LEAF', leaf_list.substring(2)));
    } else {//ASA-1486 End
        addLoadingIndicator();//ASA-1486 issue 1,2
        invokeIGSave("node_details", async function () {
            async function update_nodes() {
                //var tree$ = $("#" + treeId);
                //var selection = tree$.treeView("getSelection");
                //tree$.treeView("expandAll"); --asa-1199
                //tree$.treeView("refresh");--asa-1199
    
                //apex.submit();
    
                var SampleFunc = function () {
                    console.log("UpdateNode" + NodeDetails + treeId);
                };
                var NodeAdapter = tree$.treeView("getNodeAdapter");
                var id_list = [];
                for (obj of NodeDetails) {
                    var ChildDiv = tree$.treeView("find", {
                        depth: -1,
                        match: function (n) {
                            return n.id == obj.NeedNo;
                        },
                    });
                    var ChildDetail = tree$.treeView("getNodes", ChildDiv);
                    var ParentDiv = tree$.treeView("find", {
                        depth: -1,
                        match: function (n) {
                            return n.id == obj.MoveTo;
                        },
                    });
                    var ParentDetail = tree$.treeView("getNodes", ParentDiv);
                    if (typeof ParentDetail[0].children == "undefined") {
                        ParentDetail[0].children = [];
                    }
                    id_list.push(ParentDetail[0].id);
                    NodeAdapter.moveNodes(ParentDetail[0], 1, ChildDetail, SampleFunc);
                }
                tree$.treeView("refresh");
                for (obj of id_list) {
                    var nodeDiv = tree$.treeView("find", {
                        depth: -1,
                        match: function (n) {
                            return n.id == obj;
                        },
                    });
                    tree$.treeView("expand", nodeDiv);
                    var nodeDetail = tree$.treeView("getNodes", nodeDiv);
                    if (nodeDetail[0]) {
                        getParentArray(nodeDetail[0]).forEach(function (p) {
                            var finalDiv = tree$.treeView("getTreeNode", p);
                            tree$.treeView("expand", finalDiv);
                        });
                    }
                }
                await update_node_index("", treeId, assortment);
                set_node_details(treeId);
                apex.region("node_details").widget().interactiveGrid("getViews").grid.model.clearChanges();
                apex.region("node_details").widget().interactiveGrid("getActions").set("edit", false);
                apex.region("node_details").refresh();
                apex.message.showPageSuccess(apex.lang.getMessage("APEX.IG.CHANGES_SAVED"));
                removeLoadingIndicator(regionloadWait);//ASA-1486 issue 1,2
            }
            update_nodes();
        });
    }
}

function save_item_detail() {
    var [assortment, treeId] = getAssormentDetails();
    addLoadingIndicator(); //ASA-1459 issue 5
    var apexTree = assortment !== "FULL" ? "cdt" : "cdtFull";
    console.log("grid", apex.region("item_details").widget().interactiveGrid("getViews").grid.model.isChanged());
    if (apex.region("item_details").widget().interactiveGrid("getViews").grid.model.isChanged()) {
        invokeIGSave("item_details", function () {
            async function update_details() {
                /*apex.message.showPageSuccess(apex.lang.getMessage("APEX.IG.CHANGES_SAVED"));//ASA-1459 issue 1 start
                apex.region("item_details").widget().interactiveGrid("getViews").grid.model.clearChanges();
                apex.region("item_details").widget().interactiveGrid("getActions").set("edit", false);
                //apex.region("item_details").refresh();
                var tree$ = $("#" + treeId);
                tree$.treeView("refresh");
                await update_node_index("", treeId, assortment);
                set_node_details(treeId);*/
                await update_items_refresh();//ASA-1459 issue 1 end
                //apex.submit("UPDATE_ITEM");
            }
            update_details();
        });
    }
}

async function update_items_refresh() { //ASA-1459 issue 1 start
    var [assortment, treeId] = getAssormentDetails();
    apex.message.showPageSuccess(apex.lang.getMessage("APEX.IG.CHANGES_SAVED"));//ASA-1459 issue 1 Start
    apex.region("item_details").widget().interactiveGrid("getViews").grid.model.clearChanges();
    apex.region("item_details").widget().interactiveGrid("getActions").set("edit", false);
    apex.region("item_details").refresh();
    var tree$ = $("#" + treeId);
    tree$.treeView("refresh");
    await update_node_index("", treeId, assortment);
    set_node_details(treeId);
    removeLoadingIndicator(regionloadWait); //ASA-1459 issue 5
}//ASA-1459 issue 1 end

function update_multiple_items() {
    var model = apex.region("item_details").widget().interactiveGrid("getViews", "grid").model;
    var seq_id = -1;
    var i = 0;
    var gridView = apex.region("item_details").widget().interactiveGrid("getViews").grid;
    var records = gridView.getSelectedRecords();
    if (records.length > 0) {
        i = 0;
        for (const r of records) {
            model.setValue(r, "CHANGE_COLUMN", "Y");
            i = i + 1;
        }
        save_item_detail();
    }
}

function getAssormentDetails() {
    var assortment = $v("P419_CDT_SEARCH_TYPE") == "P" ? $v("P419_ITEM_ASSORT") : "";
    var treeId = assortment !== "FULL" ? "cdt_tree" : "cdtFull_tree";
    return [assortment, treeId];
}

function getParentArray(n) {
    //task 24309
    var arr = [],
        ln = n;
    while (ln._parent !== null) arr.push((ln = ln._parent));
    return arr.reverse();
}

function moveNodeExpandNode() {
    //task 24309
    var tree$,
        nodeIds = JSON.parse($v("P419_PREV_EXPND_NODES"));
    if ($v("P419_ITEM_ASSORT") == "FULL" && $v("P419_CDT_SEARCH_TYPE") == "P" && $v("P419_ASSORT_TYPE") == "FULL") {
        tree$ = $("#cdtFull_tree");
    } else {
        tree$ = $("#cdt_tree");
    }
    for (nodes of nodeIds) {
        var nodeDiv = tree$.treeView("find", {
            depth: -1,
            match: function (n) {
                return n.id == nodes;
            },
        });

        var nodeDetail = tree$.treeView("getNodes", nodeDiv);
        if (nodeDetail[0]) {
            getParentArray(nodeDetail[0]).forEach(function (p) {
                var finalDiv = tree$.treeView("getTreeNode", p);
                tree$.treeView("expand", finalDiv);
            });
        }
    }
}
//ASA-1274 issue 1 Start
/*$('.tile')//Start ASA-1274
    // tile mouse actions
    .on('mouseover', function () {
        console.log('this',this);
        $(this).children('.photo').css({ 'transform': 'scale(' + $(this).attr('data-scale') + ')' });
        $(this).children('.photo').css('cursor', 'zoom-in');
    })
    .on('mouseout', function () {
        $(this).children('.photo').css({ 'transform': 'scale(1)' });
        $(this).children('.photo').css('cursor', 'auto');
    })
    .on('mousemove', function (e) {
        $(this).children('.photo').css({ 'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 + '%' });
        $(this).children('.photo').css('cursor', 'zoom-in');
    })
    // tiles set up
    .each(function () {
        $(this)
            // add a photo container
            .append('<div class="photo"></div>')
            // set up a background image for each tile based on data-image attribute
            .children('.photo').css({ 'background-image': 'url(' + $(this).attr('data-image') + ')' });
    })//End ASA-1274*/

/*$('.photo').each(function () {
    $(this)
        // add a photo container
        .append('<div class="photo"></div>')
        // set up a background image for each tile based on data-image attribute
        .children('.photo').css({ 'background-image': 'url(' + $(this).attr('data-image') + ')' }).css({ 'transform': 'scale(1)' });
})*/
// Start ASA-1458
function zoom_in(p_static_id, p_zoom_scale) {
    //ASA-1458 issue 1
    var select_ele = $("#" + p_static_id);
    var matches = select_ele.css("transform").match(g_matrixRegex);
    var scale = parseFloat(matches[1]);
    select_ele.css({ transform: "scale(" + (scale + p_zoom_scale) + ")" }); //ASA-1458 issue 1
}

function reset_zoom(p_static_id) {
    var select_ele = $("#" + p_static_id);
    select_ele.css({ transform: "scale(1)" });
    select_ele.css("cursor", "auto");
}

function zoom_out(p_static_id, p_scale_less, p_zoom_scale) {
    //ASA-1458 issue 1
    var select_ele = $("#" + p_static_id);
    var matches = select_ele.css("transform").match(g_matrixRegex);
    var scale = parseFloat(matches[1]);
    console.log("p_scale_less", p_scale_less, scale);
    if ((scale > 1 && p_scale_less == "N") || (p_scale_less == "Y" && scale > 0.1)) {
        //ASA-1458
        select_ele.css({ transform: "scale(" + (scale - p_zoom_scale) + ")" }); //ASA-1458 issue 1
    }
}
function onDocumentMouseWheel(p_event) {
    var select_ele = $(p_event.srcElement);
    var scale_less = "N";
    var zoom_scale = g_img_zoom_scale; //ASA-1458 issue 1
    if (typeof select_ele.attr("id") !== "undefined" && p_event.ctrlKey) {
        if (select_ele.attr("id").indexOf("cdtFull") > -1 || select_ele.attr("id").indexOf("cdt") > -1) {
            p_event.preventDefault();
            if (select_ele.attr("id").indexOf("cdtFull") > -1) {
                select_ele = $("#cdtFull_tree");
                scale_less = "Y";
            } else if (select_ele.attr("id").indexOf("cdt") > -1) {
                select_ele = $("#cdt_tree");
                scale_less = "Y";
            }
        }
    }
    if (typeof select_ele.closest(".a-TreeView").attr("id") !== "undefined") {
        //Start ASA-1458
        var closest_name = select_ele.closest(".a-TreeView").attr("id").toString();
        if (closest_name.indexOf("Full") > -1) {
            select_ele = $("#cdtFull_tree");
            scale_less = "Y";
        } else {
            select_ele = $("#cdt_tree");
            scale_less = "Y";
        }
        zoom_scale = g_tree_zoom_scale; //ASA-1458 issue 1
    } //End ASA-1458
    if (p_event.ctrlKey) {
        p_event.preventDefault();
        var matches = select_ele.css("transform").match(g_matrixRegex);
        if (matches !== null) {
            var scale = parseFloat(matches[1]);
            if (p_event.deltaY < 0) {
                select_ele.css({ transform: "scale(" + (scale + zoom_scale) + ")" });
                select_ele.css("cursor", "zoom-in");
            } else {
                if ((scale > 1 && scale_less == "N") || (scale_less == "Y" && scale > 0.1)) {
                    //ASA-1458
                    select_ele.css({ transform: "scale(" + (scale - zoom_scale) + ")" });
                    select_ele.css("cursor", "zoom-out");
                }
            }
        }
    } else {
        select_ele.css("cursor", "auto");
    }
}

if ($v("P419_CDT_SEARCH_TYPE") == "P") {
    if (document.getElementById("core_cdt_image") !== null) {
        document.getElementById("core_cdt_image").addEventListener("mousewheel", onDocumentMouseWheel, false);
    }
    if ($v("P419_FULL_IMG_SHOW") == "Y" && document.getElementById("full_cdt_image") !== null) {
        document.getElementById("full_cdt_image").addEventListener("mousewheel", onDocumentMouseWheel, false);
    }
}
console.log("document ", document.getElementById("a_Collapsible2_cdt_content"));
if (document.getElementById("cdt_tree") !== null) {
    //Start ASA-1458
    document.getElementById("cdt_tree").addEventListener("mousewheel", onDocumentMouseWheel, false);
}
if (document.getElementById("cdtFull_tree") !== null) {
    document.getElementById("cdtFull_tree").addEventListener("mousewheel", onDocumentMouseWheel, false);
} //End ASA-1458
if (document.getElementById("AssortcdtCore") !== null) {
    document.getElementById("AssortcdtCore").addEventListener("mousewheel", onDocumentMouseWheel, false);
}
if (document.getElementById("AssortcdtFull") !== null) {
    document.getElementById("AssortcdtFull").addEventListener("mousewheel", onDocumentMouseWheel, false);
}
//End ASA-1458
//ASA-1274 issue 1 End
////Start ASA-1459
$(document).keydown(function (p_event) {
    console.log("e.keyCode", p_event, p_event.keyCode);
    var [assortment, treeId] = getAssormentDetails();
    var select_node = $("#" + treeId).treeView("getSelectedNodes");
    if (p_event.keyCode == 46 && select_node.length > 0) {
        p_event.preventDefault();//ASA-1459 issue 2
        if ($v("P419_CASE_STATUS") == "C" || ($v("P419_ITEM_ASSORT") !== "FULL" && $v("P419_ASSORT_TYPE") == "FULL")) {
            console.log("avoid delete");
        } else {
            delete_node(treeId, assortment);
        }
    }
});

//End ASA-1459
