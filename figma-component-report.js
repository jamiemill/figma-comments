const lib = require("./lib");

async function main() {
    const {ACCESS_TOKEN, FILE_ID} = getArgs();
    
    const data = await lib.fetchDocumentWithComponents({ACCESS_TOKEN, FILE_ID});
    const summary = lib.componentSummary(data.documentRes);
    summary.forEach(component => {
        const path = component.path ? component.path.join(" > ") : "LIB_OR_DELETED";
        console.log(`${path} > ${component.name}`);
        console.log(`  Count: ${component.count}`);
        if (component.count) {
            console.log(`  Instances:`);
            component.instances.forEach(instance => {
                console.log(`    ${instance.path.join(" > ")}`);
            });
        }
    });
    console.log(`TOTAL COMPONENTS: ${summary.length}`);
    console.log(`LIBRARY COMPONENTS: ?`);
    console.log(`LOCAL COMPONENTS: ?`);
    console.log(`UNUSED LOCAL COMPONENTS: ?`);
    console.log(`DELETED LOCAL COMPONENTS THAT ARE STILL USED: ?`);
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
        node figma-component-report.js ACCESS_TOKEN FILE_ID
    `;
}

/*
for each component report:
- how many times it was used
use cases:
- know if you are using any local components that should be promoted to library
- know if any instances are orphaned (you deleted a parent component from the doc)
- know if you have any master symbols on your working page that you might want to promote to the symbols page
- find local components that are unused
maybe:
- know what's overridden in each instance - detect if you might have inherited an unwanted font size change, or a sub-symbol was swapped and if it was swapped for an internal or external component.
- special case components in the hidden "external symbols" group (although they're likely to have been moved and made visible somewhere). Always report the Page/Frame that contains the component? Group the results by those.
- does it find components that are only used inside other components? i.e. would their instance count be zero?
 */
