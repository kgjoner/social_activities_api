import { User, IUser, IUserDoc } from '../models/user.model';
import FormattedError, { ErrorTypes } from '../models/error.model';
import { validateFieldsExistence } from '../utils/validators';

async function create(rawUser: IUser): Promise<string> {
	validateFieldsExistence(rawUser, ['username']);

	try {
		const user = new User(rawUser);
		await user.save();

		return user._id;
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
}

async function save(user: IUserDoc): Promise<boolean> {
	validateFieldsExistence(user, ['username']);

	try {
		await user.save();
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}

	return true;
}

async function findOne(username: string): Promise<IUserDoc> {
	validateFieldsExistence({ username });

	const user = await User.findOne({ username }).exec();

	if (!user) {
		throw new FormattedError(ErrorTypes.NotFound, 'Usuário não existe.');
	}

	return user;
}

async function listAll(): Promise<IUserDoc[]> {
	try {
		const users = await User.find({});
		return users;
	} catch (err) {
		throw new FormattedError(ErrorTypes.DatabaseError, err);
	}
}

export const UserDataAccess = {
	create,
	save,
	findOne,
	listAll,
};
