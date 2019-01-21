/* Types */
export const ENRICH_ENTITY = "ENRICH_ENTITY";

/* Actions */
export const enrichEntity = (cid, eid) => ({
  type: ENRICH_ENTITY,
  cid,
  eid
});
