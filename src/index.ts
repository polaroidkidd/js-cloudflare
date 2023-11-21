export interface CloudflareImageApiResponse<T> {
  errors: any[];
  messages: any[];
  result: Result<T>;
  success: boolean;
}

export interface Result<T> {
  continuation_token: string;
  images: T;
}

export interface Image {
  filename: string;
  id: string;
  meta: Meta;
  requireSignedURLs: boolean;
  uploaded: string;
  variants: string[];
}

export interface Meta {
  key: string;
}

export type ClientOptions = {
  accountIdentifier: string;
  bearerToken: string;
  rootPath: string | undefined;
};

export class Client {
  static _instanceCache: Client;
  #ENDPOINT_V2: string;
  #ENDPOINT_V1: string;
  #BEARER_TOKEN: string;
  #ROOT_PATH?: string;

  constructor({ accountIdentifier, bearerToken, rootPath }: ClientOptions) {
    this.#ENDPOINT_V2 = `https://api.cloudflare.com/client/v4/accounts/${accountIdentifier}/images/v2`;
    this.#ENDPOINT_V1 = `https://api.cloudflare.com/client/v4/accounts/${accountIdentifier}/images/v1`;
    this.#BEARER_TOKEN = bearerToken;
    this.#ROOT_PATH = rootPath;
  }


  
  async getImageById(id: string): Promise<CloudflareImageApiResponse<Image>> {
    return fetch(`${this.#ENDPOINT_V1}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.#BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "GET",
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
    return fetch(this.#ENDPOINT_V2, {
      headers: {
        Authorization: `Bearer ${this.#BEARER_TOKEN}`,
      },
      method: "GET",
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
                ),
              },
            }
          : data;
      });
  }
}
