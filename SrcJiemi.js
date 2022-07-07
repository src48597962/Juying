var jiemi = {
    获取私钥: function (order) {
        if(typeof(order)==='string' && order.length>=848){
            return order
        }
        var pkcs8Private;
        let pkcs8Private1 = `-----BEGIN PRIVATE KEY-----
        MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAK5WtrOWxP8FHYRu
        t+qp2kz0JNfv47nj+EH9R/Ft7E7WeCUC/AcXcjrHQV0JqyAUQRec/7tBZZhOcQff
        QB1flDVAsYvz8GlQfEumWK1zmf9YlljzaJq04jPXKVfr9eAiH1lcR1CsYKMqBK9b
        W2Xm42QRwSFhijmUlrbNo2Cj1RC9AgMBAAECgYEAiSGQKIcpgWcmpqroY98i5XEN
        IgWB3RBikJWH53INdJ3id0p3r6RTp8Rft60JO/xyjv5hcYupPDpHUmfa6L/rtQMi
        AAiak6pWPasi+rMWHkWIyAHz3Lxxn89GeX1vC2FNqp9yLdRhc1qO3CMBz4AFiJPk
        H2CRqZKNPc3boSW+j4kCQQDZ4j6s98yFErvN1OfJOTAfrfsB4cZdeClt63cxJpWe
        cAUMBIGCloed663tgesag7a6X8JTBE2+GupxlT4VIuZDAkEAzNZWgta+H0eN6X7T
        pk1Lyt/lrAW/l36PI6ft1y7fpKoJMQVA7sbIG4vHDIFW9EabAnABQ7HH3NiVDVsk
        vt48/wJBAM82OnMXKzs3aMJFA7a8G4dVV80fYh6MY6I0+GMXFd3bHQGj22NNM2a9
        t+iT0PqjXwl6fn2jLyhnwqUI0UUarq8CQFyT8v2neL5CZM1HWPksrji/ANrCrlkW
        BjOjTkeXE9UkVIsnSLWiegaZIhlwy5AT6TMs1CV4UFBsQtGKhA0P/JkCQC28mkKq
        uc0mONTWMSenwXHfpAzhOP3l/NxJBkVXPunaOb6kOP7JejGMjMhnRHh4nDiGQRi9
        Kfo65lNN215J10s=
        -----END PRIVATE KEY-----`;
        switch (order){
            default:
                pkcs8Private = pkcs8Private1;
                break;
        }
        pkcs8Private = pkcs8Private.split('\n').slice(1,-1).join('');
        return pkcs8Private
    },
    rsaDec: function (data){
        order = false;
        if(/data|list|msg|code|{|}/.test(data)){
            return data
        }
        let pkcs8Private = 获取私钥(order);
        try {
            let decodedData = rsaDecrypt(data, pkcs8Private, {
                config: "RSA/ECB/PKCS1Padding",
                type: 1,
                long: 2
            });
            if(!decodedData){
                log('通讯解密不正确:',decodedData);
            }
            return decodedData||data
        }
        catch (e) {
            log('通讯解密失败:'+e.message);
            return data
        }
    }
}