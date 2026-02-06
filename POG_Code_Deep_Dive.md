# Deep Dive: JSON Structure and Function Logic in `page_25_wpd_3 1.js`

This document provides a detailed technical analysis of the file `page_25_wpd_3 1.js`, focusing on how it manages data via JSON and the internal mechanics of its core functions.

## 1. How JSON Works (`g_pog_json`)

The application relies on a central global JSON object, `g_pog_json`, to store the entire state of the Planogram (POG). This JSON acts as the "Single Source of Truth" for both the rendering engine (likely Three.js) and the business logic.

### 1.1 JSON Hierarchy
The structure is hierarchical, representing the physical layout of a store shelf:

```json
[
  {
    // Level 1: The Planogram (POG) / Canvas
    "W": 100, "H": 200, "BaseH": 10, "BaseW": 100, "Color": "#FFFFFF",
    "ModuleInfo": [
      {
        // Level 2: Modules (Vertical Sections)
        "Module": "A", "W": 50, "H": 200, "MObjID": "unique_id",
        "ShelfInfo": [
          {
            // Level 3: Shelves (Horizontal Surfaces)
            "Shelf": "A1", "SObjID": "unique_id", "ObjType": "SHELF", 
            "X": 25, "Y": 10, "W": 50, "H": 2, 
            "Rotation": 0, "Slope": 0,
            "ItemInfo": [
              {
                // Level 4: Items (Products on Shelf)
                "ItemID": "12345", "ObjID": "unique_id", "Item": "SKU123",
                "X": 5, "Y": 0, "Z": 0, "W": 10, "H": 20, "D": 5,
                "TopObjID": "", "BottomObjID": "" // For stacking logic
              }
            ]
          }
        ],
        "Carpark": [ ... ] // Similar to ShelfInfo, but for unassigned items
      }
    ]
  }
]
```

### 1.2 Key Data Attributes
*   **Coordinates (`X`, `Y`, `Z`)**:  The JSON stores relative coordinates. For an item, `X` and `Y` are often relative to the shelf's center or a specific reference point.
*   **Dimensions (`W`, `H`, `D`)**: Width, Height, and Depth of objects.
*   **IDs (`ObjID`, `SObjID`, `MObjID`, `ItemID`)**: Unique identifiers used to link the JSON data to the 3D scene objects and to track selections.
*   **Relationships (`TopObjID`, `BottomObjID`)**:  These fields implment a "doubly linked list" structure within the JSON to represent vertical stacking of products.

## 2. How Functions Work Deeply

The functions in this file primarily manipulate the `g_pog_json` structure. The general pattern is:
1.  **Read State**: Check flags (`g_module_edit_flag`, `g_shelf_edit_flag`) to know what is selected.
2.  **Clone Data**: Use `JSON.parse(JSON.stringify(...))` to create deep copies of the selected JSON branch.
3.  **Modify Data**: Update coordinates, IDs, or relationships on the cloned data.
4.  **Update State**: Push/Splice the modified data back into `g_pog_json`.
5.  **Render/Log**: Trigger a re-render and log the action for Undo/Redo.

### 2.1 `setDetailsArray(...)`
*   **Purpose**: A factory function that creates a standardized "details" object.
*   **Deep Logic**: It takes nearly 30 arguments (!) covering every possible property of an object (dimensions, location, indices). It acts as a bridge, converting raw JSON data into a flat structure that other functions (like multi-select) can easily consume without digging through the nested JSON every time.

### 2.2 `get_multiselect_obj(p_pog_index)`
*   **Purpose**: Identifies all objects within a user-drawn selection box.
*   **Deep Logic**: 
    1.  It receives the POG index.
    2.  It iterates through **every** module, then **every** shelf, then **every** item.
    3.  **Collision Detection**: For each object, it calculates its bounding box (Left, Right, Top, Bottom) based on its center `X, Y` and dimensions `W, H`.
    4.  It checks if this bounding box intersects with the drag rectangle defined by `g_DragMouseStart` and `g_DragMouseEnd`.
    5.  It handles drag direction (e.g., did the user drag Top-Left to Bottom-Right or Bottom-Right to Top-Left?) by checking all 4 quadrant possibilities.
    6.  Matches are pushed to `g_delete_details`.

### 2.3 `copy_selected_obj(p_action, p_pog_index)`
*   **Purpose**: Prepares data for Clipboard operations (Cut/Copy).
*   **Deep Logic**:
    *   **Context Awareness**: It checks `g_module_edit_flag`, `g_shelf_edit_flag`, etc., to decide *what* to copy.
    *   **Deep Cloning**: It **must** use `JSON.parse(JSON.stringify(...))` to avoid "reference copy". If it just did `copy = original`, modifying the paste would modify the original item immediately.
    *   **Metadata**: It creates a side-car object `loc_details` stored in `g_cut_loc_arr` which remembers *where* the object came from (indices). This is crucial for "Cut" operations (to know where to delete from) and "Undo" operations.

### 2.4 `context_paste(...)`
*   **Purpose**: The most complex function, handling the insertion of data back into the JSON.
*   **Deep Logic**:
    *   **Target Resolution**: It uses `g_intersects` (from a Raycaster) to determine the Exact 3D point (`point.x`, `point.y`) where the user clicked to paste.
    *   **Logic Forking**:
        *   If pasting a **Module**: Calculates new total width of POG.
        *   If pasting a **Shelf**: Finds the closest vertical slot or appends to the module. It calls `get_yaxis_on_paste` to ensure the shelf snaps to a valid height.
        *   If pasting an **Item**:
            *   **Coordinate Transformation**: Converts the global 3D world coordinates of the click back into the "Local" coordinate system of the module/shelf.
            *   **Smart Snapping**: Calculates `l_final_x` and `l_final_y` to ensure items sit *on* the shelf, not floating in air or buried in it.
            *   **Constraint Validation**: Calls `validate_shelf_min_distance` or `item_height_validation` to assume the item physically fits. If validation fails, it might abort the paste or auto-crush (resize) neighbors.
            *   **ID Regeneration**: It generates new `ObjID`s (often using `Math.random()`) for the new items to ensure they don't conflict with existing items.
    *   **Undo Logging**: Before modifying the JSON, it saves the *state before change* into `g_allUndoObjectsInfo`.

### 2.5 Undo/Redo System
The code heavily relies on `g_allUndoObjectsInfo` and `logFinalUndoObjectsInfo`. Every destructive action (Cut, Paste, Delete) pushes a snapshot of the affected JSON branch to a stack. This allows the application to restore `g_pog_json` to a previous state by simply popping this stack and overwriting the current data.
