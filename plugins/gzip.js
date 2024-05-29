let FileUtil = com.example.hikerview.utils.FileUtil;
let javaString = java.lang.String;
let Base64 = java.util.Base64;
const GZIPOutputStream = java.util.zip.GZIPOutputStream;
const GZIPInputStream = java.util.zip.GZIPInputStream;
const DeflaterOutputStream = java.util.zip.DeflaterOutputStream;
const InflaterInputStream = java.util.zip.InflaterInputStream;
const DeflaterInputStream = java.util.zip.DeflaterInputStream;
const ByteArrayOutputStream = java.io.ByteArrayOutputStream;
const ByteArrayInputStream = java.io.ByteArrayInputStream;
const Deflater = java.util.zip.Deflater;

//远程依赖
//require("https://cdn.bootcdn.net/ajax/libs/pako/2.1.0/pako.es5.min.js");
//仓库:
require("http://hiker.nokia.press/hikerule/rulelist.json?id=6974");

//javascript
function uint8ArrayToBase64(uint8Array) {
  var binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
  return window0.btoa(binaryString);
}
function zip(str, mode) {
  mode = mode ? mode : "gzip";
  var arr = []
  if (mode == "gzip") {
    arr = pako.gzip((str), {
      to: 'string'
    });
  } else if (mode == "deflate") {
    arr = pako.deflate((str), {
      to: 'string'
    });
  }
  return uint8ArrayToBase64(arr);
}
function unzip(b64Data) {
  let strData = window0.atob(b64Data);
  const charData = strData.split('').map(function (x) {
    return x.charCodeAt(0);
  });
  const binData = new Uint8Array(charData);
  const data = pako.inflate(binData);
  //strData = String.fromCharCode.apply(null, new Uint16Array(data));
  return Utf8ArrayToStr(data);
}
function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;
  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
        );
        break;
    }
  }
  return out;
}
//javascript

function zipForJava(text, mode) {
  mode = mode ? mode : "gzip";
  let baseStr = new javaString(text);
  // 使用 ByteArrayOutputStream 来捕获压缩后的数据
  var baos = new ByteArrayOutputStream();
  if (mode == "deflate") {
    var deflater = new java.util.zip.Deflater();
    deflater.setLevel(java.util.zip.Deflater.BEST_COMPRESSION);
    var dos = new java.util.zip.DeflaterOutputStream(baos, deflater);
    dos.write(baseStr.getBytes("UTF-8"));
    dos.finish(); // 完成压缩
    dos.close();
  } else {
    var gzos = new java.util.zip.GZIPOutputStream(baos);
    gzos.write(baseStr.getBytes("UTF-8"));
    gzos.close(); // 关闭压缩流
  }
  // 将压缩后的数据转换为 Base64 编码的字符串
  var compressedData = baos.toByteArray();
  var base64String = java.util.Base64.getEncoder().encodeToString(compressedData);

  // 关闭 ByteArrayOutputStream
  baos.close();
  return String(base64String);
}

function unzipForJava(text, mode) {
  mode = mode ? mode : "gzip";
  var compressedData = Base64.getDecoder().decode(text);
  var bais = new ByteArrayInputStream(compressedData);
  var baos = new ByteArrayOutputStream();
  var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
  if (mode == "gzip") {
    var gis = new GZIPInputStream(bais);
    let len;
    while ((len = gis.read(buffer)) != -1) {
      baos.write(buffer, 0, len);
    }
    gis.close();
  } else if (mode == "deflate") {
    var iis = new InflaterInputStream(bais);
    let len;
    while ((len = iis.read(buffer)) != -1) {
      baos.write(buffer, 0, len);
    }
    iis.close();
  }
  bais.close();
  baos.close();
  var decompressedString = new javaString(baos.toByteArray(), "UTF-8");
  // 打印解压缩后的字符串
  return String(decompressedString);
}

const Gzip = {
  islog: false,
  env: "java",
  mode: "gzip",
  log: function (input) {
    if (this.islog) {
      log(input)
    }
  },
  zip(text, mode) {
    this.log("----------分割线----------")
    this.log("方法:压缩")
    this.log("模式:" + this.mode)
    this.log("文本数量:" + text.length)
    var s = new Date().getTime();
    var result;
    if (this.env == "java") {
      this.log("环境:" + this.env)
      result = zipForJava(text, mode || this.mode)
      var e = new Date().getTime();
      this.log("耗时:" + (e - s))
      this.log("压缩后:" + result.length)
      return result;
    }
    this.log("环境:" + this.env)
    result = zip(text, mode || this.mode);
    var e = new Date().getTime();
    this.log("耗时:" + (e - s))
    this.log("压缩后:" + result.length)
    return result;
  },
  unzip(text, mode) {
    this.log("----------分割线----------")
    this.log("方法:解压")
    this.log("模式:" + this.mode)
    this.log("文本数量:" + text.length)
    var s = new Date().getTime();
    var result;
    if (this.env == "java") {
      this.log("环境:" + this.env)
      result = unzipForJava(text, mode || this.mode);
      var e = new Date().getTime();
      this.log("耗时:" + (e - s))
      this.log("解压后:" + result.length)
      return result;
    }
    this.log("环境:" + this.env)
    result = unzip(text, mode || this.mode);
    var e = new Date().getTime();
    this.log("耗时:" + (e - s))
    this.log("解压后:" + result.length)
    return result
  }
};