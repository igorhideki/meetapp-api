import User from '../models/User';

class UserController {
  async store(req, res) {
    const { email } = req.body;
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create(req.body);

    return res.json(user);
  }

  async update(req, res) {
    return res.json({ ok: true });
  }
}

export default new UserController();
