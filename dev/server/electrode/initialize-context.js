import _ from "lodash";
import moment from "moment";
import urijs from "urijs";
import colorize from "json-colorizer";

export default function initializeContext({
  context,
  minihull,
  hull,
  config,
  connector,
  segments
}) {
  const { HULL_ORG } = config;
  context.send = p => minihull.userUpdate(_.isArray(p) ? p : [p]);
  context.colorize = colorize;
  context.segments = segments;
  context.minihull = minihull;
  context.hull = hull;
  context.hullClient = hull;
  context.connector = connector;
  context.organization = HULL_ORG;
  context.moment = moment;
  context.lo = _;
  context.urijs = urijs;
}
