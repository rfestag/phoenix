export const updateWhen = (shape, time) => {
  if (shape.when.start) {
    if (time < shape.when.start) shape.when.start = time;
  } else {
    shape.when.start = time;
  }
  if (shape.when.end) {
    if (time > shape.when.end) shape.when.end = time;
  } else {
    shape.when.end = time;
  }
};
