const { create } = require('kubo-rpc-client');
const { IPFS_ENDPOINT, IPFS_PROJECT_ID, IPFS_PROJECT_SECRET } = require('../config/keys');
const monitoring = require('./monitoring');
const logger = require('./logger');

// Create authenticated IPFS client
let ipfs;
try {
  // Check if we have authentication credentials
  if (IPFS_PROJECT_ID && IPFS_PROJECT_SECRET) {
    // Create authenticated client
    const auth = 'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64');
    
    ipfs = create({
      url: IPFS_ENDPOINT,
      headers: {
        authorization: auth
      }
    });
    
    logger.logInfo('✅ IPFS client created with authentication');
  } else {
    // Create unauthenticated client (for local development)
    ipfs = create({ url: IPFS_ENDPOINT });
    logger.logInfo('✅ IPFS client created without authentication');
  }
} catch (error) {
  logger.logError(`❌ Failed to create IPFS client: ${error.message}`);
  // Create a fallback mock client that logs errors
  ipfs = {
    add: async () => { 
      throw new Error('IPFS client not properly initialized');
    },
    cat: async function* () {
      throw new Error('IPFS client not properly initialized');
    },
    version: async () => {
      throw new Error('IPFS client not properly initialized');
    }
  };
}

const uploadToIPFS = async (data) => {
  try {
    monitoring.metrics.ipfsOperationsTotal.inc({ operation: 'upload' });
    const result = await ipfs.add(data);
    logger.logInfo(`✅ File uploaded to IPFS with CID: ${result.path}`);
    return result.path; // CID of the uploaded content
  } catch (error) {
    logger.logError(`❌ Error uploading to IPFS: ${error.message}`);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

const fetchFromIPFS = async (cid) => {
  try {
    monitoring.metrics.ipfsOperationsTotal.inc({ operation: 'fetch' });
    let content = '';
    for await (const chunk of ipfs.cat(cid)) {
      content += new TextDecoder().decode(chunk);
    }
    if (!content) {
      throw new Error('No content found');
    }
    logger.logInfo(`✅ File retrieved from IPFS with CID: ${cid}`);
    return content;
  } catch (error) {
    logger.logError(`❌ Error fetching from IPFS: ${error.message}`);
    throw new Error(`Failed to fetch from IPFS: ${error.message}`);
  }
};

// Check if IPFS node is available
const checkIPFSConnection = async () => {
  try {
    const version = await ipfs.version();
    logger.logInfo(`✅ IPFS node is reachable (version: ${version.version})`);
    return true;
  } catch (error) {
    logger.logError(`❌ IPFS node not reachable: ${error.message}`);
    return false;
  }
};

module.exports = { uploadToIPFS, fetchFromIPFS, checkIPFSConnection };