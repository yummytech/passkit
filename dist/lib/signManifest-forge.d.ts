export declare const APPLE_CA_CERTIFICATE: any;
/**
 * Signs a manifest and returns the signature.
 *
 * @param {string} signerPemFile - signing certificate filename
 * @param {string} password - certificate password
 * @param {string} manifest - manifest to sign
 * @param {Function} callback
 * @returns {Promise.<string>} - signature for given manifest
 */
export declare function signManifest(signerPemFile: any, password: any, manifest: any, callback: any): void;
