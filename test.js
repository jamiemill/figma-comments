const data = require("./test_data");
const lib = require("./lib");

it("can find document by ID", () => {
    const frame = lib.findChildById(data.document, "0:0");
    expectEqual(frame.name, "Document");
});

it("can find page by ID", () => {
    const frame = lib.findChildById(data.document, "0:1");
    expectEqual(frame.name, "Page 1");
});

it("can find another page by ID", () => {
    const frame = lib.findChildById(data.document, "4:0");
    expectEqual(frame.name, "Page 2");
});

it("can find frame by ID", () => {
    const frame = lib.findChildById(data.document, "1:3");
    expectEqual(frame.name, "Frame B");
});

it("can find the frame of a comment", () => {
    const frame = lib.getCommentFrame(data.comments[1], data);
    expectEqual(frame.name, "Frame C");
});

it("can find the frame of a reply", () => {
    const frame = lib.getCommentFrame(data.comments[0], data);
    expectEqual(frame.name, "Frame B");
});

it("can generate a frame URL", () => {
    const exampleFrame = { id: "1:1" };
    const url = lib.generateFrameURL(exampleFrame, {FILE_ID: "AAA"});
    expectEqual(url, "https://www.figma.com/proto/AAA/?node-id=1%3A1");
});

it("can create TSVs", () => {
    const data = [["line 1 cell 1", "line 1 cell 2"], ["line 2 cell 1", "line 2 cell 2"]];
    const expected = `"line 1 cell 1"\t"line 1 cell 2"\n"line 2 cell 1"\t"line 2 cell 2"`;
    expectEqual(lib.toCSV(data), expected);
});

it("can create TSVs with newlines", () => {
    const data = [["cell with\nnewline", "cell 2"]];
    const expected = `"cell with\nnewline"\t"cell 2"`;
    expectEqual(lib.toCSV(data), expected);
});

it("can create TSVs with quotes", () => {
    const data = [["cell with \"quote\"", "cell 2"]];
    const expected = `"cell with ""quote"""\t"cell 2"`;
    expectEqual(lib.toCSV(data), expected);
});


function it(description, block) {
    try {
        block();
        console.log(`PASS: It ${description}`);
    } catch (e) {
        console.log(`FAIL: It ${description}`);
        console.log(e);
    }
}

function expectEqual(actual, expected) {
    if (actual !== expected) {
        throw `  "${actual}" was expected to be "${expected}"`;
    }
}