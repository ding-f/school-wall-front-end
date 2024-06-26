module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1651130978253, function(require, module, exports) {
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.sourcemapCodec = {}));
}(this, function (exports) { 

	var charToInteger = {};
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	for (var i = 0; i < chars.length; i++) {
	    charToInteger[chars.charCodeAt(i)] = i;
	}
	function decode(mappings) {
	    var decoded = [];
	    var line = [];
	    var segment = [
	        0,
	        0,
	        0,
	        0,
	        0,
	    ];
	    var j = 0;
	    for (var i = 0, shift = 0, value = 0; i < mappings.length; i++) {
	        var c = mappings.charCodeAt(i);
	        if (c === 44) { // ","
	            segmentify(line, segment, j);
	            j = 0;
	        }
	        else if (c === 59) { // ";"
	            segmentify(line, segment, j);
	            j = 0;
	            decoded.push(line);
	            line = [];
	            segment[0] = 0;
	        }
	        else {
	            var integer = charToInteger[c];
	            if (integer === undefined) {
	                throw new Error('Invalid character (' + String.fromCharCode(c) + ')');
	            }
	            var hasContinuationBit = integer & 32;
	            integer &= 31;
	            value += integer << shift;
	            if (hasContinuationBit) {
	                shift += 5;
	            }
	            else {
	                var shouldNegate = value & 1;
	                value >>>= 1;
	                if (shouldNegate) {
	                    value = value === 0 ? -0x80000000 : -value;
	                }
	                segment[j] += value;
	                j++;
	                value = shift = 0; // reset
	            }
	        }
	    }
	    segmentify(line, segment, j);
	    decoded.push(line);
	    return decoded;
	}
	function segmentify(line, segment, j) {
	    // This looks ugly, but we're creating specialized arrays with a specific
	    // length. This is much faster than creating a new array (which v8 expands to
	    // a capacity of 17 after pushing the first item), or slicing out a subarray
	    // (which is slow). Length 4 is assumed to be the most frequent, followed by
	    // length 5 (since not everything will have an associated name), followed by
	    // length 1 (it's probably rare for a source substring to not have an
	    // associated segment data).
	    if (j === 4)
	        line.push([segment[0], segment[1], segment[2], segment[3]]);
	    else if (j === 5)
	        line.push([segment[0], segment[1], segment[2], segment[3], segment[4]]);
	    else if (j === 1)
	        line.push([segment[0]]);
	}
	function encode(decoded) {
	    var sourceFileIndex = 0; // second field
	    var sourceCodeLine = 0; // third field
	    var sourceCodeColumn = 0; // fourth field
	    var nameIndex = 0; // fifth field
	    var mappings = '';
	    for (var i = 0; i < decoded.length; i++) {
	        var line = decoded[i];
	        if (i > 0)
	            mappings += ';';
	        if (line.length === 0)
	            continue;
	        var generatedCodeColumn = 0; // first field
	        var lineMappings = [];
	        for (var _i = 0, line_1 = line; _i < line_1.length; _i++) {
	            var segment = line_1[_i];
	            var segmentMappings = encodeInteger(segment[0] - generatedCodeColumn);
	            generatedCodeColumn = segment[0];
	            if (segment.length > 1) {
	                segmentMappings +=
	                    encodeInteger(segment[1] - sourceFileIndex) +
	                        encodeInteger(segment[2] - sourceCodeLine) +
	                        encodeInteger(segment[3] - sourceCodeColumn);
	                sourceFileIndex = segment[1];
	                sourceCodeLine = segment[2];
	                sourceCodeColumn = segment[3];
	            }
	            if (segment.length === 5) {
	                segmentMappings += encodeInteger(segment[4] - nameIndex);
	                nameIndex = segment[4];
	            }
	            lineMappings.push(segmentMappings);
	        }
	        mappings += lineMappings.join(',');
	    }
	    return mappings;
	}
	function encodeInteger(num) {
	    var result = '';
	    num = num < 0 ? (-num << 1) | 1 : num << 1;
	    do {
	        var clamped = num & 31;
	        num >>>= 5;
	        if (num > 0) {
	            clamped |= 32;
	        }
	        result += chars[clamped];
	    } while (num > 0);
	    return result;
	}

	exports.decode = decode;
	exports.encode = encode;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=sourcemap-codec.umd.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1651130978253);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map