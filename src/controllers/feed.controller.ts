import { Request, Response } from 'express';
import { IActivity } from '../models';
import { Feed } from '../models/feed.model';
import { FeedDataAccess } from '../dataaccess/feed.dataaccess';
import { ActivityDataAccess } from '../dataaccess/activity.dataaccess';

async function addToFeed(username: string, activityId: string) {
	const feed = await FeedDataAccess.findOne(username);
	feed.list.unshift(activityId);
	await FeedDataAccess.save(feed);
}

async function denormalizeFeed(normalizedFeed: Feed): Promise<IActivity[]> {
	const feedPromise = normalizedFeed.list.map(async activityId => {
		return await ActivityDataAccess.findById(activityId);
	});
	return Promise.all(feedPromise).then((feed) => feed.filter((a) => !a.reverted));
}

async function mergeUserActivitiesIntoAnothersFeed(
	actorUsername: string,
	feedOwner: string
): Promise<void> {
	const actorActivities = await ActivityDataAccess.listByActor(actorUsername);
	const feed = await FeedDataAccess.findOne(feedOwner);
	const denormalizedFeed = await denormalizeFeed(feed);

	feed.list = [...actorActivities, ...denormalizedFeed]
		.sort((a, b) => a.datetime > b.datetime ? -1 : 1)
		.map(a => a._id);

	FeedDataAccess.save(feed);
}

async function clearUserActivitiesFromAnothersFeed(
	actorUsername: string,
	feedOwner: string
): Promise<void> {
	const feed = await FeedDataAccess.findOne(feedOwner);
	const denormalizedFeed = await denormalizeFeed(feed);

	feed.list = denormalizedFeed
		.filter(a => a.actor !== actorUsername)
		.map(a => a._id);

	FeedDataAccess.save(feed);
}

async function getFeed(req: Request, res: Response): Promise<void> {
	const { username } = req.params;
	const normalizedFeed = await FeedDataAccess.findOne(username);

	try {
		const denormalizedFeed = await denormalizeFeed(normalizedFeed);
		res.json(denormalizedFeed);
	} catch (err) {
		res.status(err.status).send(err);
	}
}

export const FeedController = {
	addToFeed,
	getFeed,
	mergeUserActivitiesIntoAnothersFeed,
	clearUserActivitiesFromAnothersFeed,
};
