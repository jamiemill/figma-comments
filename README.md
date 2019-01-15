# Figma Comments

Extract comments from a Figma file

## Requires

* Node.js to be installed.

## Instructions

1. Generate a "personal access token" in your Figma Account Settings page and paste it as `ACCESS_TOKEN` in the script.
2. Get the `FILE_ID` from your file's URL https://www.figma.com/file/`FILE_ID`/`FILE_NAME` and paste it as `FILE_ID` in the script.
3. Run the script like this, dumping the output into a file:
```
    node figma-comments-to-tsv.js > some-file.tsv
```