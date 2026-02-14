# ImageDownload Plugin for HugeRTE

The `imagedownload` plugin adds the ability to download external images that were inserted via URLs and convert them to local blobs or data URIs. This is particularly useful when copying content from external sources like Google Docs that contain images hosted on external servers.

## Features

- **Download Single Image**: Right-click on any external image to download it to local
- **Download All Images**: Download all external images in the editor at once
- **Context Menu Integration**: Quick access via context menu on external images
- **Automatic Upload Support**: Works with HugeRTE's automatic upload feature
- **Dialog Interface**: Select which external images to download

## Installation

Add the `imagedownload` plugin to your HugeRTE configuration:

```javascript
tinymce.init({
  selector: 'textarea',
  plugins: 'image imagedownload',
  toolbar: 'imagedownload imagedownloadall'
});
```

## Toolbar Buttons

- `imagedownload` - Opens a dialog to select and download external images
- `imagedownloadall` - Downloads all external images in the editor

## Context Menu

Right-click on an external image to see the "Download image to local" option.

## Commands

The plugin provides the following editor commands:

- `mceDownloadImage` - Opens the download dialog
- `mceDownloadExternalImages` - Downloads external images in current selection
- `mceDownloadAllExternalImages` - Downloads all external images in the editor

Example usage:
```javascript
// Download all external images
editor.execCommand('mceDownloadAllExternalImages');

// Download images in selection
editor.execCommand('mceDownloadExternalImages');
```

## Configuration Options

### `image_download_options`

Configure download behavior:

```javascript
tinymce.init({
  selector: 'textarea',
  plugins: 'image imagedownload',
  image_download_options: {
    maxFileSize: 10 * 1024 * 1024,  // 10MB max file size (default)
    allowedDomains: [],              // Array of allowed domains (empty = all)
    convertToDataUri: false         // Convert to data URI instead of blob
  }
});
```

### Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxFileSize` | number | 10485760 (10MB) | Maximum file size for downloaded images |
| `allowedDomains` | string[] | [] | Whitelist of allowed domains (empty allows all) |
| `convertToDataUri` | boolean | false | Convert images to data URIs instead of blob URIs |

## How It Works

1. When you paste content from external sources (like Google Docs), images may reference external URLs
2. The plugin identifies images with external URLs (not `data:` or `blob:` URLs)
3. On download, the plugin:
   - Fetches the image via `fetch()` API
   - Creates a local blob from the image data
   - If `automatic_uploads` is enabled, uploads the image to your server
   - Replaces the external URL with the local blob URL or uploaded URL

## Browser Compatibility

- Requires browsers that support the `fetch()` API
- Images must allow cross-origin access (CORS) for downloading to work
- Images from servers without proper CORS headers cannot be downloaded

## Security Considerations

- The plugin respects HugeRTE's `allow_html_data_urls` option
- External URLs are validated to prevent script injection
- Images are downloaded with `mode: 'cors'` which requires proper server configuration

## Known Limitations

- Images from servers without CORS headers cannot be downloaded
- Large images may cause performance issues when converting to data URIs
- Some image hosting services may block cross-origin requests
