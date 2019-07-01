import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';

const routes = new Router();

routes.post('/session', SessionController.store);
routes.post('/users', UserController.store);

routes.put('/users', UserController.update);

export default routes;
