import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { page = 1, date } = req.query;
    const auxOffset = page > 1 ? 1 : 0;
    const parseDate = parseISO(date);
    const limit = 10;
    const where = {};

    if (date) {
      where.date = {
        [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      offset: (page - 1) * limit + auxOffset,
      limit,
      subQuery: false,
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
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
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const scheme = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await scheme.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, date, banner_id } = req.body;
    const dateParse = parseISO(date);

    if (isBefore(dateParse, new Date())) {
      return res.status(400).json({ error: 'Past dates is not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
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
      banner_id: Yup.number(),
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
      return res.status(400).json({ error: "Can't update past meetups" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(401).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups" });
    }

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
