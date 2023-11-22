import { BaseClient, BaseClientOptions } from './baseClient';

export type CloudflareImageApiResponse<T> = {
	errors: Error[];
	messages: Message[];
	result: Result<T>;
	success: boolean;
};
export type Error = {
	code: number;
	message: string;
};

export type Message = {
	code: number;
	message: string;
};

export type Result<T> = {
	continuation_token: string;
	images: T;
};

export type Image = {
	filename: string;
	id: string;
	meta: Meta;
	requireSignedURLs: boolean;
	uploaded: string;
	variants: string[];
};

export type Meta = {
	key: string;
};

export type ImageClientOptions = BaseClientOptions & {
	rootPath: string | undefined;
};

export class Images extends BaseClient {
	#ROOT_PATH?: string;
	#IMAGE_ENDPOINT_V1: string;
	#IMAGE_ENDPOINT_V2: string;

	constructor({ accountIdentifier, bearerToken, rootPath }: ImageClientOptions) {
		super({ accountIdentifier, bearerToken });
		this.#ROOT_PATH = rootPath;
		this.#IMAGE_ENDPOINT_V1 = `${BaseClient.BASE_ENDPOINT}/images/v1`;
		this.#IMAGE_ENDPOINT_V2 = `${BaseClient.BASE_ENDPOINT}/images/v2`;
	}

	async getImageById(id: string): Promise<CloudflareImageApiResponse<Image>> {
		return fetch(`${this.#IMAGE_ENDPOINT_V1}/${id}`, {
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`,
				'Content-Type': 'application/json'
			},
			method: 'GET'
		}).then((response) => {
			return response.json() as Promise<CloudflareImageApiResponse<Image>>;
		});
	}

	/**
	 * Retrieves a list of images from the Cloudflare API.
	 * If a rootPath is provided during instantiation, only images with an id starting with the rootPath will be returned.
	 * @returns A Promise that resolves to a CloudflareImageApiResponse containing an array of Image objects.
	 */
	async listImages(): Promise<CloudflareImageApiResponse<Image[]>> {
		return fetch(this.#IMAGE_ENDPOINT_V2, {
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`
			},
			method: 'GET'
		})
			.then((response) => {
				return response.json() as Promise<CloudflareImageApiResponse<Image[]>>;
			})
			.then((data) => {
				return this.#ROOT_PATH !== undefined
					? {
							...data,
							result: {
								...data.result,
								images: data.result.images.filter((image) =>
									image.id.startsWith(this.#ROOT_PATH as string)
								)
							}
					  }
					: data;
			});
	}
}
