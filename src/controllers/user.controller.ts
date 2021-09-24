import { NextFunction, Request, Response } from 'express';
import FormattedError, { ErrorTypes } from '../models/error.model';
import { UserDataAccess } from '../dataaccess/user.dataaccess';
import { ActivityController } from './activity.controller';
import { validateFieldsExistence } from '../utils/validators';
import lodash from 'lodash';
import { FeedController } from './feed.controller';

async function insertUser(req: Request, res: Response): Promise<void> {
	const body = req.body;

	try {
		await UserDataAccess.create(body);

		res.status(204).send();
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function updateUser(req: Request, res: Response): Promise<void> {
	const body = req.body;

	try {
		const user = await UserDataAccess.findOne(body.username);

		lodash.merge(user, body);
		await UserDataAccess.save(user);

		res.status(204).send();
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function getUsers(req: Request, res: Response): Promise<void> {
	try {
		const users = await UserDataAccess.listAll();

		res.json(users);
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function getUser(req: Request, res: Response): Promise<void> {
	const { username } = req.params;

	try {
		const user = await UserDataAccess.findOne(username);

		res.json(user);
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function getFollowers(req: Request, res: Response): Promise<void> {
	const { username } = req.params;

	try {
		const user = await UserDataAccess.findOne(username);

		res.json(user.followers);
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function followUser(
	req: Request,
	res: Response,
	next: NextFunction,
	{ reverse } = { reverse: false }
): Promise<void> {
	let { username: actorUsername } = req.query;
	const { username: targetUsername } = req.params;
	actorUsername = actorUsername.toString();

	try {
		validateFieldsExistence({ username: actorUsername });

		const actor = await UserDataAccess.findOne(actorUsername);
		const target = await UserDataAccess.findOne(targetUsername);

		if (reverse) {
			if (!actor.following.includes(targetUsername)) {
				throw new FormattedError(
					ErrorTypes.RedundantAction,
					`${actorUsername} já não segue ${targetUsername}`
				);
			}
			actor.following = actor.following.filter(
				(u: string) => u !== targetUsername
			);
			target.followers = target.followers.filter(
				(u: string) => u !== actorUsername
			);
		} else {
			if (actor.following.includes(targetUsername)) {
				throw new FormattedError(
					ErrorTypes.RedundantAction,
					`${actorUsername} já segue ${targetUsername}`
				);
			}

			actor.following.push(targetUsername);
			target.followers.push(actorUsername);
		}

		await UserDataAccess.save(actor);
		await UserDataAccess.save(target);

		const activity = {
			actor: actorUsername,
			action: 'follow',
			target: targetUsername,
			type: 'user',
		} as const;

		if (reverse) {
			await ActivityController.revertActivity(activity);
			await FeedController.clearUserActivitiesFromAnothersFeed(
				targetUsername,
				actorUsername
			);
		} else {
			await ActivityController.insertActivity(activity, actor.followers || []);
			await FeedController.mergeUserActivitiesIntoAnothersFeed(
				targetUsername,
				actorUsername
			);
		}

		res.status(204).send();
	} catch (err) {
		res.status(err.status).send(err);
	}
}

export const UserController = {
	insertUser,
	updateUser,
	getUsers,
	getUser,
	getFollowers,
	followUser,
};
