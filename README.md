# Google Fonts Gemini CLI Extension

A Gemini CLI extension for searching and utilizing Google Fonts and Material Icons directly within your projects.

## Description

This extension provides a seamless way to search the extensive library of Google Fonts and the vast collection of Material Icons. Find the perfect typography and iconography for your projects without leaving your command line.

## Requirements

- Node.js v24 or higher

## Installation

To install this extension, use the following command:

```bash
gemini extension install https://github.com/rodydavis/google-fonts-gemini-cli-extension
```

## Usage

This extension provides the following tools:

### `search_fonts`

Search the Google Fonts database.

**Parameters:**

*   `name`: The name of the font to search for.
*   `category`: The category of the font (e.g., `serif`, `sans-serif`, `display`, `handwriting`, `monospace`).
*   `is_variable`: A boolean to filter for variable fonts.
*   `tag`: A tag to filter the fonts by.

**Example:**

```
search_fonts(name="Roboto", category="sans-serif")
```

### `search_icons`

Search the Google Fonts icons database.

**Parameters:**

*   `name`: The name of the icon to search for.
*   `category`: The category of the icon.

**Example:**

```
search_icons(name="settings")
```

### `search_font_tags`

Search for font tags in the Google Fonts database.

**Parameters:**

*   `name`: The name of the tag to search for.

**Example:**

```
search_font_tags(name="display")
```

### `get_icon_categories`

Get all icon categories from the Google Fonts icons database.

**Example:**

```
get_icon_categories()
```

### `get_icon_styles`

Get all icon styles from the Google Fonts icons database.

**Example:**

```
get_icon_styles()
```

## Development

To get started with development, clone the repository and install the dependencies:

```bash
git clone --depth 1 https://github.com/rodydavis/google-fonts-gemini-cli-extension.git
cd google-fonts
git submodule update --init --recursive --depth 1
npm install
```

### Running Tests

To run the test suite:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
