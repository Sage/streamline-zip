
# streamline-zip main module

Simple API to create a zip archive. No external dependencies (except streamline.js).

`var zip = require('streamline-zip')`

* `archive = new zip.Zip(outStream[, options])`  
  Creates a zip archive.  
  Uses _deflate_ compression by default. You can override this by passing  
  `options = { zipMethod: zip.store }`  
  `options.filter`:  optional function to filter the contents of directories.  
  Called as `filter(_, filename, parentEntry)`.  
  `options.transform`:  optional function to transform the contents of files.  
  Called as `transform(_, contents, entry)` where `contents` is a buffer (not a string).

* `archive.add(_, entry)`  
  Adds an entry to the archive.  
  If the entry is `{ name: "...", path: "..." }`,
  the `path` file or directory (and all its contents) is added to the archive.  
  If the entry is `{ name: "...", data: ... }`,
  the `data` buffer (no string allowed!) is added to the archive.  
  You may also specify a `date` in the entry.  
  You can also pass an array of entries instead of a single entry.  
  Returns `this` for chaining

* `archive.finish(_)`  
  Writes the trailer at the end of the archive.  
  Returns `this` for chaining.

* `zipMethod: zip.store`  
  _store_ method (no compression)

* `zipMethod: zip.deflate`  
  _deflate_ method (standard compression)

