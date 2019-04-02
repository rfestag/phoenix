import React from "react";
import PropTypes from "prop-types";
import { AutoSizer, List } from "react-virtualized";
import {
  CollapsedIcon,
  ExpandedIcon,
  CheckedIcon,
  UncheckedIcon,
  IndeterminateCheckIcon
} from "./Icons";
import _ from "lodash";

var ROW_HEIGHT = 24;

const ExpandIndicator = ({ expanded, expandable }) => {
  return expanded ? <ExpandedIcon /> : expandable ? <CollapsedIcon /> : null;
};
ExpandIndicator.propTypes = {
  expanded: PropTypes.bool.isRequired,
  expandable: PropTypes.bool.isRequired
};
const Checkbox = ({ selected, indeterminate, onClick }) => {
  return selected ? (
    <CheckedIcon onClick={onClick} />
  ) : indeterminate ? (
    <IndeterminateCheckIcon onClick={onClick} />
  ) : (
    <UncheckedIcon onClick={onClick} />
  );
};
Checkbox.propTypes = {
  selected: PropTypes.bool,
  indeterminate: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};
const setSubtreeSelection = (item, selection) => {
  item.selected = selection;
  item.indeterminate = false; //On explicit selection/de-selection, we are no longer indetermiante
  if (item.children) {
    item.allChildrenSelected = selection;
    for (const child of item.children) {
      setSubtreeSelection(child, selection);
    }
  }
};
const setAncestorsIndeterminate = ancestors => {
  //Assume ancestors are in order of closeness to the recently changed child.
  //In other words, parent is first, grandparent is second, etc..
  for (let ancestor of ancestors) {
    let allSelected = true; //This determines if the parent should be auto-selected
    let noneSelected = true; //This determines of the parent should be auto-deselected
    for (let child of ancestor.children) {
      if (child.selected) {
        noneSelected = false;
      } else {
        allSelected = false;
      }
      //if any child is indeterminate, some descendent is selected.
      //So we treat this as something being selected.
      if (child.indeterminate) {
        noneSelected = false;
      }
    }
    //Auto-select the ancestor if all of its children are selected. This also
    //implies all sub-children are selected.
    ancestor.selected = allSelected;
    ancestor.indeterminate = !(allSelected || noneSelected);
  }
};
const FOCUSABLE_ELEMENTS =
  'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

class Tree extends React.Component {
  constructor(props) {
    super(props);
    console.log("Created new tree");
    this.state = { data: JSON.parse(JSON.stringify(props.data)) };
    this.refList = React.createRef();
    this.element = React.createRef();
  }
  shouldShowTree = item => {
    if (item.children) {
      for (const child of item.children) {
        if (this.filterItem(child)) return true;
        if (this.shouldShowTree(child)) return true;
      }
    }
    return false;
  };
  focusNext = () => {
    this.focusOffset(1);
  };
  focusPrev = () => {
    this.focusOffset(-1);
  };
  focusOffset = offset => {
    const root = this.element.current;
    const focused = document.activeElement;
    //add all elements we want to include in our selection
    if (root && focused) {
      const parentElement = root.firstChild.firstChild.firstChild;
      let focussable = Array.prototype.filter.call(
        parentElement.querySelectorAll(FOCUSABLE_ELEMENTS),
        e => e.offsetWidth > 0 || e.offsetHeight > 0 || e === focused
      );
      var index = focussable.indexOf(focused);
      var target = index + offset;
      if (target >= 0 && target <= focussable.length - 1) {
        var nextElement = focussable[target] || focussable[0];
        nextElement.focus();
      }
    }
  };
  renderItem = (item, ancestors, keyPrefix) => {
    var children = [];
    var hasChildren = false;
    var itemText = " " + item.name;

    var onClick = event => {
      event.stopPropagation();
      event.target.focus();
      if (hasChildren) {
        item.expanded = !item.expanded;
        if (item.expanded && this.props.onExpand) this.props.onExpand(item);
        if (!item.expanded && this.props.onCollapse)
          this.props.onCollapse(item);
        this.refList.current.recomputeRowHeights();
        this.refList.current.forceUpdate();
      }
    };
    var onKeyDown = event => {
      try {
        //1) Tab - Move to next element
        //2) Shift+Tab - Move to prev element
        //3) Space - Act like click (causes expand/contract)
        //4) Enter - Select
        //5) Left - Collapse
        //6) Right - Expand
        //7) Up - Act like Shift+Tab
        //8) Down - Act like Tab
        const key = event.keyCode;
        if (key === 13) {
          setSubtreeSelection(item, !item.selected);
          setAncestorsIndeterminate(ancestors);
          this.recompute();
        }
        //Up
        if (key === 38) {
          this.focusPrev();
        }
        //Down
        if (key === 40) {
          this.focusNext();
        }
        if (key === 39) {
          if (hasChildren) {
            item.expanded = true;
            if (this.props.onExpand) this.props.onExpand(item);
            this.refList.current.recomputeRowHeights();
            this.refList.current.forceUpdate();
          }
        }
        if (key === 37) {
          if (hasChildren) {
            item.expanded = false;
            if (this.props.onCollapse) this.props.onCollapse(item);
            this.refList.current.recomputeRowHeights();
            this.refList.current.forceUpdate();
          }
        }
      } catch (e) {
        console.log(e);
        //This can happen randomly if the user is holding down the up/down arrows
        //and the nodes aren't in the dom yet.
      }
    };
    var handleSelectChange = event => {
      event.stopPropagation();
      setSubtreeSelection(item, !item.selected);
      setAncestorsIndeterminate(ancestors);
      if (this.props.onSelectChange) this.props.onSelectChange(item, ancestors);
      this.refList.current.recomputeRowHeights();
      this.refList.current.forceUpdate();
    };

    if (item.expanded) {
      children = _.chain(item.children)
        .filter(c => this.filterItem(c) || this.shouldShowTree(c))
        .map((child, index) => {
          return this.renderItem(
            child,
            [item, ...ancestors],
            keyPrefix + "-" + index
          );
        })
        .value();
    }
    hasChildren = children.length > 0 || this.shouldShowTree(item);
    var shouldShow = hasChildren || this.filterItem(item);

    if (shouldShow) {
      //Note - tabIndex is used here to ensure we can use keyboard naviagion.
      //Without it, the div cannot be focused
      children.unshift(
        <div
          tabIndex="0"
          onClick={onClick}
          onKeyDown={onKeyDown}
          key="label"
          role="button"
          style={{
            paddingLeft: hasChildren ? 0 : 16,
            cursor: hasChildren ? "pointer" : "auto"
          }}
        >
          {
            <ExpandIndicator
              expanded={hasChildren && item.expanded}
              expandable={hasChildren}
            />
          }
          {
            <Checkbox
              selected={item.selected}
              indeterminate={item.indeterminate}
              onClick={handleSelectChange}
            />
          }
          {itemText}
        </div>
      );
    }

    return children.length > 0 ? (
      <ul style={{ paddingLeft: 10, listStyleType: "none" }}>
        {children.map((c, i) => <li key={keyPrefix + "-" + i}>{c}</li>)}
      </ul>
    ) : null;
  };

  filterItem = item => {
    return this.props.filter ? item.name.includes(this.props.filter) : true;
  };

  rowRenderer = ({ key, index, style }) => {
    var renderedCell = this.renderItem(this.state.data[index], [], index);

    return (
      <div
        key={key}
        style={{
          transitionProperty: "top",
          transitionDuration: "0.2s",
          ...style
        }}
      >
        {renderedCell}
      </div>
    );
  };
  getExpandedItemCount = item => {
    var count = 0;

    if (item.expanded) {
      count = _.chain(item.children)
        .filter(c => this.filterItem(c) || this.shouldShowTree(c))
        .map(this.getExpandedItemCount)
        .reduce((total, count) => {
          return total + count;
        }, 0)
        .value();
    }
    if (count > 0 || this.filterItem(item) || this.shouldShowTree(item))
      count += 1;

    return count;
  };

  rowHeight = ({ index }) => {
    return (
      this.getExpandedItemCount(this.state.data[index]) *
      (this.props.rowHeight || ROW_HEIGHT)
    );
  };
  static propTypes = {
    data: PropTypes.array,
    rowHeight: PropTypes.number,
    filter: PropTypes.string,
    selectable: PropTypes.bool,
    onSelectChange: PropTypes.func,
    onExpand: PropTypes.func,
    onCollapse: PropTypes.func
  };
  recompute = _.debounce(() => {
    this.refList.current.recomputeRowHeights();
    this.refList.current.forceUpdate();
  }, 100);
  componentDidUpdate(prevProps) {
    if (prevProps.filter !== this.props.filter) {
      this.recompute();
    }
  }
  render() {
    return (
      <div ref={this.element} style={{ height: "100%" }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              overscanRowCount={10}
              ref={this.refList}
              rowHeight={this.rowHeight}
              rowRenderer={this.rowRenderer}
              rowCount={this.state.data.length}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

export default Tree;
