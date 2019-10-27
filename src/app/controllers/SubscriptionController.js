import { isSameMinute } from 'date-fns';
import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      attributes: ['id'],
      include: {
        model: Meetup,
        as: 'meetup',
        where: { date: { [Op.gt]: new Date() } },
        attributes: ['title', 'description', 'location', 'banner_id', 'date'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
          },
          {
            model: File,
            as: 'banner',
            attributes: ['id', 'path', 'url'],
          },
        ],
      },
      order: [['meetup', 'date']],
    });

    return res.json(subscriptions);
  }

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

    if (!meetup) {
      return res.status(400).json({ error: 'This meetup is not exists' });
    }

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

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
