import reducer from "./CollectionReducers";
import * as actions from "./CollectionActions";

describe("collection reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual({ collections: {}, focused: null });
  });
  it("should handle CREATE_COLLECTION", () => {
    expect(
      reducer(undefined, actions.createCollection("cid", "name", ["qid"]))
    ).toEqual({
      collections: {
        cid: {
          ageoff: { unit: "seconds", value: 30 },
          data: {},
          fields: {
            geometries: {},
            properties: {
              whenEnd: {
                _formatterName: "timeFormatter",
                _getterName: "timeGetter",
                _type: "time",
                field: "end",
                headerName: "Last seen",
                hide: false
              },
              whenStart: {
                _formatterName: "timeFormatter",
                _getterName: "timeGetter",
                _type: "time",
                field: "start",
                headerName: "First seen",
                hide: false
              }
            }
          },
          id: "cid",
          name: "name",
          queries: ["qid"],
          selected: {},
          visible: true
        }
      },
      current: "cid",
      focused: null
    });
  });
});
