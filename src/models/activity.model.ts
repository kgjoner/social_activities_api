import mongoose from 'mongoose';

export interface IActivity {
	_id?: string;
	schema_version?: string;
	actor: string;
	action: 'follow' | 'like' | 'read';
	target: string;
	type: 'user' | 'collection' | 'comic';
	datetime?: Date;
	title?: string;
	description?: string;
	image?: string;
	permalink?: string;
	reverted?: boolean;
}

export type IActivityDoc = IActivity & mongoose.Document<any, any, IActivity>;

export const activitySchema = new mongoose.Schema<IActivity>({
	schema_version: {
		type: Number,
		default: 1,
	},
	actor: {
		type: String,
		required: true,
	},
	action: {
		type: String,
		required: true,
	},
	target: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	datetime: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	description: {
		type: String,
		required: true,
	},
	title: String,
	image: String,
	permalink: String,
	reverted: Boolean,
});

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
