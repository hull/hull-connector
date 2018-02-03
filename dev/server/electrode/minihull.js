import _ from "lodash";
import Minihull from "minihull";
import colorize from "json-colorizer";
import boxen from "boxen";
import jwt from "jwt-simple";

export default function Mini(
  { segments, connector, hullPort, port, endpoint },
  callback = () => {}
) {
  try {
    const minihull = new Minihull();
    minihull.listen(hullPort, callback);
    minihull.stubSegments(segments);
    minihull.on("incoming.request@/api/v1/firehose", req => {
      const response = req.body.batch.map(r => ({
        ...r,
        claims: jwt.decode(r.headers["Hull-Access-Token"], "", true)
      }));
      console.log(boxen("Received Firehose Payload"));
      console.log(colorize(JSON.stringify(response)));
    });

    minihull.userUpdate = (messages = []) => {
      console.log(boxen("Sending update"));
      if (!_.isArray(messages)) {
        throw new Error(
          "The messages in userUpdate was not an array of users."
        );
      }
      console.log(colorize(JSON.stringify(messages, null, 2)));
      minihull
        .smartNotifyConnector(
          connector,
          `http://localhost:${port}${endpoint}`,
          "user:update",
          messages
        )
        .catch(e => {
          console.log(e);
          throw e;
        });
    };
    return minihull;
  } catch (e) {
    console.log(e);
  }
}
