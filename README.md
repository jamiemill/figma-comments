# Figma Comments

Extract comments from a Figma file

## Requires

* Node.js to be installed.

## Instructions

1. Generate a "personal access token" in your Figma Account Settings page.
2. Get the file ID from your file's URL https://www.figma.com/file/`FILE_ID`/`FILE_NAME`
3. Run the script like this, dumping the output into a file:
```
    node figma-comments-to-tsv.js ACCESS_TOKEN FILE_ID > output.tsv
```