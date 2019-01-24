# Figma Comments

Extract comments from a Figma file into tab-separated text format.

Comments can optionally contain #hashtags which will be extracted into their own, comma-separated column.

## Requires

* Node.js to be installed.

## Instructions

1. Generate a "personal access token" in your Figma Account Settings page.
2. Get the file ID from your file's URL https://www.figma.com/file/`FILE_ID`/`FILE_NAME`
3. Run the script like this, dumping the output into a file:
```
    node figma-comments-to-tsv.js ACCESS_TOKEN FILE_ID > output.tsv
```

## Output

Data in tab-separated format, with columns like this:

| Comment                                  | Frame   | Tags  |
| -----------------------------------------|---------|-------|
| Second followup                          | Frame A |       |
| Comment on frame on page 2               | Frame C |       |
| A comment on frame A #tag2               | Frame B | #tag2 |
| A followup to a comment on Frame B #tag2 | Frame A | #tag2 |
| Another comment on Frame B #tag1         | Frame A | #tag1 |
| This is a comment on Frame B #tag1       | Frame A | #tag1 |