import Meetup from '../models/Meetup';
import User from '../models/User';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      attributes: [
        'title',
        'description',
        'location',
        'date',
        'past',
        'banner_id',
      ],
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();
