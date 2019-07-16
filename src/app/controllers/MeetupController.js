import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const scheme = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await scheme.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, date } = req.body;
    const dateParse = parseISO(date);

    if (isBefore(dateParse, new Date())) {
      return res.status(400).json({ error: 'Past dates is not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const scheme = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await scheme.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'This meetup not exists' });
    }

    if (req.userId !== meetup.user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const parseDate = req.body.date ? parseISO(req.body.date) : '';

    if (parseDate) {
      if (isBefore(parseDate, new Date())) {
        return res.status(400).json({ error: 'Past dates is not permitted' });
      }
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }
}

export default new MeetupController();
