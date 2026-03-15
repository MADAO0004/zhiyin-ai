declare module "react-syntax-highlighter" {
  import { ComponentType } from "react";
  export const Prism: ComponentType<{
    style?: Record<string, React.CSSProperties>;
    language?: string;
    PreTag?: string;
    customStyle?: React.CSSProperties;
    codeTagProps?: { style?: React.CSSProperties };
    children?: string;
  }>;
}

declare module "react-syntax-highlighter/dist/cjs/styles/prism" {
  export const oneDark: Record<string, React.CSSProperties>;
}
