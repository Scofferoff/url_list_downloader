// Downloads a list of jpg/jpeg files from a text file, line by line.

// Nothing to do with mybits.js, but data is data...

const fs = require('fs');
const readline = require('readline');
const https = require('https');
const { URL } = require('url');
const http = require('http');
const path = require('path');

function generateUUID() {
    const chars = '0123456789abcdef';
    const segments = [8, 4, 4, 4];

    let uuid = '';
    for (const segment of segments) {
        for (let i = 0; i < segment; i++) {
            uuid += chars[Math.floor(Math.random() * 16)];
        }
    }
    return uuid;
}

// Function to write to log file
const writeToLogFile = (message) => {
    const logFileName = 'download.log';
    fs.appendFile(logFileName, `${message}\n`, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

// Function to download image from URL
const downloadImage = (url, destination) => {
    const protocol = url.startsWith('https') ? https : http;
    return new Promise((resolve, reject) => {
        protocol.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image. Status code: ${response.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(destination);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', err => {
                fs.unlink(destination, () => {
                    reject(err);
                });
            });
        }).on('error', err => {
            reject(err);
        });
    });
};

// Function to process file line by line
const processFile = async (filePath) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    // Asynchronous downloading
    const promises = [];

    for await (const line of rl) {
        const trimmedLine = line.trim();
        const url = new URL(trimmedLine);

        // http/https protocol only
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.log(`Skipping non-HTTP/HTTPS URL: ${trimmedLine}`);
            continue;
        }

        // Only deal with file formats we want.
        const extension = url.pathname.match(/\.jpe?g$/i);
        if (!extension) {
            console.log(`Skipping URL with unsupported image format: ${trimmedLine}`);
            continue;
        }

        const randomName = generateUUID(); // Generate random string
        const destination = `${downloadDir}${randomName}${extension}`;

        // Download image
        const promise = downloadImage(trimmedLine, destination)
            .then(() => {
                const logMessage = `Saved: ${trimmedLine} to ${destination}`;
                console.log(logMessage);
                writeToLogFile(logMessage);
            })
            .catch (error => {
                console.error(`Error downloading image from ${trimmedLine}: ${error}`);
            });

        promises.push(promise);
        
    }
    // Wait for al promises to resolve
    await Promise.all(promises);

};

// Usage: node readfile.js path/to/inputfile.txt
const inputFile = process.argv[2];
let downloadDir = process.argv[3] || "./";

// check and sanitize argv[3] path
if (!downloadDir.endsWith('/')) 
    downloadDir += '/';

try { // permissions good?
    fs.accessSync(path.resolve(downloadDir), fs.constants.W_OK);
} catch (err) {
    console.error(`Supplied path is not writable: ${downloadDir}`);
    process.exit(1);
}

if (!inputFile) {
    console.error('Usage: node readfile.js path/to/list.txt [Download/path/directory]');
    process.exit(1);
}

processFile(inputFile, downloadDir).catch(err => {
    console.error('Error:', err);
});
