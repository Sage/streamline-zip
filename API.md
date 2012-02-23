
# node-native-zip module

Simple API to create a zip archive. No extenal dependencies (except streamline.js)

* `archive = new zip.Zip(outStream, options)`  
  Creates a zip archive.  
  Uses _deflate_ compression by default. You can override this by passing  
  options = { zipMethod: zip.store }
* `archive.add(_, entry)`  
  Adds an entry to the archive.  
  If the entry is `{ name: "...", path: "..." }`,
  the `path` file or directory (and all its contents) is added to the archive.  
  If the entry is `{ name: "...", data: "..." }`,
  the `data` buffer is added to the archive.  
  You may also specify a `date` in the entry.  
  If you pass a directory `path`, you can also pass a `filter` function in the entry.  
  The `filter` function will be called as `filter(filename, parentEntry)`.  
  You can also pass an array of entries instead of a single entry.
  
  Returns `this` for chaining
* `archive.finish(_)`
  Writes the trailer at the end of the archive.
  Returns `this` for chaining.
* `zipMethod: zip.store`  
  _store_ method (no compression)
* `zipMethod: zip.deflate`  
  _deflate_ method (standard compression)
