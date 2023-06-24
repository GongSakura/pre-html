import { HTMLElement, Node, parse } from "node-html-parser";
import { REACT_INTRINSICELEMENT } from "./types";
import { parse as JSONParse } from "comment-json";
import * as path from "path";
import { mkdir, readFile, stat, writeFile } from "fs/promises";

interface IDocument {
  uri: string;
  fileName: string;
  rawText: string;
}
interface IElement {
  rawTag?: string;
  tag?: string;
}

const pattern = /tt\=['"`](\w+)['"`]/g;
const declarationFilename = "react.d.ts";
const IS_FILE = "is_file";
function extractTag(text: string) {
  const matches = text.match(pattern);
  if (matches) {
    const res = matches.pop()?.match(/tt\=['"`](\w+)['"`]/);
    if (Array.isArray(res)) {
      return res[1];
    }
  }
}
async function findTypeRoot(dist: string) {
  let currPath = path.resolve(path.dirname(dist));
  let flag1 = 0;
  let flag2 = 0;
  let typeRoot: string = "";
  let alterTypeRoot: string = "";
  while (true) {
    // search node_modules/@types
    if (flag1 === 0) {
      try {
        const _path = path.resolve(currPath, "node_modules/@types");
        const res = await stat(_path);
        if (res.isDirectory()) {
          flag1 = 1;
          typeRoot = _path;
        }
      } catch {}
    }

    //search ts.config
    if (flag2 === 0) {
      try {
        const res: any = JSONParse(
          await readFile(path.resolve(currPath, "tsconfig.json"), "utf8")
        );
        flag2 = 1;
        if (Array.isArray(res?.compilerOptions?.typeRoots)) {
          flag1 = 1;
          res?.compilerOptions?.typeRoots.forEach((e: string) => {
            if (e !== typeRoot) {
              alterTypeRoot = path.resolve(currPath, e);
            }
          });
        }
      } catch {}
    }
    const nextPath = path.resolve(path.dirname(currPath));
    if (nextPath === currPath) {
      return;
    }
    if (flag1 === 1 && flag2 === 1) {
      return typeRoot || alterTypeRoot;
    }
    currPath = nextPath;
  }
}
async function writeDeclaration(
  dist: string,
  partialContent: string
): Promise<void> {
  const content = `
  import 'react'
  declare module React{
    namespace JSX{
        interface IntrinsicElements {
          ${partialContent}
        }
    }
  }
  `;

  try {
    const _stat = await stat(dist);
    if (_stat.isFile()) {
      throw new Error(IS_FILE);
    }
  } catch (error: any) {
    if (error.message === IS_FILE) {
      throw error;
    } else {
      await mkdir(dist);
    }
  }

  const _path = path.resolve(dist, declarationFilename);
  await writeFile(_path, content);
}

export function getPreHTMLElements(rawText: string) {
  // extract node
  const root = parse(rawText);
  const elements: IElement[] = [];

  function search(node: HTMLElement) {
    let element: IElement = {
      rawTag: node.rawTagName,
    };

    if (node.nodeType === 1) {
      const tag = extractTag(node.rawAttrs);
      if (tag) {
        element = {
          rawTag: node.rawTagName,
          tag,
        };
      }
    }

    node.childNodes.forEach((child: any) => {
      if (child.nodeType === 3) {
        const tag = extractTag(child.rawText);
        if (tag) {
          element.tag = tag;
        }
      } else if (child.nodeType === 1) {
        search(child);
      }
    });

    if (element.tag && element.rawTag) {
      elements.push(element);
    }
  }
  search(root);
  return elements;
}
export async function updateReactDeclaration(document: IDocument) {
  try {
    const fileName = document.fileName;
    const typeRoot = await findTypeRoot(fileName);
    if (typeRoot) {
      const toProcessElements = getPreHTMLElements(document.rawText);
      const content: string = toProcessElements.reduce((acc, curr) => {
        const tag = curr.tag || "div";
        return acc + `${curr.rawTag}:${REACT_INTRINSICELEMENT[tag]} & {tt:string};\n`;
      }, "");
       await writeDeclaration(
        path.resolve(typeRoot, "./prehtml"),
        content
      );

     
    }
  } catch (error: any) {
    console.info(`error:`,error)
    return error.message;
  }
}
