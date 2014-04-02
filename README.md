# streamline-zip

This module is a modification of the zip creation module by Jan Jongboom, 2011 [janzip](https://www.github.com/janjongboom/node-native-zip) for use with Streamline.

## How to install

Via GIT:

    git clone https://github.com/Sage/streamline-zip.git
    
## How to use

This library requires that [streamline](https://github.com/Sage/streamlinejs) is available to simplify asynchronous function calls and requires [streamline-fs](https://github.com/Sage/streamline-fs)

You need a writable stream to which the zip content will be written, e. g. when you want to write to a file `foo.zip`, you get the stream via

    var fs = require('fs');
    var wstream = fs.createWriteStream('foo.zip');

Now you create a zip object which will write to this stream

    var zip = require("streamline-zip");
    var archive = new zip.Zip(wstream);

There is an optional second parameter for an options object. In these options you may indicate the store method (either `zipMethod: zip.deflate`, which is the default, or `zipMethod: zip.store`),
and provide an optional filter function for the contents of directories (`filter: filterFunction`; will be called as `filter(_, filename, parentEntry)`; must return true to take this entry), and a transform function (`transform: transformFunction`) to transform the contents of files before adding them to the archive; will be called as `transform(_, data, entry)`). 

Then you can populate the archive. The following `add` function takes either an object or an array of objects, where each object can have the following attributes:

   * `name`: this is the name under which it will be stored in the zip archive (obligatory)
   * `data`: buffer (not string!) with the contents or
   * `path`: a file name or directory name in the file system (directories will be recursed, using an optional filter as described above; when a transform method is proveded, it will be applied to the file contents; will be used when no `data` provided; either `data` or `path` must be provided)
   * `date`: an optional date (by default, the current time, when `data` is given, or the last modification time of the file, when a path is given)

Examples:

    archive.add(_, { name: "test.txt", data: new Buffer(...), date: new Date("2014-04-02 10:00")};
    archive.add(_, [{name: "test2.txt", path: "./foo.txt"}, {name: "test3", path: "some_directory"}]);

It is safe to change above options between calls of the `add` method. 
After adding all entries, you have to complete the archive (this method will append the trailer):

    archive.finish(_);

This will also close the underlying stream by invoking its `end()` method. 

## Unzipping

Unzipping is more complex because of all the different compression algorithms that you may
encounter in the wild. So it's not covered. Use existing libraries for that.