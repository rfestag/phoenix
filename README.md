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
