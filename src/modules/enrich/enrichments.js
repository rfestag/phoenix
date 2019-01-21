import adsbClient from "../../clients/adsbApollo";
import { updateCollection } from "../collection/CollectionActions";
import _ from "lodash";
const codeBlocks = adsbClient.codeBlocks();

export const aircraftInfo = (entities, action) => {
  let ModeSList = entities.map(e => e.id);
  let chunks = _.chunk(ModeSList, 100);
  let promises = chunks.map(values => {
    return adsbClient
      .aircraft({ field: "ModeS", op: "in", values })
      .then(resp => {
        return resp.data.aircraft;
      })
      .catch(err => {
        console.log("Error", err);
        return undefined;
      });
  });
  return Promise.all(promises).then(responses => {
    let time = Date.now();
    let hasData = false;
    let data = _.reduce(
      responses,
      (data, response) => {
        return _.reduce(
          response,
          (data, aircraft) => {
            if (!aircraft) return data;
            let properties = _.reduce(
              aircraft,
              (properties, value, k) => {
                properties[k] = { time, value };
                return properties;
              },
              {}
            );
            hasData = true;
            data[aircraft.ModeS] = [{ id: aircraft.ModeS, time, properties }];
            return data;
          },
          data
        );
      },
      {}
    );
    return hasData ? updateCollection(action.id, action.qid, data) : undefined;
  });
};
export const codeBlock = (entities, action) => {
  return codeBlocks.then(cbs => {
    let hasData = false;
    let data = entities.reduce((data, entity) => {
      //The is the ModeS, so we just use it here for simplicity
      let mask = parseInt(entity.id, 16); //Parse as hex
      let block = cbs.data.codeBlocks.find(
        cb => cb.SignificantBitMask & (mask === cb.BitMask)
      );
      let time = Date.now();
      if (block) {
        hasData = true;
        let properties = {
          CodeBlockCountry: { time, value: block.Country },
          IsMilitary: { time, value: block.IsMilitary }
        };
        data[entity.id] = [{ id: entity.id, time, properties }];
      }
      return data;
    }, {});
    return hasData ? updateCollection(action.id, action.qid, data) : undefined;
  });
};
