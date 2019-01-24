const lib = require("./lib");

async function main() {
    const {ACCESS_TOKEN, FILE_ID} = getArgs();
    
    const data = await lib.fetchDocumentWithComments({ACCESS_TOKEN, FILE_ID});

    const rows = data.comments
        .slice()
        .sort(lib.byCreated)
        .map(toResultRow(data, {FILE_ID}));

    console.log(toCSV([headerRow(), ...rows]));
}

main().catch(e => console.error(e));


function getArgs() {
    const [ACCESS_TOKEN, FILE_ID] = process.argv.slice(2);
    if (!ACCESS_TOKEN || !FILE_ID) throw usage();
    return {ACCESS_TOKEN, FILE_ID};
}

function usage() {
    return `
    Usage:
        node figma-comments-to-tsv.js ACCESS_TOKEN FILE_ID > output.tsv
    `;
}

function headerRow() {
    return ["Comment", "Created", "Frame", "Tags", "Frame Link"];
}

function toResultRow(data, {FILE_ID}) {
    return function(comment) {
        return [
            comment.message,
            comment.created_at,
            lib.getCommentFrame(comment, data).name,
            lib.getCommentTags(comment).join(","),
            lib.generateFrameURL(lib.getCommentFrame(comment, data), FILE_ID)
        ];
    }
}

function toCSV(rows) {
    return rows.map(row => row.join("\t")).join("\n");
}