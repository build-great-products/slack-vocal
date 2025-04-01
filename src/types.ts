export type UserInfo = {
	id: string;
	name: string;
};

export type MessageCounts = {
	[date: string]: number;
};

export type UserMessageCounts = {
	[userId: string]: MessageCounts;
};

export type SlackConfig = {
	token: string;
	users: UserInfo[];
};
