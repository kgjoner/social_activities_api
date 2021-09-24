import { Activity, IActivity, IActivityDoc } from '../models/activity.model';
import FormattedError, { ErrorTypes } from '../models/error.model';
import { validateFieldsExistence } from '../utils/validators';
import { mountDescription } from '../utils/mountDescription';

async function create(rawActivity: IActivity): Promise<string> {
	validateFieldsExistence(rawActivity, ['actor', 'action', 'target', 'type']);
	rawActivity.description = mountDescription(rawActivity);

	try {
		const activity = new Activity(rawActivity);
		await activity.save();

		return activity._id;
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
}

async function findOne(activityId: string): Promise<IActivityDoc> {
	validateFieldsExistence({ activityId });

	const user = await Activity.findById(activityId).exec();

	if (!user) {
		throw new FormattedError(ErrorTypes.NotFound, 'Atividade não encontrada.');
	}

	return user;
}

async function listAll(): Promise<IActivityDoc[]> {
	try {
		const activities = await Activity.find({});
		return activities;
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
}

async function listByActor(actor: string): Promise<IActivityDoc[]> {
	validateFieldsExistence({ actor });

	try {
		const activities = await Activity.find({ actor });
		return activities;
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
}

export const ActivityDataAccess = {
	create,
	findOne,
	listAll,
	listByActor,
};
