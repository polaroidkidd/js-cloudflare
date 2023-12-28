# Cloudflare JS bindings

[Cloudflare v4 API][cf-api] bindings for JS (ie. Cloudflare Worker compatible), providing a sourdough
"BREAD" (Browse, Read, Edit, Add, and Delete) interface.

[cf-api]: https://api.cloudflare.com/

## Currently Supported Operations

### Images

- [List images V2](https://developers.cloudflare.com/api/operations/cloudflare-images-list-images)
- [Image Details](https://developers.cloudflare.com/api/operations/cloudflare-images-image-details)
- [Post Image](https://developers.cloudflare.com/api/operations/cloudflare-images-upload-an-image-via-url)
- [Delete Image](https://developers.cloudflare.com/api/operations/cloudflare-images-delete-image)

## Configuration

Import the endpoints you'll need and instantiate them.

```js
import { Images } from 'js-cloudflare';

const cfImageClient = new Images({
	accountIdentifier: YOUR_ACCOUNT_IDENTIFIER,
	bearerToken: YOUR_API_TOKEN,
	rootPath: 'customPrefix'
});
const result = await cfImageClient.getImageById('ce743595-39f3-4105-8d97-caeb3d69cf1f');
```

Response

```JSON
{
  "errors": [],
  "messages": [],
  "result": {
    "filename": "logo.png",
    "id": "ce743595-39f3-4105-8d97-caeb3d69cf1f",
    "meta": {
      "key": "value"
    },
    "requireSignedURLs": true,
    "uploaded": "2014-01-02T02:20:00.123Z",
    "variants": [
      "https://imagedelivery.net/MTt4OTd0b0w5aj/ce743595-39f3-4105-8d97-caeb3d69cf1f/thumbnail",
      "https://imagedelivery.net/MTt4OTd0b0w5aj/ce743595-39f3-4105-8d97-caeb3d69cf1f/hero",
      "https://imagedelivery.net/MTt4OTd0b0w5aj/ce743595-39f3-4105-8d97-caeb3d69cf1f/original"
    ]
  },
  "success": true
}
```

## Roadmap

1. Complete the Images API endpoints (CRUD)
2. Open for suggestions
