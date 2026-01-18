export const theme = {
  name: "raptor",
  type: "dark",
  colors: {
    "editor.background": "#1a1f2e",
    "editor.foreground": "#e4e4e7",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#64748b",
        fontStyle: "italic",
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier", "keyword.control"],
      settings: {
        foreground: "#f472b6",
      },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: {
        foreground: "#c4b5fd",
      },
    },
    {
      scope: ["string", "string.quoted.double", "string.quoted.single"],
      settings: {
        foreground: "#86efac",
      },
    },
    {
      scope: ["variable", "variable.other.readwrite", "variable.other.object"],
      settings: {
        foreground: "#c4b5fd",
      },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language.boolean",
        "constant.language.null",
      ],
      settings: {
        foreground: "#c4b5fd",
      },
    },
    {
      scope: [
        "entity.name.type",
        "support.type",
        "support.class",
        "entity.name.class",
      ],
      settings: {
        foreground: "#c4b5fd",
      },
    },
    {
      scope: ["punctuation", "meta.brace", "punctuation.section"],
      settings: {
        foreground: "#e4e4e7",
      },
    },
    {
      scope: [
        "keyword.operator",
        "punctuation.separator",
        "punctuation.terminator",
      ],
      settings: {
        foreground: "#f472b6",
      },
    },
  ],
};
