export type BaseClientOptions = {
	accountIdentifier: string;
	bearerToken: string;
};

export class BaseClient {
	static BASE_ENDPOINT: string;

	static BEARER_TOKEN: string;

	constructor({ accountIdentifier, bearerToken }: BaseClientOptions) {
		BaseClient.BASE_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${accountIdentifier}`;
		BaseClient.BEARER_TOKEN = bearerToken;
	}
}
