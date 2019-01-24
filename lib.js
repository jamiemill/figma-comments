const get = require("https").get;
const parseURL = require("url").parse;

async function fetchDocumentWithComments({ACCESS_TOKEN, FILE_ID}) {
    const documentRes = await figmaAPIRequest(`/v1/files/${FILE_ID}`, {ACCESS_TOKEN, FILE_ID});
    const commentsRes = await figmaAPIRequest(`/v1/files/${FILE_ID}/comments`, {ACCESS_TOKEN, FILE_ID});
    return {
        document: documentRes.document,
        comments: commentsRes.comments
    };
}

function figmaAPIRequest(endpoint, {ACCESS_TOKEN, FILE_ID}) {
    const url = `https://api.figma.com${endpoint}`;
    const headers = {'X-FIGMA-TOKEN': ACCESS_TOKEN};

    return new Promise((resolve, reject) => {
        get({...parseURL(url), headers}, function(res){
            if (res.statusCode !== 200) {
                reject(`Request for "${url}" failed.\nStatus Code: ${res.statusCode}\nMessage: ${res.statusMessage}`);
            } else {
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                });
            }
        });
    });
}

function getCommentFrame(comment, data) {
    if (!isReply(comment)) {
        return findChildById(data.document, comment.client_meta.node_id);
    } else {
        const parentComment = data.comments.find(_ => _.id === comment.parent_id)
        return findChildById(data.document, parentComment.client_meta.node_id);
    }
}

function getCommentTags(comment) {
    return comment.message.match(/#\w+/g) || [];
}

function isReply(comment) {
    return comment.client_meta === null;
}

function findChildById(parent, id) {
    if (parent.id === id) {
        return parent;
    } else if (parent.children) {
        for (let i = 0; i < parent.children.length; i += 1) {
            let result = findChildById(parent.children[i], id);
            if (result !== false) {
                return result;
            }
        }
    }
    return false;
}

function byCreated(a,b) {
    if (a.created_at < b.created_at) return -1;
    if (a.created_at > b.created_at) return 1;
    return 0;
}

function generateFrameURL(frame, {FILE_ID}) {
    return `https://www.figma.com/proto/${FILE_ID}/?node-id=${encodeURIComponent(frame.id)}`;
}

module.exports = {
    figmaAPIRequest,
    fetchDocumentWithComments,
    getCommentFrame,
    getCommentTags,
    isReply,
    findChildById,
    byCreated,
    generateFrameURL
};