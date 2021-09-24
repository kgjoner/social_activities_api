import { Request, Response } from 'express';
import { IActivity } from '../models';
import { ActivityDataAccess } from '../dataaccess/activity.dataaccess';
import { FeedController } from './feed.controller';

async function insertActivity(
	rawActivity: IActivity,
	followers: string[]
): Promise<void> {
	const activityId = await ActivityDataAccess.create(rawActivity);
	await FeedController.fanout(activityId, followers);
}

async function getActivities(req: Request, res: Response): Promise<void> {
	try {
		const activities = await ActivityDataAccess.listAll();

		res.json(activities);
	} catch (err) {
		res.status(err.status).send(err);
	}
}

export const ActivityController = {
	insertActivity,
	getActivities,
};
