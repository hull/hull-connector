import Promise from 'bluebird';
import { notifHandler } from 'hull/lib/utils';

const notify = notifHandler({
  handlers: {
    'user:update': ({ ship, client: hull }, messages = []) => {
      return Promise.all(
        messages.map(message => {
          message.user = hull.utils.groupTraits(message.user);
          message.user.account = hull.utils.groupTraits(message.user.account);
          return { message, ship, hull };
        })
      );
    },
  },
});

export default notify;
