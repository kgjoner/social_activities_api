import FormattedError, { ErrorTypes } from '../models/error.model';
import { Feed } from '../models/feed.model';

async function save(feed: Feed): Promise<boolean> {
	if (feed.list.length > 10) feed.list = feed.list.slice(-10);

	try {
		await feed.save();
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
	return true;
}

async function findOne(username: string): Promise<Feed> {
	try {
		return await Feed.get(username);
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
}

export const FeedDataAccess = {
	save,
	findOne,
};
