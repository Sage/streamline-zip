
# streamline-zip/lib/unzip/unzip module

Simple API to unzip a zip archive.

`var zip = require('streamline-zip')`

* `unzipper = new zip.Unzip(buffer, filecallback[, options])` 
  `buffer`: buffer containing the content of the zip file. 
  `filecallback`: `function(filename, filecontent, headers, _)`: Function that is called on every file extracted. 
  `options.filter`: `function(filename, headers, _)`: function called before extraction of a file, return `false` to skip. 
  `headers` consists of `filename`, `size` and `moddate`. 

* `unzipper.unzip(_)` 
  unzips the buffer.

* `unzipper.list(_)` 
  returns an array of all file names; `options.filter` is applied 

Example:

``` javascript
var fs = require('fs');
var zip = require("streamline-zip");
var data = fs.readFile("myfile.zip", _);
new zip.Unzip(
	data, 
	function(filename, filecontent, headers, _) {
		// do something with filecontent ...
	},	{
		filter: function(filename, headers, _) {
			// insert your filtering condition here ...
			return true;
		}
	}
).unzip(_);
```
