const stringUtils = {
    /**
     * 
     * @param {*} str 
     * @param {*} len 
     * @param {*} char 
     * @returns 
     */
    leftFill: (str, len, char = ' ') => {
        return str.toString().length < len ? stringUtils.leftFill(char + str, len, char) : str;
    }
}