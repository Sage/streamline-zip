"use strict";

var flows = require('streamline-runtime').flows;

var fs = require('fs');
var zip = require('../..');

var filesToTest = [__dirname + "/data/test_deflate.zip",
__dirname + "/data/test_store.zip"];

QUnit.module(module.id, {
	setup: function() {},
	teardown: function() {}
});

asyncTest("Unzip filecount", filesToTest.length * 3, function(_) {

	flows.each(_, filesToTest, function(_, file) {
		var files = [];
		var data = fs.readFile(file, _);

		new zip.Unzip(
		data,

		function(filename, filecontent, headers, _) {
			files.push(filename);
		}, {
			filter: function(filename, headers, _) {
				return true;
			}
		}).unzip(_);

		strictEqual(2, files.length, "Number of files");
		strictEqual(true, files.indexOf("abc.txt") >= 0, "File 1 read");
		strictEqual(true, files.indexOf("123.txt") >= 0, "File 2 read");
	});

	start();
});

asyncTest("Unzip filecount filter", filesToTest.length * 2, function(_) {

	flows.each(_, filesToTest, function(_, file) {
		var files = [];
		var data = fs.readFile(file, _);
		new zip.Unzip(
		data,

		function(filename, filecontent, headers, _) {
			files.push(filename);
		}, {
			filter: function(filename, headers, _) {
				if (filename.slice(0, 3) !== "abc") return false;
				return true;
			}
		}).unzip(_);

		strictEqual(1, files.length, "File filter");
		strictEqual(true, files.indexOf("abc.txt") >= 0, "File read");
	});

	start();
});

asyncTest("Unzip filesize/content", filesToTest.length * 9, function(_) {

	flows.each(_, filesToTest, function(_, file) {
		var files = [];
		var size = [];
		var data = fs.readFile(file, _);
		new zip.Unzip(
		data,

		function(filename, filecontent, headers, _) {
			files.push(filename);
			size.push(headers.size);

			if (filename === "abc.txt") {
				strictEqual(true, filecontent.toString("ascii").indexOf("What, from her last glimmers of the the scenes that of million years, but not be") >= 0, "Content matches");
			} else if (filename === "123.txt") {
				strictEqual(true, filecontent.toString("ascii").indexOf("Zaphod scribbled a great length of the image of to compose a paying proposition") >= 0, "Content matches");
			}

			strictEqual(true, headers.filename === filename, "Header matches");
		}, {
			filter: function(filename, headers, _) {
				return true;
			}
		}).unzip(_);

		strictEqual(2, files.length, "File count matches");

		strictEqual(true, files.indexOf("abc.txt") >= 0, "File read");
		strictEqual(true, files.indexOf("123.txt") >= 0, "File read");

		strictEqual(2359, size[files.indexOf("abc.txt")], "File size");
		strictEqual(2358, size[files.indexOf("123.txt")], "File size");
	});

	start();
});