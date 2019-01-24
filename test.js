const data = require("./test_data");
const lib = require("./lib");

it("can get frame", () => {
    const frame = lib.getCommentFrame(data.comments[0], data);
    console.log(data.comments[0].message);
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