import { NextFunction, Request, Response } from 'express';
import FormattedError, { ErrorTypes } from '../models/error.model';
import { UserDataAccess } from '../dataaccess/user.dataaccess';
import { ActivityController } from './activity.controller';
import { validateFieldsExistence } from '../utils/validators';
import { FeedController } from './feed.controller';
import mqPromise from '../amqp';
import lodash from 'lodash';

async function createUserQueue(username: string) {
	try {
		const mq = await mqPromise;
		mq.channel.assertQueue(username, { durable: true });
		mq.channel.consume(username, (msg) => {
			FeedController.addToFeed(username, msg.content.toString());
		}, { noAck: true })
	} catch(err) {
		throw new FormattedError(ErrorTypes.MessagingError, err);
	}
}

async function insertUser(req: Request, res: Response): Promise<void> {
	const body = req.body;

	try {
		await UserDataAccess.create(body);
		await createUserQueue(body.username);
	
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

		const mq = await mqPromise;

		if (reverse) {
			mq.channel.unbindQueue(actorUsername, mq.exchange, targetUsername);
			await ActivityController.revertActivity(activity);
			await FeedController.clearUserActivitiesFromAnothersFeed(
				targetUsername,
				actorUsername
			);
		} else {
			mq.channel.bindQueue(actorUsername, mq.exchange, targetUsername);
			await ActivityController.insertActivity(activity);
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

async function likeComic(
	req: Request,
	res: Response,
	next: NextFunction,
	{ reverse } = { reverse: false }
): Promise<void> {
	let { username: actorUsername } = req.query;
	const { comic } = req.params;
	actorUsername = actorUsername.toString();

	try {
		validateFieldsExistence({ username: actorUsername });

		const actor = await UserDataAccess.findOne(actorUsername);

		if (reverse) {
			if (!actor.favoriteComics.includes(comic)) {
				throw new FormattedError(
					ErrorTypes.RedundantAction,
					`${comic} já não está entre as favoritas de ${actorUsername}`
				);
			}
			actor.favoriteComics = actor.favoriteComics.filter(
				(u: string) => u !== comic
			);
		} else {
			if (actor.favoriteComics.includes(comic)) {
				throw new FormattedError(
					ErrorTypes.RedundantAction,
					`${comic} já está entre as favoritas de ${actorUsername}`
				);
			}

			actor.favoriteComics.push(comic);
		}

		await UserDataAccess.save(actor);

		const activity = {
			actor: actorUsername,
			action: 'like',
			target: comic,
			type: 'comic',
		} as const;

		if (reverse) {
			await ActivityController.revertActivity(activity);
		} else {
			await ActivityController.insertActivity(activity);
		}

		res.status(204).send();
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function readComic(req: Request, res: Response): Promise<void> {
	let { username: actorUsername } = req.query;
	const { comic } = req.params;
	actorUsername = actorUsername.toString();

	try {
		validateFieldsExistence({ username: actorUsername });

		const actor = await UserDataAccess.findOne(actorUsername);

		if (actor.readings.includes(comic)) {
			throw new FormattedError(
				ErrorTypes.RedundantAction,
				`${comic} já está entre as leituras de ${actorUsername}`
			);
		}

		actor.readings.push(comic);

		await UserDataAccess.save(actor);

		const activity = {
			actor: actorUsername,
			action: 'read',
			target: comic,
			type: 'comic',
		} as const;

		await ActivityController.insertActivity(activity);

		res.status(204).send();
	} catch (err) {
		res.status(err.status).send(err);
	}
}

export const UserController = {
	createUserQueue,
	insertUser,
	updateUser,
	getUsers,
	getUser,
	getFollowers,
	followUser,
	likeComic,
	readComic,
};
