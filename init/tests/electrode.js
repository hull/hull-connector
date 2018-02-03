const electrode = require("hull-connector-dev/lib/electrode").default;
const server = require("../server/server").default;

electrode(server);
