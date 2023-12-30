import { BaseClient, BaseClientOptions } from './baseClient';

type CloudflareImageApiResponse<T> = {
	errors: Error[];
	messages: Message[];
	result: T extends Image[] ? Result<T> : T;
	success: boolean;
};
type Error = {
	code: number;
	message: string;
};

type Message = {
	code: number;
	message: string;
};

type Result<T> = {
	continuation_token: string;
	images: T;
};

type Image = {
	filename: string;
	id: string;
	meta: Meta;
	requireSignedURLs: boolean;
	uploaded: string;
	variants: string[];
};

type Meta = {
	key: string;
};

type ImageClientOptions = BaseClientOptions;

export type CloudflareImageApiResponseGetImageById = Promise<CloudflareImageApiResponse<Image>>;

export type CloudflareImageApiResponseListImages = Promise<CloudflareImageApiResponse<Image[]>>;

export type CloudflareImageApiResponsePost = Promise<CloudflareImageApiResponse<Image>>;

export type CloudflareImageApiResponseDelete = Promise<
	CloudflareImageApiResponse<Record<string, never>>
>;
export class Images extends BaseClient {
	#IMAGE_ENDPOINT_V1: string;
	#IMAGE_ENDPOINT_V2: string;

	constructor({ accountIdentifier, bearerToken }: ImageClientOptions) {
		super({ accountIdentifier, bearerToken });

		this.#IMAGE_ENDPOINT_V1 = `${BaseClient.BASE_ENDPOINT}/images/v1`;
		this.#IMAGE_ENDPOINT_V2 = `${BaseClient.BASE_ENDPOINT}/images/v2`;
	}

	/**
	 * Retrieves an image by its ID from the Cloudflare API.
	 * @param id - The ID of the image to retrieve.
	 * @returns A promise that resolves to the response from the Cloudflare API.
	 */
	async getImageById(id: string): CloudflareImageApiResponseGetImageById {
		return fetch(`${this.#IMAGE_ENDPOINT_V1}/${id}`, {
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`,
				'Content-Type': 'application/json'
			},
			method: 'GET'
		}).then((response) => {
			return response.json() as CloudflareImageApiResponseGetImageById;
		});
	}

	/**
	 * Retrieves a list of images from the Cloudflare API.
	 * @returns A Promise that resolves to a CloudflareImageApiResponse containing an array of Image objects.
	 */
	async listImages(): CloudflareImageApiResponseListImages {
		return fetch(this.#IMAGE_ENDPOINT_V2, {
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`
			},
			method: 'GET'
		}).then((response) => {
			return response.json() as CloudflareImageApiResponseListImages;
		});
	}

	/**
	 * Uploads an image to the specified path.
	 * @param image - The image file to upload.
	 * @param path - The path where the image will be served from.
	 * @returns A promise that resolves to the API response containing the uploaded image information.
	 */
	async postImage(image: File, path: string): CloudflareImageApiResponsePost {
		if (path.startsWith('/')) {
			throw new Error("path cannot start with a '/'");
		}

		const form = new FormData();

		form.append('file', new Blob([image]));
		form.append('id', path);
		return fetch(this.#IMAGE_ENDPOINT_V1, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`
			},
			body: form
		}).then((response) => {
			return response.json() as CloudflareImageApiResponsePost;
		});
	}

	/**
	 * Deletes an image from the Cloudflare API.
	 * @param id - The id of the image to delete.
	 * @returns A promise that resolves to the API response.
	 */
	async deleteImage(id: string): CloudflareImageApiResponseDelete {
		return fetch(`${this.#IMAGE_ENDPOINT_V1}/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`,
				Header: 'Content-Type: application/json'
			}
		}).then((response) => {
			return response.json() as CloudflareImageApiResponseDelete;
		});
	}
}
