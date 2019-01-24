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

| Comment                            | Created              | Frame   | Tags        |
| -----------------------------------|----------------------|---------|-------------|
| Comment #tag1 #tag2                | 2019-01-10T17:00:00Z | Frame A | #tag1,#tag2 |
| Second comment                     | 2019-01-10T17:00:01Z | Frame C |             |
| A followup to first comment #tag2  | 2019-01-10T17:00:02Z | Frame A | #tag2       |