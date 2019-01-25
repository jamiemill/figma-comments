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