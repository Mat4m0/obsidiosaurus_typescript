import { readConfiguration } from './configParser';

let SIDEBAR: string = "";
let ADMONITION_WHITESPACES: number = 0;

/**
 * Add 'displayed_sidebar' to the frontmatter of the markdown file.
 */
export function writeSidebarFrontmatter(line: string): [string, boolean] {
    const { SIDEBAR } = readConfiguration();
    let sidebarChecked = false;

    if (line === "---\n") {
        line = "---\ndisplayed_sidebar: " + SIDEBAR + "\n";
    } else {
        const oldLine = line;
        line = "---\ndisplayed_sidebar: " + SIDEBAR + "\n---\n" + oldLine;
    }
    
    sidebarChecked = true;

    return [line, sidebarChecked];
}

/**
 * This function processes a line in a markdown file, and returns the processed line,
 * and the updated values of the flags in_admonition and in_quote.
 */
export function convertAdmonition(line: string, inAdmonition: boolean, inQuote: boolean): [string, boolean, boolean] {
    const { SUPPORTED_ADMONITION_TYPES } = readConfiguration();

    let processedLine = "";

    if (inAdmonition) {
        if (line === "\n") {
            inAdmonition = false;
            processedLine = ":::\n\n";
        } else {
            processedLine = line.slice(ADMONITION_WHITESPACES);
        }
    } else if (inQuote) {
        if (line.includes("-")) {
            processedLine = line.replace(/-/g, "—");
            processedLine = "> \n" + processedLine;
            inQuote = false;
        } else {
            processedLine = line;
        }
    } else {
        let admonitionType = "", title = "";

        if (line.startsWith(">")) {
            const match = line.match(/\[!(.*)]/);
            if (match) {
                admonitionType = match[1];
                const titleMatch = line.match(/\[!(.*)] (.*)/);
                if (titleMatch) {
                    title = titleMatch[2];
                }
            }

            ADMONITION_WHITESPACES = line.indexOf("[") - line.indexOf(">");
        }

        if (admonitionType) {
            if (admonitionType === "quote") {
                processedLine = "";
                inQuote = true;
            } else if (!SUPPORTED_ADMONITION_TYPES.includes(admonitionType)) {
                processedLine = line;
            } else {
                inAdmonition = true;
                processedLine = title ? `:::${admonitionType} ${title}\n` : `:::${admonitionType}\n`;
            }
        } else {
            processedLine = line;
        }
    }

    return [processedLine, inAdmonition, inQuote];
}
