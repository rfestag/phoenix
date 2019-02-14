/* Types */
export const COLLAPSE_PANEL = "COLLAPSE_PANEL";
export const TOGGLE_PANE = "TOGGLE_PANE";
export const SET_PANE = "SET_PANE";

/* Left panel panes */
export const LEFT_PANEL = "LEFT";
export const QUERY_PANE = "QUERY";
export const ENTITY_PANE = "ENTITY";
export const FILTER_PANE = "FILTER";

/* Right panel panes */
export const RIGHT_PANEL = "RIGHT";
export const COLUMN_PANE = "COLUMN";
export const LAYER_PANE = "LAYER";

/* Bottom panel panes */
export const BOTTOM_PANEL = "BOTTOM";
export const GRID_PANE = "GRID";

/* Actions */
export const collapsePanel = panel => ({ type: COLLAPSE_PANEL, panel });
export const togglePane = (panel, pane) => ({ type: TOGGLE_PANE, panel, pane });
export const setPane = (panel, pane) => ({ type: SET_PANE, panel, pane });

export const collapseLeftPanel = () => collapsePanel(LEFT_PANEL);
export const collapseRightPanel = () => collapsePanel(RIGHT_PANEL);
export const collapseBottomPanel = () => collapsePanel(BOTTOM_PANEL);

export const toggleQueryPane = () => togglePane(LEFT_PANEL, QUERY_PANE);
export const toggleEntityPane = () => togglePane(LEFT_PANEL, ENTITY_PANE);
export const toggleFilterPane = () => togglePane(LEFT_PANEL, FILTER_PANE);
export const toggleColumnPane = () => togglePane(RIGHT_PANEL, COLUMN_PANE);
export const toggleLayerPane = () => togglePane(RIGHT_PANEL, LAYER_PANE);
export const toggleGridPane = () => togglePane(BOTTOM_PANEL, GRID_PANE);

export const openQueryPane = () => setPane(LEFT_PANEL, QUERY_PANE);
export const openEntityPane = () => setPane(LEFT_PANEL, ENTITY_PANE);
export const openFilterPane = () => setPane(LEFT_PANEL, FILTER_PANE);
export const openColumnPane = () => setPane(RIGHT_PANEL, COLUMN_PANE);
export const openLayerPane = () => setPane(RIGHT_PANEL, LAYER_PANE);
export const openGridPane = () => setPane(BOTTOM_PANEL, GRID_PANE);
