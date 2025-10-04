# Gemini CLI Extension for Google Fonts

This document provides guidelines for using the Google Fonts Gemini CLI extension. This extension allows you to search for Google Fonts and Material Icons and integrate them into your projects.

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

## Platform Integration

### Fonts

#### Web

Embed code in the `<head>` of your html. Replace `{font_family_url}` with the URL-encoded font family name (e.g., `Roboto`, `Google+Sans+Code`).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family={font_family_url}:ital,wght@0,{min_weight}..{max_weight};1,{min_weight}..{max_weight}&display=swap" rel="stylesheet">
```

Use the font in your CSS. Replace `{font_family}` with the font family name, `{font_name_snake_case}` with a snake_case version of the font name, and `<weight>` with a value from `{min_weight}` to `{max_weight}`.

```css
/* 
  <uniquifier>: Use a unique and descriptive class name
  <weight>: Use a value from {min_weight} to {max_weight}
*/
.{font_name_snake_case}-<uniquifier> {
  font-family: "{font_family}", monospace;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
}
```

#### Flutter

Apps built with Flutter can directly access almost all fonts from Google Fonts through the `google_fonts` package.

Add the `google_fonts` package to your `pubspec.yaml` dependencies and import `GoogleFonts`:

```dart
import 'package:google_fonts/google_fonts.dart';
```

Apply the font to a widget subtree by constructing a theme. Replace `{font_name_camel_case}` with a camelCase version of the font name.

```dart
ThemeData(
  textTheme: GoogleFonts.{font_name_camel_case}TextTheme(),
),
```

Apply the font to a single `Text` widget:

```dart
Text(
  'This is Google Fonts',
  style: GoogleFonts.{font_name_camel_case}(),
),
```

**Variable Fonts**

Full font variations can be used with the `FontVariation` class by downloading variable fonts and bundling them as assets. This code example shows how to set the weight and width axis values after adding the variable font file to the assets folder.

```dart
// <weight>: Use a value from {min_weight} to {max_weight}
TextStyle(
  fontFamily: '{font_family}',
  fontSize: 18,
  fontVariations: [
    FontVariation('wght', <weight>),
  ],
),
```

#### Android

**Downloadable fonts**

Android applications can download fonts from Google Fonts. Note: Sometimes there will be a delay between when a font is first available on fonts.google.com and when it can be downloaded from an Android application.
https://developer.android.com/develop/ui/views/text-and-emoji/downloadable-fonts

**Bundled fonts**

An alternative to downloading fonts is to bundle them with the application by adding the font file into the `res/font/` folder to bundle it as a resource. Bundled fonts are compiled in your `R` file and are automatically available in Android Studio.
https://developer.android.com/develop/ui/views/text-and-emoji/fonts-in-xml

**Using fonts**

Applications use fonts to render text with the ability to change size, weight, and style or use variable fonts which open up more expressive options.
https://developer.android.com/jetpack/compose/text/fonts

#### iOS

To add a custom font, add the font file and use it in your app's interface the same way you use an iOS-provided custom font.
https://developer.apple.com/documentation/uikit/text_display_and_fonts/adding_a_custom_font_to_your_app

### Icons

#### Web

Check the [Material Symbols guide](https://developers.google.com/fonts/docs/material_symbols) for advanced examples such as animations and font loading optimization.

**Variable icon font**

Add the variable font stylesheet request to your head tag and the current variable axes configuration to icons using CSS. Replace `{icon_name}` with the name of the icon.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names={icon_name}" />
<style>
.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24
}
</style>
```

**Static icon font**

Alternatively, the current configuration can be loaded as a static font instead of a variable one.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names={icon_name}" />
```

**Inserting the icon**

```html
<span class="material-symbols-outlined">
{icon_name}
</span>
```

**Code point:** `{icon_codepoint}`

#### Android

Use with Views. Download the Vector Drawable and follow the import instructions.

```xml
<ImageView ...
 android:src="@drawable/{icon_name}_24"
/>
```

#### iOS

Use in iOS. Follow the instructions to use symbols.

**Swift**
```swift
UIImage(named:"{icon_name}")?
```

**Objective-C**
```objc
[UIImage imageNamed:@"{icon_name}"]
```

## Best Practices

*   **Be specific in your searches:** Use multiple filters to narrow down the results and find the most relevant fonts and icons.
*   **Consider the context:** When choosing a font or icon, think about the overall design and purpose of the application.
*   **Provide choices:** If you are unsure which font or icon to use, you can present the user with a few options from your search results.
*   **Always inform the user:** Let the user know which fonts and icons you have chosen and how you have used them in the generated code.
