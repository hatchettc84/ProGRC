import { Parser } from "htmlparser2";
import { z } from "zod";

export interface TextElement {
  id: string;
  type: "text";
  data: string;
}

export interface TagElement {
  id: string;
  type: "tag";
  name: string;
  attributes: Record<string, string>;
  children: (TextElement | TagElement)[];
}

export type HtmlElement = TextElement | TagElement;

export interface ContentSection {
  id: string;
  tagName: string;
  content: (string | ContentSection)[];
  children: ContentSection[];
  style?: string; // Add the style property
}

const generateId = () => crypto.randomUUID();
const validateId = (id: string) => {
  const schema = z.string().trim().uuid();
  return schema.safeParse(id).success;
};

export const convertContentToSections = (htmlContent: string) => {
  // Parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const rootSections: ContentSection[] = [];
  const sectionStack: { level: number; section: ContentSection }[] = [];

  const createSection = (node: Element): ContentSection => {
    return {
      tagName: node.tagName.toLowerCase(),
      id: validateId(node.id) ? node.id : generateId(),
      content: [node.textContent || ""],
      children: [],
      style: node.getAttribute("style") || undefined, // Capture the style attribute
    };
  };

  Array.from(doc.body.children).forEach((node) => {
    if (node.tagName.match(/^h[1-6]$/i)) {
      const level = parseInt(node.tagName[1], 10); // Get the heading level (1 to 6)
      const newSection: ContentSection = createSection(node);

      while (
        sectionStack.length > 0 &&
        sectionStack[sectionStack.length - 1].level >= level
      ) {
        sectionStack.pop();
      }

      if (sectionStack.length === 0) {
        rootSections.push(newSection);
      } else {
        sectionStack[sectionStack.length - 1].section.children.push(newSection);
      }

      sectionStack.push({ level, section: newSection });
    } else {
      if (sectionStack.length > 0) {
        sectionStack[sectionStack.length - 1].section.children.push(
          createSection(node)
        );
      }
    }
  });

  return rootSections;
};

export const extractAllIds = (sections: ContentSection[]): string[] => {
  const ids: string[] = [];

  const traverse = (section: ContentSection) => {
    ids.push(section.id);
    section.children.forEach((child) => traverse(child));
  };

  sections.forEach((section) => traverse(section));

  return ids;
};

export const extractAllIdsForAllNodes = (sections: HtmlElement[]): string[] => {
  const ids: string[] = [];

  const traverse = (element: HtmlElement) => {
    // Add the main id of the element
    ids.push(element.id);

    if (element.type === "tag") {
      // Add the id from attributes if it exists
      if (element.attributes && element.attributes.id) {
        ids.push(element.attributes.id);
      }

      // Recursively traverse children
      element.children.forEach((child) => traverse(child));
    }
  };

  sections.forEach((section) => traverse(section));

  return ids;
};

// TODO: add test based on these
// Example usage:
// const htmlContent = `
//   <h1 id="header1" style="color: red;">Heading 1</h1>
//   <p id="para1" style="font-size: 14px;">This is a paragraph under Heading 1.</p>
//   <h2 id="header2" style="color: blue;">Heading 2</h2>
//   <p id="para2" style="font-weight: bold;">This is a paragraph under Heading 2.</p>
// `;

// const sections = convertContentToSections(htmlContent);
// this.logger.info(sections);
// const ids = extractAllIds(sections);
// this.logger.info(ids); // ["header1", "para1", "header2", "para2"]

export const convertToJson = (html: string): HtmlElement[] => {
  const result: HtmlElement[] = [];
  const id = generateId();
  let currentElement: TagElement = {
    id: id,
    type: "tag",
    name: "root",
    attributes: {},
    children: result,
  };
  const stack: TagElement[] = [currentElement];

  const parser = new Parser(
    {
      onopentag(name: string, attributes: Record<string, string>) {
        const id = generateId();
        const element: TagElement = {
          id: attributes.id ?? id,
          type: "tag",
          name,
          attributes,
          children: [],
        };
        currentElement.children.push(element);
        stack.push(element);
        currentElement = element;
      },
      ontext(text: string) {
        if (text.trim()) {
          currentElement.children.push({
            type: "text",
            data: text,
            id: generateId(),
          });
        }
      },
      onclosetag() {
        stack.pop();
        currentElement = stack[stack.length - 1];
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return result;
};

export const convertJsonToHtml = (json: HtmlElement[]): string => {
  return json
    .map((element) => {
      if (element.type === "text") {
        return element.data;
      }
      if (element.type === "tag") {
        const attributes = Object.entries(element.attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ");
        const children = convertJsonToHtml(element.children);
        return `<${element.name} ${attributes}>${children}</${element.name}>`;
      }
      return "";
    })
    .join("");
};
