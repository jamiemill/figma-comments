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

function findChildById(node, id) {
    // base case
    if (node.id === id) {
        return node;
    }
    // error case
    else if (!node.children) {
        return false;
    }
    // recursion
    for (let i = 0; i < node.children.length; i += 1) {
        let result = findChildById(node.children[i], id);
        if (result !== false) {
            return result;
        }
    }
    return false;
}

function findInstances(node) {
    // base case
    if (node.type === "INSTANCE") {
        return [node];
    }
    // error case
    else if (node.type === "COMPONENT") {
        return [];
    }
    // recursion
    else if (node.children) {
        return flatten(node.children.map(findInstances));
    }
}

function findInstancesOfComponent(node, componentId) {
    return findInstances(node).filter(_ => _.componentId == componentId);
}

function getPathOfNodeWithId(node, id, path = []) {
    const name = node.name;
    // base case
    if (node.id === id) {
        return path;
    }
    // error case
    else if (!node.children) {
        return false;
    }
    // recursion
    for (let i = 0; i < node.children.length; i += 1) {
        let result = getPathOfNodeWithId(node.children[i], id, path.concat(name));
        if (result !== false) {
            return result;
        }
    }
    return false;
}

// iterate through instances and build up a map of components with counts, path etc.
function componentReportFromInstances(documentResponse) {
    const allInstances = findInstances(documentResponse.document);
    const allComponents = documentResponse.components;
    
    return allInstances.reduce((prev, _) => {
        if (!prev[_.componentId]) {
            const component = allComponents[_.componentId];
            const componentPath = getPathOfNodeWithId(documentResponse.document, _.componentId);
            const meta = {
                count: 0,
                path: componentPath
            };
            prev[_.componentId] = Object.assign({}, component, meta);
        }
        prev[_.componentId].count++;
        return prev;
    }, {});
}

function componentReportFromComponents(documentResponse) {
    const allComponents = documentResponse.components;
    let components = {};
    Object.keys(allComponents).forEach(id => {
        const meta = {
            count: findInstancesOfComponent(documentResponse.document, id).length,
            path: getPathOfNodeWithId(documentResponse.document, id)
        };
        components[id] = Object.assign({}, allComponents[id], meta);
    });
    return components;
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
    getPathOfNodeWithId,
    componentReportFromInstances,
    componentReportFromComponents
};