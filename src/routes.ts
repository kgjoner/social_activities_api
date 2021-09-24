import { Express } from 'express';
import { ActivityController } from './controllers/activity.controller';
import { FeedController } from './controllers/feed.controller';
import { UserController } from './controllers/user.controller';

export function registerRoutes(app: Express): void {
	app.get('/ping', (req, res) => res.send('pong').status(200));

	app
		.route('/activities')
		.get(ActivityController.getActivities);

	app
		.route('/activities/:username')
		.get(ActivityController.getActivitiesDoneByAnUser);

	app
		.route('/feed/:username')
		.get(FeedController.getFeed);

	app
		.route('/users')
		.get(UserController.getUsers)
		.post(UserController.insertUser)
		.put(UserController.updateUser);

	app
		.route('/users/:username')
		.get(UserController.getUser);

	app
		.route('/users/:username/followers')
		.get(UserController.getFollowers)
		.post(UserController.followUser)
		.delete((req, res, next) =>
			UserController.followUser(req, res, next, { reverse: true })
		);
}
