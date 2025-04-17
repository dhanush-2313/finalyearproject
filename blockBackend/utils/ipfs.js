const ipfsClient = require('ipfs-http-client');
const { IPFS_ENDPOINT } = require('../config/keys');

const ipfs = ipfsClient({ url: IPFS_ENDPOINT });

const uploadToIPFS = async (data) => {
  const result = await ipfs.add(data);
  return result.path; // CID of the uploaded content
};

const fetchFromIPFS = async (cid) => {
  for await (const file of ipfs.cat(cid)) {
    return file.toString('utf8');
  }
};

module.exports = { uploadToIPFS, fetchFromIPFS };