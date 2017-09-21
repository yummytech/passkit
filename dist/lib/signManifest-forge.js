'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var forge = require("node-forge");
var fs_1 = require("fs");
var path_1 = require("path");
exports.APPLE_CA_CERTIFICATE = forge.pki.certificateFromPem(fs_1.readFileSync(path_1.resolve(__dirname, '../../keys/wwdr.pem')));
/**
 * Signs a manifest and returns the signature.
 *
 * @param {string} signerPemFile - signing certificate filename
 * @param {string} password - certificate password
 * @param {string} manifest - manifest to sign
 * @param {Function} callback
 * @returns {Promise.<string>} - signature for given manifest
 */
function signManifest(signerPemFile, password, manifest, callback) {
    // reading and parsing certificates
    fs_1.readFile(signerPemFile, 'utf8', function (err, signerCertData) {
        if (err)
            return callback(err);
        // the PEM file from P12 contains both, certificate and private key
        var pemMessages = forge.pem.decode(signerCertData);
        // getting signer certificate
        var certificate = forge.pki.certificateFromPem(signerCertData);
        // getting signer private key
        var signerKeyMessage = pemMessages.find(function (message) {
            return message.type.includes('KEY');
        });
        var key = forge.pki.decryptRsaPrivateKey(forge.pem.encode(signerKeyMessage), password);
        if (!key) {
            if ((signerKeyMessage.procType &&
                signerKeyMessage.procType.type === 'ENCRYPTED') ||
                signerKeyMessage.type.includes('ENCRYPTED')) {
                return callback(new Error('unable to parse key, incorrect passphrase'));
            }
        }
        // create PKCS#7 signed data
        var p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(manifest, 'utf8');
        p7.addCertificate(certificate);
        p7.addCertificate(exports.APPLE_CA_CERTIFICATE);
        p7.addSigner({
            key: key,
            certificate: certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data
                },
                {
                    type: forge.pki.oids.messageDigest
                    // value will be auto-populated at signing time
                },
                {
                    type: forge.pki.oids.signingTime
                    // value will be auto-populated at signing time
                    // value: new Date('2050-01-01T00:00:00Z')
                }
            ]
        });
        p7.sign();
        return callback(null, Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary'));
    });
}
exports.signManifest = signManifest;
