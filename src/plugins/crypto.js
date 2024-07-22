import CryptoJS from 'crypto-js';

const crypto = {
    iv () {
        return ['Y', 'o', 'u', 'r', 'E', 'n', 'c', 'r', 'y', 'p', 't', 'i', 'o', 'n', 'K', 'e'];
    },
    encryption (val) {
        const iv = this.iv().join('');
        return CryptoJS.AES.encrypt(JSON.stringify(val), iv, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
    },
    decryption (data) {
        if (typeof data == 'string') {
            const iv = this.iv().join('');
            const player = CryptoJS.AES.decrypt(data, iv, {
                iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
            return JSON.parse(player);
        } else {
            return data;
        }
    },
};

export default crypto;