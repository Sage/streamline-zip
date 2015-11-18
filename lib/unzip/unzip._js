"use strict";

var zlib = require("zlib");
var Readbuffer = require("./readbuffer");

/// !doc
/// 
/// # streamline-zip/lib/unzip/unzip module
/// 
/// Simple API to unzip a zip archive.
/// 
/// `var zip = require('streamline-zip')`
/// 
/// * `unzipper = new zip.Unzip(buffer, filecallback[, options])` 
///   `buffer`: buffer containing the content of the zip file. 
///   `filecallback`: `function(filename, filecontent, headers, _)`: Function that is called on every file extracted. 
///   `options.filter`: `function(filename, headers, _)`: function called before extraction of a file, return `false` to skip. 
///   `headers` consists of `filename`, `size` and `moddate`. 
/// 
/// * `unzipper.unzip(_)` 
///   unzips the buffer.
/// 
/// * `unzipper.list(_)` 
///   returns an array of all file names; `options.filter` is applied 
/// 
/// Example:
/// 
/// ``` javascript
/// var fs = require('fs');
/// var zip = require("streamline-zip");
///
/// var data = fs.readFile("myfile.zip", _);
/// new zip.Unzip(
/// 	data, 
/// 	function(filename, filecontent, headers, _) {
/// 		// do something with filecontent ...
/// 	},	{
/// 		filter: function(filename, headers, _) {
/// 			// insert your filtering condition here ...
/// 			return true;
/// 		}
/// 	}
/// ).unzip(_);
/// ```
exports.Unzip = function(buffer, filehandler, options) {

	var decompMethods = {
		store: {
			id: 0x0000,
			decompress: function(content, _) {
				return content;
			}

		},
		inflate: {
			id: 0x0008,
			decompress: function(content, _) {
				return zlib.inflateRaw(content, _);
			}
		}

	};

	var filebuffer = new Readbuffer(buffer);
	var opts = options || {};
	var centralDirectoryPos = -1;

	/* Look for central directory by scanning for the end of central directory block
	   (search only if position has not already been found)
	  
	 	Offset 	Bytes 	Description
	  	 0 	4 	End of central directory signature = 0x06054b50
		 4 	2 	Number of this disk
		 6 	2 	Disk where central directory starts
		 8 	2 	Number of central directory records on this disk
		10 	2 	Total number of central directory records
		12 	4 	Size of central directory (bytes)
		16 	4 	Offset of start of central directory, relative to start of archive
		20 	2 	Comment length (n)
		22 	n 	Comment
	 */
	function scanForCentralDir(_) {
		if (centralDirectoryPos < 0) {
			var pos = filebuffer.length() - 22; // last header is at least 22 bytes
			do {
				filebuffer.seek(pos);
				pos--;
			} while (filebuffer.readInt32() !== 0x06054b50 && pos > 0);

			if (pos <= 0) {
				throw new Error("Unable to locate end of central directory");
			}
			filebuffer.skip(12);
			centralDirectoryPos = filebuffer.readInt32();			
		}
	};

	/*
	 * Optional parameter 'list': when set, just the names of the files will be put into that array, no extraction is done 
	 * 
		Offset 	Bytes 	Description
		 0 	4 	Central directory file header signature = 0x02014b50
		 4 	2 	Version made by
		 6 	2 	Version needed to extract (minimum)
		 8 	2 	General purpose bit flag
		10 	2 	Compression method
		12 	2 	File last modification time
		14 	2 	File last modification date
		16 	4 	CRC-32
		20 	4 	Compressed size
		24 	4 	Uncompressed size
		28 	2 	File name length (n)
		30 	2 	Extra field length (m)
		32 	2 	File comment length (k)
		34 	2 	Disk number where file starts
		36 	2 	Internal file attributes
		38 	4 	External file attributes
		42 	4 	Relative offset of local file header. This is the number of bytes between the start of the first disk on which the file occurs, and the start of the local file header. This allows software reading the central directory to locate the position of the file inside the ZIP file.
		46 	n 	File name
		46+n 	m 	Extra field
		46+n+m 	k 	File comment
	*/
	function procCentralDir(_, list) {
		filebuffer.seek(centralDirectoryPos);

		while (true) {
			var header = filebuffer.readInt32();
			if (header === 0x06054b50) { // regular end of central directory -> finished
				return;
			}

			if (header !== 0x02014b50) {
				throw new Error("Invalid header signature for central directory");
			}

			filebuffer.skip(24);
			var fileNameLength = filebuffer.readInt16();
			var extraLength = filebuffer.readInt16();
			var commentLength = filebuffer.readInt16();
			filebuffer.skip(8);
			var fileBlockStart = filebuffer.readInt32();
			filebuffer.skip(fileNameLength + extraLength + commentLength);

			var pos = filebuffer.pos();

			filebuffer.seek(fileBlockStart);

			procFile(_, list);

			filebuffer.seek(pos);
		}
		throw new Error("Unexpected end of file");
	};

	// Optional parameter 'list': when set, just the metadata of the files will be put into that array, no extraction is done 
	function procFile(_, list) {
		if (filebuffer.readInt32() !== 0x04034b50) {
			throw new Error("Invalid header signature for file block");
		}

		filebuffer.skip(4);
		var method = filebuffer.readInt16();
		var time = filebuffer.readInt16();
		var date = filebuffer.readInt16();
		filebuffer.skip(4); // crc

		var compressedLen = filebuffer.readInt32(); // comp. len
		var uncompressedLen = filebuffer.readInt32(); // uncomp. len

		var filenameLen = filebuffer.readInt16(); // filename len
		var extraDataLen = filebuffer.readInt16(); // extra len
		var filename = filebuffer.readString(filenameLen);

		var headers = {
			filename: filename,
			size: uncompressedLen,
			moddate: getDate(time, date)

		};
		if (opts.filter && !opts.filter(filename, headers, _)) return;
		
		if (list) {
			list.push(filename);
			return;
		}

		filebuffer.skip(extraDataLen);

		var compressedData = filebuffer.readBytes(compressedLen);
		var uncompressedData;
		var handler;

		for (handler in decompMethods) {
			if (decompMethods[handler].id === method) {
				uncompressedData = decompMethods[handler].decompress(compressedData, _);
			}
		}

		if (!uncompressedData) {
			throw new Error("No handler for compression method id: " + method);
		}

		filehandler(filename, uncompressedData, headers, _);
	};

	function getDate(time, date) {
		var fullDate = new Date();

		fullDate.setHours(((time >> 11) & 32));
		fullDate.setMinutes(((time >> 6) & 64));
		fullDate.setSeconds(((time >> 0) & 32) * 2);

		fullDate.setFullYear(((date >> 9) & 128) + 1980);
		fullDate.setMonth(((date >> 5) & 16));
		fullDate.setDate(((date >> 0) & 32));
		return fullDate;
	};

	this.unzip = function(_) {
		scanForCentralDir(_);
		procCentralDir(_);
	};
	this.list = function(_) {
		scanForCentralDir(_);
		var result = [];
		procCentralDir(_, result);
		return result;
	};
};