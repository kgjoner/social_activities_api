import { Request, Response } from 'express';
import { IActivity } from '../models';
import FormattedError, { ErrorTypes } from '../models/error.model';
import { ActivityDataAccess } from '../dataaccess/activity.dataaccess';
import mqPromise from '../amqp';

async function insertActivity(rawActivity: IActivity): Promise<void> {
	const activityId = await ActivityDataAccess.create(rawActivity);

	try {
		const mq = await mqPromise;
		mq.channel.publish(mq.exchange, rawActivity.actor, Buffer.from(activityId.toString()));
	} catch(err) {
		throw new FormattedError(ErrorTypes.MessagingError, err);
	}
}

async function revertActivity(rawActivity: IActivity): Promise<void> {
	const activity = await ActivityDataAccess.findOne(rawActivity);
	activity.reverted = true;
	await ActivityDataAccess.update(activity);
}

async function getActivities(req: Request, res: Response): Promise<void> {
	try {
		const activities = await ActivityDataAccess.listAll();

		res.json(activities);
	} catch (err) {
		res.status(err.status).send(err);
	}
}

async function getActivitiesDoneByAnUser(
	req: Request,
	res: Response
): Promise<void> {
	const { username } = req.params;

	try {
		const activities = await ActivityDataAccess.listByActor(username);

		res.json(activities.filter(a => !a.reverted));
	} catch (err) {
		res.status(err.status).send(err);
	}
}

export const ActivityController = {
	insertActivity,
	revertActivity,
	getActivities,
	getActivitiesDoneByAnUser,
};
