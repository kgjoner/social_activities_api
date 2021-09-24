import redisClient from '../redis';

export class Feed {
	public list: string[];
	public username: string;
	private key: string;

	static async get(username: string): Promise<Feed> {
		const data = await redisClient.get(`feed:${username}`);
		const feed = data ? JSON.parse(data) : [];
		return new Feed(feed, username);
	}

	constructor(feed: string[], username: string) {
		this.list = feed;
		this.username = username;
		this.key = `feed:${username}`;
	}

	public async save(): Promise<void> {
		await redisClient.set(this.key, JSON.stringify(this.list));
	}
}
