const get = require("https").get;
const parseURL = require("url").parse;


const ACCESS_TOKEN = "paste access token here";
const FILE_ID = "paste file ID here";

let document, comments;

async function main() {
    try {
        document = await figmaAPIRequest(`/v1/files/${FILE_ID}`);
        document = document.document;
        
        comments = await figmaAPIRequest(`/v1/files/${FILE_ID}/comments`);
        comments = comments.comments;
        
        const rows = comments.map(toResultRow);
        console.log(toCSV(rows));
    } catch (e) {
        console.error(e);
    }
};

main();



// Utility functions

function figmaAPIRequest(endpoint) {
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