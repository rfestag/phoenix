import React from "react";
import PropTypes from "prop-types";
import { AutoSizer, List } from "react-virtualized";
import { MdExpandMore, MdChevronRight } from "react-icons/md";
import { FaRegSquare, FaCheckSquare, FaRegStar, FaStar } from "react-icons/fa";
import _ from "lodash";

var ROW_HEIGHT = 24;

const ExpandIndicator = ({ expanded, expandable }) => {
  return expanded ? <MdExpandMore /> : expandable ? <MdChevronRight /> : null;
};
ExpandIndicator.propTypes = {
  expanded: PropTypes.bool.isRequired,
  expandable: PropTypes.bool.isRequired
};
const Checkbox = ({ selected, onClick }) => {
  return selected ? (
    <FaCheckSquare onClick={onClick} />
  ) : (
    <FaRegSquare onClick={onClick} />
  );
};
Checkbox.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};
const setSubtreeSelection = (item, selection) => {
  item.selected = selection;
  if (item.children) {
    item.allChildrenSelected = selection;
    for (const child of item.children) {
      setSubtreeSelection(child, selection);
    }
  }
};

class Tree extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: JSON.parse(JSON.stringify(props.data)) };
    this.refList = React.createRef();
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
  renderItem = (item, keyPrefix) => {
    var children = [];
    var hasChildren = false;
    var itemText = " " + item.name;

    var onClick = event => {
      event.stopPropagation();
      console.log("Clicked", event.target);
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
      //Note - we don't implement any special key navigation
      //Browser should inherently do the following:
      //1) Tab - Move to next element
      //2) Shift+Tab - Move to prev element
      //3) Space - Act like click (causes expand/contract)
      //4) Enter - This is the only one we implement. Causes selection
      const key = event.keyCode;
      if (key === 13) {
        setSubtreeSelection(item, !item.selected);
        this.recompute();
      }
    };
    var handleSelectChange = event => {
      event.stopPropagation();
      setSubtreeSelection(item, !item.selected);
      if (this.props.onSelectChange) this.props.onSelectChange(item);
      this.refList.current.recomputeRowHeights();
      this.refList.current.forceUpdate();
    };

    if (item.expanded) {
      children = _.chain(item.children)
        .filter(c => this.filterItem(c) || this.shouldShowTree(c))
        .map((child, index) => {
          return this.renderItem(child, keyPrefix + "-" + index);
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
          {<Checkbox selected={item.selected} onClick={handleSelectChange} />}
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
    var renderedCell = this.renderItem(this.state.data[index], index);

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
    );
  }
}

export default Tree;
