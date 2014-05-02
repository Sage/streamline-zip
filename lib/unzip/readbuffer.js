"use strict";

function Readbuffer(buffer) {

	var offset = 0x00;
	this.buf = buffer;

	this.readInt8 = function() {
		var byte = this.buf[offset];
		offset++;
		return byte;
	};

	this.readInt16 = function() {
		var int = 0;

		int += this.buf[offset];
		int += this.buf[offset + 1] << 0x08;
		offset += 2;

		return int;
	};

	this.readInt32 = function() {
		var int = 0;

		int += this.buf[offset];
		int += this.buf[offset + 1] << 0x08;
		int += this.buf[offset + 2] << 0x10;
		int += this.buf[offset + 3] << 0x18;
		offset += 4;

		return int;
	};

	this.readString = function(len, encoding) {
		var s = this.buf.toString(encoding, offset, offset + len);
		offset += len;
		return s;
	};

	this.readBytes = function(len) {
		var slice = this.buf.slice(offset, offset + len);
		offset += len;
		return slice;
	};

	this.skip = function(len) {
		offset += len;
	};

	this.seek = function(pos) {
		offset = pos;
	};

	this.length = function() {
		return this.buf.length;
	};

	this.pos = function() {
		return offset;
	};

}

module.exports = Readbuffer;