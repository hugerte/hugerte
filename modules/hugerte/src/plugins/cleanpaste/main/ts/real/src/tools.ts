const dataTools = {

    // Function to send a GET request to a specified URL and handle the response
    load: (url, callback, responseType = 'text') => {
        // Create an XMLHttpRequest object
        const xhr = dataTools.createXMLHttpRequest();
        if (!xhr) return null; // Return null if the XMLHttpRequest object cannot be created

        // Determine if the request should be asynchronous based on the presence of a callback
        const async = !!callback;
        if (async && responseType !== 'text' && responseType !== 'xml') {
            // Set the response type for asynchronous requests if it's not 'text' or 'xml'
            xhr.responseType = responseType;
        }

        // Open a GET request to the specified URL
        xhr.open('GET', url, async);
        if (async) {
            // Set up an event handler for the asynchronous request
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    // Call the callback function with the response when the request is complete
                    callback(dataTools.getResponse(xhr, responseType));
                }
            };
        }
        // Send the request
        xhr.send(null);
        // For synchronous requests, return the response directly
        return async ? '' : dataTools.getResponse(xhr, responseType);
    },
};


const RTFTools = {
    /**
     * Get all groups from the RTF content with the given name.
     * @param {String} rtfContent RTF content.
     * @param {String} groupName Group name to find. It can be a regex-like string.
     * @returns {Array}
     */
    getGroups: (rtfContent, groupName) => {
        const groups = [];
        let current;
        let from = 0;

        while ((current = RTFTools.getGroup(rtfContent, groupName, { start: from }))) {
            from = current.end;
            groups.push(current);
        }

        return groups;
    },

    /**
     * Remove all groups from the RTF content with the given name.
     * @param {String} rtfContent RTF content.
     * @param {String} groupName Group name to find. It can be a regex-like string.
     * @returns {String} RTF content without the removed groups.
     */
    removeGroups: (rtfContent, groupName) => {
        let current;
        while ((current = RTFTools.getGroup(rtfContent, groupName))) {
            rtfContent = rtfContent.slice(0, current.start) + rtfContent.slice(current.end);
        }
        return rtfContent;
    },

    /**
     * Get the group from the RTF content with the given name.
     * @param {String} content RTF content.
     * @param {String} groupName Group name to find. It can be a regex-like string.
     * @param {Object} options Additional options.
     * @param {Number} options.start String index on which the search should begin.
     * @returns {Object}
     */
    getGroup: (content, groupName, options = { start: 0 }) => {
        const openGroups = [];
        const startRegex = new RegExp(`\\{\\\\${groupName}`, 'g');
        let match;

        startRegex.lastIndex = options.start;
        match = startRegex.exec(content);

        if (!match) {
            return null;
        }

        for (let i = match.index; i < content.length; i++) {
            const current = content[i];
            if (current === '{' && content[i - 1] !== '\\' && content[i + 1] === '\\') {
                openGroups.push(i);
            } else if (current === '}' && content[i - 1] !== '\\' && openGroups.length > 0) {
                const start = openGroups.pop();
                if (openGroups.length === 0) {
                    return { start, end: i + 1, content: content.slice(start, i + 1) };
                }
            }
        }

        return null;
    },

    /**
     * Get group content.
     * @param {String} group Whole group string.
     * @returns {String} Extracted group content.
     */
    extractGroupContent: (group) => {
        const groupName = RTFTools.getGroupName(group);
        const controlWordsRegex = /^\{(\\[\w-]+\s*)+/g;
        const subgroupWithoutSpaceRegex = /\}([^{\s]+)/g;

        group = group.replace(subgroupWithoutSpaceRegex, '} $1');
        group = RTFTools.removeGroups(group, `(?!${groupName})`);
        return group.replace(controlWordsRegex, '').trim().replace(/}$/, '');
    },

    /**
     * Get group name.
     * @param {String} group Group string.
     * @returns {String} Group name.
     */
    getGroupName: (group) => {
        const match = group.match(/^\{\\(\w+)/);
        return match ? match[1] : null;
    },
};

const imageTools = {
    /**
     * Converts a hex string to an array containing 1 byte in each cell.
     * @param {String} hexString Hex string representing bytes.
     * @returns {Number[]} Array of bytes as integers.
     */
    convertHexStringToBytes: (hexString) => {
        const bytesArray = [];
        for (let i = 0; i < hexString.length; i += 2) {
            bytesArray.push(parseInt(hexString.substr(i, 2), 16));
        }
        return bytesArray;
    },

    /**
     * Converts a bytes array into a Base64-encoded string.
     * @param {Number[]} bytesArray Array of bytes as integers.
     * @returns {String} Base64-encoded string.
     */
    convertBytesToBase64: (bytesArray) => {
        const base64characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let base64string = '';
        for (let i = 0; i < bytesArray.length; i += 3) {
            const [byte1, byte2 = 0, byte3 = 0] = bytesArray.slice(i, i + 3);
            const base64Indexes = [
                (byte1 >> 2) & 0x3F,
                ((byte1 << 4) | (byte2 >> 4)) & 0x3F,
                ((byte2 << 2) | (byte3 >> 6)) & 0x3F,
                byte3 & 0x3F
            ];
            base64string += base64Indexes.map(index => base64characters.charAt(index)).join('');
        }
        return base64string.padEnd(base64string.length + (3 - bytesArray.length % 3) % 3, '=');
    },

    /**
     * Get image type from the byte signature.
     * @param {Uint8Array} bytesArray Array of bytes.
     * @returns {String} Image MIME type.
     */
    getImageTypeFromSignature: (bytesArray) => {
        const recognizableSignatures = {
            'ffd8ff': 'image/jpeg',
            '47494638': 'image/gif',
            '89504e47': 'image/png'
        };
        const hexSignature = Array.from(bytesArray.slice(0, 4))
                                 .map(byte => byte.toString(16).padStart(2, '0'))
                                 .join('');
        return recognizableSignatures[hexSignature] || null;
    }
};

export default {
    ...dataTools,
    ...RTFTools,
    ...imageTools,
};
