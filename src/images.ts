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

type ImageClientOptions = BaseClientOptions & {
	rootPath: string | undefined;
};

export type CloudflareImageApiResponseGetImageById = Promise<CloudflareImageApiResponse<Image>>;

export type CloudflareImageApiResponseListImages = Promise<CloudflareImageApiResponse<Image[]>>;

export type CloudflareImageApiResponsePost = Promise<CloudflareImageApiResponse<Image>>;

export type CloudflareImageApiResponseDelete = Promise<
	CloudflareImageApiResponse<Record<string, never>>
>;
export class Images extends BaseClient {
	#ROOT_PATH: string;
	#IMAGE_ENDPOINT_V1: string;
	#IMAGE_ENDPOINT_V2: string;

	constructor({ accountIdentifier, bearerToken, rootPath = '' }: ImageClientOptions) {
		super({ accountIdentifier, bearerToken });
		if (rootPath && rootPath.startsWith('/')) {
			throw new Error("rootPath cannot start with a '/'");
		}
		this.#ROOT_PATH = rootPath;
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
	 * If a rootPath is provided during instantiation, only images with an id starting with the rootPath will be returned.
	 * @returns A Promise that resolves to a CloudflareImageApiResponse containing an array of Image objects.
	 */
	async listImages(): CloudflareImageApiResponseListImages {
		return fetch(this.#IMAGE_ENDPOINT_V2, {
			headers: {
				Authorization: `Bearer ${Images.BEARER_TOKEN}`
			},
			method: 'GET'
		})
			.then((response) => {
				return response.json() as CloudflareImageApiResponseListImages;
			})
			.then((data) => {
				return {
					...data,
					result: {
						...data.result,
						images: data.result.images.filter((image) =>
							image.id.startsWith(this.#ROOT_PATH as string)
						)
					}
				};
			});
	}

	/**
	 * Uploads an image to the specified path.
	 * @param image - The image file to upload.
	 * @param path - The path where the image will be served from.
	 * @returns A promise that resolves to the API response containing the uploaded image information.
	 */
	async postImage(image: File, path: string): CloudflareImageApiResponsePost {
		const form = new FormData();
		const publicPath = path.startsWith(this.#ROOT_PATH) ? path.slice(this.#ROOT_PATH.length) : path;

		form.append('file', new Blob([image]));
		form.append('id', publicPath);
		return fetch(this.#IMAGE_ENDPOINT_V2, {
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
