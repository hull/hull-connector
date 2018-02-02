import Hull from 'hull';

export default function initializeContext(
  context,
  hull,
  { HULL_ID, HULL_ORG }
) {
  context.hull = hull;
  context.hullClient = hull;
  context.connector = HULL_ID;
  context.organization = HULL_ORG;
  context.moment = require('moment');
  context.lo = _;
}
