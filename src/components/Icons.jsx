import React from "react";
import {
  MdChevronRight,
  MdExpandMore,
  MdFilterCenterFocus,
  MdHourglassEmpty,
  MdLayers,
  MdList,
  MdPictureInPictureAlt,
  MdAdd,
  MdEdit,
  MdTimeline,
  MdPlaylistAdd,
  MdOpenInNew,
  MdDelete,
  MdClose,
  MdArrowUpward,
  MdArrowDownward,
  MdTabUnselected
} from "react-icons/md";
import {
  FaCheckSquare,
  FaMinusSquare,
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaColumns,
  FaCrosshairs,
  FaDrawPolygon,
  FaEllipsisH,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaFont,
  FaGlobeAmericas,
  FaMinus,
  FaObjectGroup,
  FaObjectUngroup,
  FaPlus,
  FaRuler,
  FaSearch,
  FaStar,
  FaSquare,
  FaTh
} from "react-icons/fa";
import { FaRegSquare, FaRegStar } from "react-icons/fa";
import spritesheet from "../sprite.svg";

const Polygon = () => (
  <svg
    className=""
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <use href={`${spritesheet}#polygon`} />
  </svg>
);
const Polyline = () => (
  <svg
    className=""
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <use href={`${spritesheet}#polyline`} />
  </svg>
);
const Rectangle = () => (
  <svg
    className=""
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <use href={`${spritesheet}#rectangle`} />
  </svg>
);

export const AddGroupIcon = MdPlaylistAdd;
export const AddRuleIcon = MdAdd;
export const AddIcon = MdAdd;
export const SortAscending = MdArrowUpward;
export const SortDescending = MdArrowDownward;
export const SelectIcon = MdTabUnselected;
export const ChevronLeftIcon = FaChevronLeft;
export const ChevronRightIcon = FaChevronRight;
export const ColumnsIcon = FaColumns;
export const CollapsedIcon = MdChevronRight;
export const CenterIcon = MdFilterCenterFocus;
export const DeleteIcon = MdDelete;
export const ExpandedIcon = MdExpandMore;
export const EditIcon = MdEdit;
export const TimeIcon = MdHourglassEmpty;
export const LayersIcon = MdLayers;
export const EntityPanelIcon = MdList;
export const QueryPanelIcon = FaSearch;
export const FilterPanelIcon = FaFilter;
export const GridPanelIcon = FaTh;
export const MiniMapIcon = MdPictureInPictureAlt;
export const CheckedIcon = FaCheckSquare;
export const UncheckedIcon = FaRegSquare;
export const IndeterminateCheckIcon = FaMinusSquare;
export const FilterIcon = FaFilter;
export const LabelToolIcon = FaFont;
export const PolylineToolIcon = Polyline;
export const PolygonToolIcon = Polygon;
export const BoxToolIcon = Rectangle;
export const CircleToolIcon = FaCircle;
export const GroupToolIcon = FaObjectGroup;
export const UngroupToolIcon = FaObjectUngroup;
export const MeasureToolIcon = FaRuler;
export const MoreIcon = FaEllipsisH;
export const WhatsHereToolIcon = FaCrosshairs;
export const FavoritedIcon = FaStar;
export const UnfavoritedIcon = FaRegStar;
export const GlobeIcon = FaGlobeAmericas;
export const ZoomInIcon = FaPlus;
export const ZoomOutIcon = FaMinus;
export const VisibleIcon = FaEye;
export const HiddenIcon = FaEyeSlash;
export const PullTrackIcon = MdTimeline;
export const OpenInNewIcon = MdOpenInNew;
export const CloseIcon = MdClose;
