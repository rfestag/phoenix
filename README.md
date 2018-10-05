Phoenix is a geo-temporal analysis tool designed to be relatively agnostic to the data itself. 
All data will be adapted to its own internal format that treats individual records as time-series
data to be binned by 'entity'. Each property in the input stream for a given entity is treated as
its own time-series, allowing for trend analysts, playback, and visualization of trends as well
as change detection.

While it is primarily focused on geo-temporal data containing multiple entities, any temporal data
can be used with this tool. 

## Adding a source

## Styling

Styling is done in one of two ways: via the SASS pre-processor, and via styled-components. Phoenix 
uses Bootstrap 4 where possible. 

### Styling with SASS

Generally speaking, SASS should be used to style nested elements from 3rd party libraries, and to
define variables for use within styled-components (more on that later). As such, you should avoid
doing much styling in here. We include SASS primarily to simplify the process of customizing/themeing
Bootstrap, and to provide a consistent way of defining variables that can be re-used by components.
The `stylesheets` folder is organized as

- `base` - Any core, generic CSS. Usage should be limited only to broad/global styling.
- `themes` - The styles for specific themes. This is split out into
  - `theme` - The name of a specific theme
    - `all` - The main import of the theme. Includes variables (below) and 3rd party themed imports
    - `variables` - The shared variables. This is separated out so it can easily be imported for themeing of styled components
- `utils` - Generic SASS components for use in helping to define variables 
  - `functions` - SASS functions
  - `helpers` - SASS helpers    
  - `mixins` - SASS mixins
- `vendors` - 3rd party imports and overrides that do not depend on themeing 

### Styling with styled-components

This is how most things we write should be styled. More on this later, but for now see examples 
in the components folder

## How to organize a module

Modules define high level functionality. At a minimum, they should include Redux actions and reducers,
but may contain Epics (see `redux-observable`), components, and constants. Generally speaking

- Actions should define the action names as well as functions that wrap action creators.
- Reducers should only handle state. You may define epics in here
- Epics should be used to generate additional actions from actions. An example is querying. When a query is creatd, it should create a new collection, start an adapter, and emit updates to the collection based on normalized data from the adapter

## Requirements

1. Must many collections of entities
2. Must support many features types for each entity
3. Must support instantaneous and interval times for features and properties
4. Must support timeline and playback of loaded data

## TODO

- Map - Component
  - Create layer manager - Component
    - Choose base layer
    - Enable/disable overlays
    - Add overlays
      - Set name
      - Set description
      - Set URL (if remote)
      - Set whether it is a user drawn layer
  - Support selection - Feature
    - Add box selection tool
  - Support User Layers
    - Drag/Drop file
    - Manually add/remove
    - Edit layer (shapes within layer)
  - Support shape drawing - Feature
    - Shapes
      - Label (Text only)
      - Circle - lat, lon, rad
      - Ellipse - lat, lon, smaj, smin, ornt
      - LOB - lat, lon, rad, min_az, max_az
      - Line - line string with buffer
      - Polygon - Draw point by point - must allow manual point edit mode (text)
      - Free-hand - Polygon, but more of a lasso type tool
    - Styling (per shape)
      - Stroke color
      - Stroke style
      - Fill Color
      - Fill pattern (maybe?)
      - Icon - for point-type only
      - Tension
    - Description
  - Support filtering by shape - Feature
    - Users specify contains/intersect
  - Support transformation
    - Rotate/Translate all shapes in layer by user-defined factors.
  - Support data styling
    - By rules - Same as shape styling above
  - Timeline - Component
    - Need simple tool for specifying time range and playback controls
    - Should include histogram or sparkline indicating time regions of activity
- Panel manager
  - Make it easy to dynamically show/hide any tray, or panels within those trays
  - Panels are treated as tabs
- Column Manager - Component - Per Collection
  - Allow users to manage columns
    - Automatically detect fields. This cannot be changed
    - Change 'display name' of field
    - Set type of field
      - String
      - Time - Input/Output format
      - Numeric
        - Set unit type (area, distance, etc)
        - Set unit
      - Geometry
        - Goes against geometries (instead of properties)
        - Allow user to specify details for certain types
          - Should LineStrings be drawn as multi-point instead of line?
          - Show/hide
- Color Pallet manager
  - Allow users to load/specify different color pallets
- Entity Viewer
  - List
  - Details


RELOAD logic - Can we reload a user's state when they come back?
  Actions
    Query related actions load data. Keep those details of create/delete
    Apply filter. Keep history of filters added/removed/changed by user
    Delete data. Keep history of ids deleted
