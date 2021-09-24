import mongoose from 'mongoose';

export interface IUser {
	_id?: string;
	schema_version?: string;
	username: string;
	picture?: string;
	followers?: string[];
	following?: string[];
	favoriteComics?: string[];
}

export type IUserDoc = IUser & mongoose.Document<any, any, IUser>;

export const userSchema = new mongoose.Schema<IUser>({
	schema_version: {
		type: Number,
		default: 1,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	picture: String,
	followers: [String],
	following: [String],
	favoriteComics: [String],
});

export const User = mongoose.model<IUser>('User', userSchema);
