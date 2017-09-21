export declare class PassImages {
    map: Map<any, any>;
    background: string;
    background2x: string;
    background3x: string;
    icon: string;
    constructor();
    /**
     * Returns a given imageType path with a density
     *
     * @param {string} imageType
     * @param {string} density - can be '2x' or '3x'
     * @returns {string} - image path
     * @memberof PassImages
     */
    getImage(imageType: any, density?: string): any;
    /**
     * Saves a given imageType path
     *
     * @param {string} imageType
     * @param {string} density
     * @param {string} fileName
     * @memberof PassImages
     */
    setImage(imageType: any, density: string, fileName: any): void;
    /**
     * Load all images from the specified directory. Only supported images are
     * loaded, nothing bad happens if directory contains other files.
     *
     * @param {string} dir - path to a directory with images
     * @memberof PassImages
     */
    loadFromDirectory(dir: any): Promise<this>;
}
