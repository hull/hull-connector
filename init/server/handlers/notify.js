const Promise = require("bluebird";
const { smartNotifierHandler, notifyHandler } = require("hull/lib/utils");

const notify = smartNotifierHandler({
  handlers: {
    'user:update': (
      { smartNotifierResponse, ship, client: hull },
      messages = []
    ) => {
      messages.map(message => {
        console.log(message);
      });
      // Get 100 users every 100ms at most.
      smartNotifierResponse.setFlowControl({
        type: 'next',
        size: 100,
        in: 100,
      });
      return Promise.resolve();
    },
  },
});

module.exports = notify;
