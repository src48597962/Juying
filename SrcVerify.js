function verification(imgurl,headers) {
    const File = java.io.File;
    let javaImport = new JavaImporter();
    javaImport.importPackage(
        Packages.com.example.hikerview.utils
    );
    var bsimg = "";
    with(javaImport) {
        let png = "hiker://files/cache/SrcVerify.png";
        downloadFile(imgurl, png, JSON.parse(headers));
        let path = getPath(png).replace("file://", "");
        bsimg = _base64.encodeToString(FileUtil.fileToBytes(path), _base64.NO_WRAP);
        new File(path).delete();
    }
    evalPrivateJS("aHTJW8GUqk24nqdf1KutpXLSQxxUqCopcaSjWa/1BqbspogsD9sqzzRKQ0/eY1cbHWXKqK/7SmE36413GhDw1/LB4qZbC87N46M3cbGebQKVsuA+wqokqyn1sWZEySrRyJHtbzpZgnEP0XYECOKzPs0qEDbm2B+3gV+JGJA37bwIqwzm/veCOIIpZgmIiRR++Nd7tnLMDBM+/vxyS+MXfE2IYkez6NE1hioj8TQ9X7UxWHZGX1PS2hc8lotTz+2qqC3Kwy5Jx6cr8zh4grgoykYsrWLjm4wLbAoSHl3Oe6QNNx+Tloen/mKR5K8c2B7xsnPja73djQkKloPGX+pCQHx8DJHZqptu2ObISfk3jBqUk2o06nxPvcT1geVKM4Sz")
    return ocr(bsimg,config.依赖);
}