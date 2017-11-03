import Promise from 'bluebird';
import { notifHandler } from 'hull/lib/utils';

const notify = notifHandler({
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

export default notify;
