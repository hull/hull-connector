import Hull from "hull";
import { Cache } from "hull/lib/infra";
import server from "./server";

const options = {
  hostSecret: process.env.SECRET || "1234",
  devMode: process.env.NODE_ENV === "development",
  port: process.env.PORT || 8082,
  Hull,
  clientConfig: {
    firehoseUrl: process.env.OVERRIDE_FIREHOSE_URL
  }
};

const connector = new Hull.Connector(options);
const app = server(connector, options);
connector.startApp(app);
