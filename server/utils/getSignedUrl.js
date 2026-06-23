const cloudinary = require('../config/cloudinary');
const path = require('path');

function getSignedFileUrl(publicId, originalFileName) {
    const ext = path.extname(originalFileName).toLowerCase().replace('.', '');
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
    const format = isImage ? ext : 'pdf';

    return cloudinary.utils.private_download_url(publicId, format, {
        resource_type: 'image',
        type: 'authenticated',
        expires_at: Math.floor(Date.now() / 1000) + 300
    });
}

module.exports = getSignedFileUrl;
