execSync = require("child_process").execSync;


const ACCESS_TOKEN = "paste access token here";
const FILE_ID = "paste file ID here";


const document = get(`/v1/files/${FILE_ID}`).document;
const comments = get(`/v1/files/${FILE_ID}/comments`).comments;
const rows = comments.map(toResultRow);
console.log(toCSV(rows));


// Utility functions

function get(endpoint) {
    const output = execSync(`curl -sH 'X-FIGMA-TOKEN: ${ACCESS_TOKEN}' 'https://api.figma.com${endpoint}'`).toString('utf8');
    return JSON.parse(output);
}

function getCommentFrame(comment) {
    if (!isReply(comment)) {
        return findChildById(document, comment.client_meta.node_id);
    } else {
        const parentComment = comments.find(_ => _.id === comment.parent_id)
        return findChildById(document, parentComment.client_meta.node_id);
    }
}

function getCommentTags(comment) {
    return comment.message.match(/#\w+/g) || [];
}

function isReply(comment) {
    return comment.client_meta === null;
}

function toResultRow(comment) {
    return [
        comment.message,
        getCommentFrame(comment).name,
        getCommentTags(comment).join(",")
    ];
}

function toCSV(rows) {
    return rows.map(row => row.join("\t")).join("\n");
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