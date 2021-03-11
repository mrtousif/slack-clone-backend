const { createWriteStream, unlink } = require('fs');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
// Seed an empty DB.
// db.defaults({ uploads: [] }).write();

const UPLOAD_DIR = './uploads';
// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);

/**
 * Stores a GraphQL file upload. The file is stored in the filesystem and its
 * metadata is recorded in the DB.
 * @param {Promise<object>} upload GraphQL file upload.
 * @returns {Promise<object>} File metadata.
 */
const storeUpload = async (upload) => {
    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    const id = crypto.randomBytes(4);

    const path = `${UPLOAD_DIR}/${filename}`;
    const file = { id, filename, mimetype, path };

    // Store the file in the filesystem.
    await new Promise((resolve, reject) => {
        // Create a stream to which the upload will be written.
        const writeStream = createWriteStream(path);

        // When the upload is fully written, resolve the promise.
        writeStream.on('finish', resolve);

        // If there's an error writing the file, remove the partially written file
        // and reject the promise.
        writeStream.on('error', (error) => {
            // eslint-disable-next-line node/prefer-promises/fs
            unlink(path, () => {
                reject(error);
            });
        });

        // In Node.js <= v13, errors are not automatically propagated between piped
        // streams. If there is an error receiving the upload, destroy the write
        // stream with the corresponding error.
        stream.on('error', (error) => writeStream.destroy(error));

        // Pipe the upload into the write stream.
        stream.pipe(writeStream);
    });

    // Record the file metadata in the DB.
    // db.get('uploads').push(file).write();

    return file;
};

module.exports = storeUpload;
