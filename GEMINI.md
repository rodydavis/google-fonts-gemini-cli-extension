# Gemini CLI Extension for Google Fonts

This document provides guidelines for using the Google Fonts Gemini CLI extension. This extension allows you to search for Google Fonts and Material Icons and integrate them into your projects.

## Project Context

*   **Environment:** Node.js
*   **Modules:** ESM (`import`/`export` syntax)
*   **File Paths:** Use `import.meta.url` for resolving file paths relative to the current module.
*   **Scripts:** Core logic is located in the `scripts/` directory.
*   **Tests:** Tests are in the `test/` directory with a `.test.ts` extension.

## Tool Usage

This extension provides two primary tools: `search_fonts` and `search_icons`.

### `search_fonts`

Use the `search_fonts` tool to find fonts from the Google Fonts library.

**When to use:**

*   When the user asks for a specific font.
*   When you need to select a font for a UI component (e.g., headings, body text).
*   When the user wants to browse fonts by category, style, or other attributes.

**How to use:**

The `search_fonts` tool accepts the following parameters for filtering:

*   `name`: The name of the font (e.g., "Roboto", "Open Sans").
*   `category`: The font category (e.g., "serif", "sans-serif", "display", "handwriting", "monospace").
*   `tag`: A descriptive tag associated with the font.
*   `is_variable`: Set to `true` to find variable fonts.

All searches are case-insensitive and support partial matches.

**Examples:**

*   **Find a specific font:**
    ```
    search_fonts(name="Lato")
    ```
*   **Find a sans-serif font for body text:**
    ```
    search_fonts(category="sans-serif")
    ```
*   **Find a decorative font for a heading:**
    ```
    search_fonts(category="display")
    ```
*   **Find a variable font:**
    ```
    search_fonts(is_variable=true)
    ```

**Using the results:**

The tool returns a list of fonts with details about each font. When generating code, you can use the font family name to apply the font in CSS, HTML, or other UI frameworks.

**Example CSS:**
```css
body {
  font-family: '''Roboto''', sans-serif;
}
```

### `search_icons`

Use the `search_icons` tool to find icons from the Material Icons library.

**When to use:**

*   When the user asks for an icon.
*   When you need an icon for a button, menu item, or other UI element.
*   When you want to add visual cues to your application.

**How to use:**

The `search_icons` tool accepts the following parameters for filtering:

*   `name`: The name of the icon (e.g., "settings", "home", "search").
*   `category`: The icon category (e.g., "action", "navigation", "social").

All searches are case-insensitive and support partial matches.

**Examples:**

*   **Find a settings icon:**
    ```
    search_icons(name="settings")
    ```
*   **Find icons related to communication:**
    ```
    search_icons(category="communication")
    ```

**Using the results:**

The tool returns a list of icons with their names and other details. You can use the icon name to display the icon in your application. The specific method for displaying the icon will depend on the framework you are using.

**Example HTML (using Material Symbols):**
```html
<span class="material-symbols-outlined">
  settings
</span>
```

## Best Practices

*   **Be specific in your searches:** Use multiple filters to narrow down the results and find the most relevant fonts and icons.
*   **Consider the context:** When choosing a font or icon, think about the overall design and purpose of the application.
*   **Provide choices:** If you are unsure which font or icon to use, you can present the user with a few options from your search results.
*   **Always inform the user:** Let the user know which fonts and icons you have chosen and how you have used them in the generated code.