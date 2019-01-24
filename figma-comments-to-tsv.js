const get = require("https").get;
const parseURL = require("url").parse;

let document, comments, ACCESS_TOKEN, FILE_ID;

const headerRow = ["Comment", "Created", "Frame", "Tags"];

async function main() {

    [ACCESS_TOKEN, FILE_ID] = process.argv.slice(2);
    if (!ACCESS_TOKEN || !FILE_ID) {
        throw usage();
    }

    document = await figmaAPIRequest(`/v1/files/${FILE_ID}`);
    document = document.document;
    
    comments = await figmaAPIRequest(`/v1/files/${FILE_ID}/comments`);
    comments = comments.comments;
    
    const rows = comments.sort(byCreated).map(toResultRow);
    console.log(toCSV([headerRow, ...rows]));
}

main().catch(e => console.error(e));



// Utility functions

function usage() {
    return `
    Usage:
        node figma-comments-to-tsv.js ACCESS_TOKEN FILE_ID > output.tsv
    `;
}

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
        comment.created_at,
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

function byCreated(a,b) {
    if (a.created_at < b.created_at) return -1;
    if (a.created_at > b.created_at) return 1;
    return 0;
}