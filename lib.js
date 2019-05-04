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


async function fetchDocumentWithComponents({ACCESS_TOKEN, FILE_ID}) {
    const documentRes = await figmaAPIRequest(`/v1/files/${FILE_ID}`, {ACCESS_TOKEN, FILE_ID});
    return {
        documentRes
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
    const rootComment = isReply(comment) ?
        findCommentById(data.comments, comment.parent_id)
        : comment;
    return findChildById(data.document, rootComment.client_meta.node_id);
}

function findCommentById(comments, id) {
    return comments.find(_ => _.id === id);
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

function findInstances(parent) {
    if (parent.type === "INSTANCE") {
        return [parent];
    } else if (parent.type === "COMPONENT") {
        return [];
    } else if (parent.children) {
        return flatten(parent.children.map(findInstances));
    }
}

function getPathOfNodeWithId(parent, id, path = []) {
    const name = parent.name;
    // base case
    if (parent.id === id) {
        return path;
    }
    // error case
    else if (!parent.children) {
        return false;
    }
    // recursion
    else if (parent.children) {
        for (let i = 0; i < parent.children.length; i += 1) {
            let result = getPathOfNodeWithId(parent.children[i], id, path.concat(name));
            if (result !== false) {
                return result;
            }
        }
    } else {
        throw "unhandled state";
    }
    return false;
}


function flatten(arr) {
    return arr.reduce((prev,current) => prev.concat(current));
}

function byCreated(a,b) {
    if (a.created_at < b.created_at) return -1;
    if (a.created_at > b.created_at) return 1;
    return 0;
}

function generateFrameURL(frame, {FILE_ID}) {
    return `https://www.figma.com/proto/${FILE_ID}/?node-id=${encodeURIComponent(frame.id)}`;
}

function toCSV(rows) {
    return rows.map(row => row.map(c=>c.replace(/"/g,'""')).map(c=>`"${c}"`).join("\t")).join("\n");
}

module.exports = {
    figmaAPIRequest,
    fetchDocumentWithComments,
    fetchDocumentWithComponents,
    getCommentFrame,
    getCommentTags,
    isReply,
    findChildById,
    byCreated,
    generateFrameURL,
    toCSV,
    findInstances,
    getPathOfNodeWithId
};