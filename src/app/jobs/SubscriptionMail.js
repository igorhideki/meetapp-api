import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        organizer: meetup.user.name,
        userName: user.name,
        userEmail: user.email,
        meetup: meetup.title,
        date: format(parseISO(meetup.date), "dd'/'MM'/'yyyy H:mm'h'"),
      },
    });
  }
}

export default new SubscriptionMail();
