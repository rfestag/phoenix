//TODO: Investigate whether this works on older browsers. Proxy is a new features, but maybe there is
//a polyfill we can try?
export default class TimeSeries {
  constructor(data) {
    this.data = data || [];
    this.length = this.data.length;
  }
  findIndex(fn) {
    //Search backwards through the data. This is because,
    //in the most common cases, the item is close to the end
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (fn(this.data[i], i)) return i;
    }
    return -1;
  }
  insert(item) {
    const index = this.findIndex(({ time }) => time <= item.time);
    if (index === this.data.length - 1) {
      this.data.push(item);
    } else if (index > 0) {
      this.data.splice(index, 0, item);
    } else {
      this.data.unshift(item);
    }
    return new TimeSeries(this.data);
  }
  slice(first, last) {
    return new TimeSeries(this.data.slice(first, last));
  }
  splice(start, deleteCount) {
    return new TimeSeries(this.data.splice(start, deleteCount));
  }
  map(cb) {
    return this.data.map(cb);
  }
  reduce(cb, init) {
    return this.data.reduce(cb, init);
  }
  /*
  *[Symbol.iterator]() {
    for (const x of this.data) {
      yield x.value, x.time;
    }
  }
  */
}
/*
export default class TimeSeriesProxy extends TimeSeries {
  constructor(data) {
    super(data);
    return new Proxy(this, {
      get: (obj, prop) => {
        return obj[prop] ? obj[prop] : obj.data[parseInt(prop, 10)];
      }
    });
  }
}
*/
