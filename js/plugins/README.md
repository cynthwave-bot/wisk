# Plugins

Plugins can be elements or other things that gets added to editor.

## Spec

```json
{
    "name": "download-as-pdf",
    "icon": "download-as-pdf.png",
    "title": "Download as PDF",
    "description": "Adds a dialog box to download the current page as a PDF file",
    "category": "mini-dialog",
    "component": "download-as-pdf"
}
```

| option      | compulsory | description                                                                                               |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| name        | true       | like a username but for plugins                                                                           |
| icon        | true       | name of the icon file                                                                                     |
| title       | true       | title of the plugin                                                                                       |
| description | false      | description of the plugin                                                                                 |
| category    | true       | interface of the plugin, can be: `mini-dialog`, `full-dialog`, `right-sidebar`, `left-sidebar`, `element` |
| component   | true       | name of the web component that will be added to the editor                                                |

### Category

#### Element

This is a plugin that will be added to the editor as an element. So this must render something, and it should adhere to the editor's design and its api.
It must have a function `latexCode` that will return the latex code for the rendering the element in a pdf.

#### Other

These will be shown as a dialog box or a sidebar. They will be added to the editor as a button or a menu item, and when clicked, they will open a dialog box or a sidebar.

icon should be square svg (24px) in black color and transparent background with a stroke of 1.8px.
