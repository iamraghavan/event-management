const axios = require('axios');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.ASSET_GH_OWNER;
const REPO = process.env.ASSET_GH_REPO;
const BRANCH = process.env.ASSET_GH_BRANCH || 'main';

class FileService {
    /**
     * Uploads a file to GitHub and returns the jsDelivr CDN URL.
     * Path format: em/{institution}/{dept}/{user}/{filename}
     */
    async uploadFile(fileBuffer, fileName, institutionCode, deptCode, userEmail) {
        try {
            const sanitizedUser = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
            const filePath = `em/${institutionCode}/${deptCode}/${sanitizedUser}/${Date.now()}_${fileName}`;
            
            const content = fileBuffer.toString('base64');

            const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;
            
            await axios.put(url, {
                message: `Upload ${fileName}`,
                content: content,
                branch: BRANCH
            }, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            // Construct jsDelivr URL
            // Format: https://cdn.jsdelivr.net/gh/user/repo@version/file
            const cdnUrl = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${filePath}`;
            return cdnUrl;

        } catch (error) {
            console.error('GitHub Upload Error:', error.response ? error.response.data : error.message);
            throw new Error('Failed to upload file to storage');
        }
    }
}

module.exports = new FileService();
