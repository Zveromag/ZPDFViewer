# ZPDFViewer

## Description

This plugin allows you to view PDF files in photo gallery mode. The file is displayed using standard browser tools. Insertion occurs through the use of an iframe.

## Initialization

````javaScript
new ZPDFViewer();
````

To determine on which elements to use the plugin there are data attributes.

````html
<a data-viewer-group="group 1" data-pdf-viewer href="test.pdf">File 1</a>
````

> **data-viewer-group** it is used to group files, according to the elements that are in one group, you can navigate using the navigation controls. If grouping is not required, you can leave it empty or set the value to **simple**.

> **data-pdf-viewer** it is a required parameter. This data attribute indicates that the item will be included in the list processed by the plugin.

## Options

````javaScript
//Use navigation elements
arrows: true

//Use keyboard to navigate
keyboard: true

//Callback when selecting an item
onChange: function () { }
````
