export interface IUser {
	displayName: string;
	email: string;
	hash_password?: string;
	created: Date;
	comparePassword: (password: string) => {};
}
