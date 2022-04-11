class Utils {
    /**
    * @param {string} string 
    * @returns {string}
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
    */
    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * @param {string} string 
     * @param {number} size 
     * @param {string} trail 
     * @returns {string}
     */
    static truncate(string, size, trail) {
        if (string.length <= size) {
            return string;
        }
        return string.substring(0, size - trail.length) + trail;
    }
}

export { Utils };