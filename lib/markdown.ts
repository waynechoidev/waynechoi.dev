import "server-only";

import hljs from "highlight.js/lib/core";
import cpp from "highlight.js/lib/languages/cpp";
import glsl from "highlight.js/lib/languages/glsl";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import katex from "katex";
import { Marked, type Tokens } from "marked";
import sanitizeHtml from "sanitize-html";

hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c++", cpp);
hljs.registerLanguage("glsl", glsl);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("html", xml);

const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }: Tokens.Code) {
      const language = lang?.toLowerCase();
      const highlighted = language && hljs.getLanguage(language)
        ? hljs.highlight(text, { language }).value
        : sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
      return `<pre><code class="hljs${language ? ` language-${language}` : ""}">${highlighted}</code></pre>`;
    },
  },
  extensions: [
    {
      name: "blockKatex",
      level: "block",
      start: (source) => source.indexOf("$$"),
      tokenizer(source) {
        const match = /^\$\$\s*\n?([\s\S]+?)\n?\s*\$\$(?:\n|$)/.exec(source);
        return match ? { type: "blockKatex", raw: match[0], text: match[1] } : undefined;
      },
      renderer: (token) => katex.renderToString(token.text, { displayMode: true, throwOnError: false }),
    },
    {
      name: "inlineKatex",
      level: "inline",
      start: (source) => source.indexOf("$"),
      tokenizer(source) {
        const match = /^\$([^\s$](?:[^$\n]*?[^\s$])?)\$(?!\d)/.exec(source);
        return match ? { type: "inlineKatex", raw: match[0], text: match[1] } : undefined;
      },
      renderer: (token) => katex.renderToString(token.text, { throwOnError: false }),
    },
  ],
});

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "img", "iframe", "video", "source", "figure", "figcaption",
  "math", "semantics", "annotation", "mrow", "mi", "mo", "mn",
  "msup", "msub", "mfrac", "mover", "munder", "mtext", "mspace",
];

export function renderMarkdown(content: string): string {
  return sanitizeHtml(marked.parse(content) as string, {
    allowedTags,
    allowedAttributes: {
      "*": ["class", "aria-hidden"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      iframe: ["src", "title", "width", "height", "frameborder", "allow", "allowfullscreen", "referrerpolicy", "loading"],
      video: ["src", "width", "height", "controls", "autoplay", "muted"],
      source: ["src", "type"],
      annotation: ["encoding"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        const external = /^https?:\/\//.test(attributes.href ?? "");
        return {
          tagName: "a",
          attribs: {
            ...attributes,
            class: "md-link",
            ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
      img: (_tagName, attributes) => ({ tagName: "img", attribs: { ...attributes, loading: "lazy" } }),
      iframe: (_tagName, attributes) => ({ tagName: "iframe", attribs: { ...attributes, loading: "lazy" } }),
    },
  });
}
