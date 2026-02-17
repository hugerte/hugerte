type ResponseTypeMap = {
  'text': string;
  'arraybuffer': ArrayBuffer;
}

type LoadCallback<T extends keyof ResponseTypeMap> = (response: ResponseTypeMap[T] | null) => any;

const dataTools = {
      load: async <T extends keyof ResponseTypeMap>(url: string, callback: LoadCallback<T>, responseType: T = 'text' as T /*yup, TODO for later*/) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Network response was not ok', response.statusText);
                return null;
            }

            let responseData: string | ArrayBuffer;
            switch (responseType) {
                case 'text':
                    responseData = await response.text();
                    break;
                case 'arraybuffer':
                    responseData = await response.arrayBuffer();
                    break;
                default:
                    throw new Error(`Unsupported response type: ${responseType}`);
            }

            callback(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
            callback(null);
        }
    }
};

const RTFTools = {
    /**
     * Get all groups from the RTF content with the given name.
     * @param {String} rtfContent RTF content.
     * @param {String} groupName Group name to find. It can be a regex-like string.
     * @returns {Array}
     */
    getGroups: (rtfContent: string, groupName: string): Array<any> => {
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
    removeGroups: (rtfContent: string, groupName: string): string => {
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
    getGroup: (content: string, groupName: string, options: { start: number; } = { start: 0 }): {start: number, end: number, content: string} | null => {
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
    extractGroupContent: (group: string): string => {
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
    getGroupName: (group: string): string | null => {
        const match = group.match(/^\{\\(\w+)/);
        return match ? match[1] : null;
    },
};

// TODO: does vanilla ES perhaps give us enough utils already?
const imageTools = {
    /**
     * Converts a hex string to an array containing 1 byte in each cell.
     * @param {String} hexString Hex string representing bytes.
     * @returns {Number[]} Array of bytes as integers.
     */
    convertHexStringToBytes: (hexString: string): number[] => {
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
    convertBytesToBase64: (bytesArray: number[]): string => {
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
    getImageTypeFromSignature: (bytesArray: Uint8Array): string => {
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

export {
    dataTools,
    RTFTools,
    imageTools,
};