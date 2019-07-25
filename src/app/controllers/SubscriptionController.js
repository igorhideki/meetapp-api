import { isSameMinute, format } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Mail from '../../lib/Mail';

class SubscriptionController {
  async store(req, res) {
    const meetupId = Number(req.params.meetupId);
    const meetup = await Meetup.findByPk(meetupId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (meetup.past) {
      return res.status(400).json({ error: "Can't subscribe in meetup past" });
    }

    const userSubscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: {
        model: Meetup,
        as: 'meetup',
        atributtes: ['date'],
      },
    });

    const hasSubscriptionInMeetup = userSubscriptions.find(
      subscription => subscription.meetup_id === meetupId
    );

    if (hasSubscriptionInMeetup) {
      return res
        .status(400)
        .json({ error: 'You already subscribed for this meetup' });
    }

    const hasMeetupSameDate = userSubscriptions.find(subscription =>
      isSameMinute(subscription.meetup.date, meetup.date)
    );

    if (hasMeetupSameDate) {
      return res
        .status(400)
        .json({ error: 'You already have a meetup for this date' });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetupId,
    });

    const user = await User.findByPk(req.userId);

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        organizer: meetup.user.name,
        userName: user.name,
        userEmail: user.email,
        meetup: meetup.title,
        date: format(meetup.date, "dd'/'MM'/'yyyy H:mm'h'"),
      },
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
