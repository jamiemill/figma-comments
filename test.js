const data = require("./test_data");
const data2 = require("./test_data_2");
const data3 = require("./test_data_3");
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

it("can find all instances", () => {
    const expected = [
      {
        id: "1:18",
        name: "Local button instance from Symbols page",
        componentName: "LocalButtonComponentSymbolsPage",
        isFromLibrary: "FALSE",
        componentId: "1:17"
      },
      {
        id: "1:29",
        name: "Library button instance",
        componentName: "02. buttons / primary / focus",
        isFromLibrary: "TRUE",
        componentId: "1:24"
      },
      {
        id: "1:7",
        name: "Local button instance from same page",
        componentName: "LocalButtonComponentSamePage",
        isFromLibrary: "FALSE",
        componentId: "1:6"
      }
    ];
    const actual = lib.findInstances(data2.documentRes.document).map(summariseInstance);

    function summariseInstance(_) {
        return {
            id: _.id,
            name: _.name,
            componentName: data2.documentRes.components[_.componentId].name,
            isFromLibrary: data2.documentRes.components[_.componentId].key ? "TRUE" : "FALSE",
            componentId: _.componentId
        };
    }

    expectEquivalent(actual, expected);
});

it("can report on repeated component usage by looking at instances", () => {
    const actual = lib.componentReportFromInstances(data3.documentRes);

    const expected = {
      "1:17": {
        key: "",
        name: "LocalButtonComponentSymbolsPage",
        description: "",
        count: 2,
        path: ["Document", "Symbols"]
      },
      "1:24": {
        key: "3c729d01bd5e64e69eff1af87c076d5586e9564d",
        name: "02. buttons / primary / focus",
        description: "",
        count: 2,
        path: false
      },
      "1:6": {
        key: "",
        name: "LocalButtonComponentSamePage",
        description: "",
        count: 2,
        path: ["Document", "Page 1"]
      },
      "9:17": {
        key: "",
        name: "LocalButtonComponentDeleted",
        description: "",
        count: 1,
        path: false
      }
    };
    expectEquivalent(actual, expected);
});

it("can report on repeated component usage by looking at components", () => {
    const actual = lib.componentReportFromComponents(data3.documentRes);

    const expected = {
      "1:17": {
        key: "",
        name: "LocalButtonComponentSymbolsPage",
        description: "",
        count: 2,
        path: ["Document", "Symbols"]
      },
      "1:24": {
        key: "3c729d01bd5e64e69eff1af87c076d5586e9564d",
        name: "02. buttons / primary / focus",
        description: "",
        count: 2,
        path: false
      },
      "1:6": {
        key: "",
        name: "LocalButtonComponentSamePage",
        description: "",
        count: 2,
        path: ["Document", "Page 1"]
      },
      "9:17": {
        key: "",
        name: "LocalButtonComponentDeleted",
        description: "",
        count: 1,
        path: false
      }
    };
    // object keys are in different order so test this way
    const keys = Object.keys(actual).sort();
    expectEquivalent(keys, ["1:17", "1:24", "1:6", "9:17"]);
    keys.forEach(k => {
      expectEquivalent(actual[k], expected[k]);
    });
});

it("can output the path of a node", () => {
    const expected = ["Document", "Page 1", "Frame 1"];
    const actual = lib.getPathOfNodeWithId(data3.documentRes.document, "1:18");
    expectEquivalent(actual, expected);
});

it("can create a summary of component usage", () => {
    /*
    Library / some-name
    - count: 1
    - usage:
    Document / Symbols / something
    - count: 1
    - instances:
        - Document / Page 1 / Frame 1 (3 times)
        - Document / Page 1 / Frame 2 (1 time)
    */
    const expected = [
      {
        path: ["Document", "Page 1"],
        name: "LocalButtonComponentSamePage",
        count: 2,
        instances: [
          {
            path: ["Document", "Page 1", "Frame 1"]
          },
          {
            path: ["Document", "Page 1", "Frame 2"]
          }
        ]
      },
      {
        path: ["Document", "Symbols"],
        name: "LocalButtonComponentSymbolsPage",
        count: 2,
        instances: [
          {
            path: ["Document", "Page 1", "Frame 1"]
          },
          {
            path: ["Document", "Page 1", "Frame 2"]
          }
        ]
      },
      {
        path: false,
        name: "02. buttons / primary / focus",
        count: 2,
        instances: [
          {
            path: ["Document", "Page 1", "Frame 1"]
          },
          {
            path: ["Document", "Page 1", "Frame 2"]
          }
        ]
      },
      {
        path: false,
        name: "LocalButtonComponentDeleted",
        count: 1,
        instances: [
          {
            path: ["Document", "Page 1", "Frame 1"]
          }
        ]
      }
    ];
    const actual = lib.componentSummary(data3.documentRes);
    expectEquivalent(actual, expected);
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

function expectEquivalent(actual, expected) {
    if (pp(actual) !== pp(expected)) {
        throw `  "${pp(actual)}" was expected to be "${pp(expected)}"`;
    }
}

function pp(obj) {
    return JSON.stringify(obj, null, "  ");
}