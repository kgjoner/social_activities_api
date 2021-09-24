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

async function update(activity: IActivityDoc): Promise<string> {
	validateFieldsExistence(activity, ['actor', 'action', 'target', 'type']);

	try {
		await activity.save();

		return activity._id;
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
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

async function findById(activityId: string): Promise<IActivityDoc> {
	validateFieldsExistence({ activityId });

	const activity = await Activity.findById(activityId).exec();

	if (!activity) {
		throw new FormattedError(ErrorTypes.NotFound, 'Atividade não encontrada.');
	}

	return activity;
}

async function findOne(rawActivity: IActivity): Promise<IActivityDoc> {
	validateFieldsExistence(rawActivity, ['actor', 'action', 'target', 'type']);

	const activity = await Activity.findOne(rawActivity).sort({ datetime: -1 }).exec();

	if (!activity) {
		throw new FormattedError(ErrorTypes.NotFound, 'Atividade não encontrada.');
	}

	return activity;
}

export const ActivityDataAccess = {
	create,
  update,
	listAll,
	listByActor,
  findById,
	findOne,
};
