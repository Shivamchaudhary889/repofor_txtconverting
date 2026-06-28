import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIMarkdownProps {
  children: string;
  className?: string;
}

function flattenChildren(children: ReactNode): string {
  if (children == null || children === false) return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(flattenChildren).join("");
  }
  if (typeof children === "object" && "props" in (children as any)) {
    return flattenChildren((children as any).props?.children);
  }
  return "";
}

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const lang = (language || "text").toLowerCase();
  const display = lang === "text" ? "code" : lang;

  return (
    <div className="group relative my-3 rounded-lg overflow-hidden border border-border bg-[#1e1e1e] text-[13px]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/50 border-b border-white/5">
        <span className="text-[11px] uppercase tracking-wider text-white/60 font-mono">
          {display}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-white/10"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        showLineNumbers
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          padding: "12px 14px",
          background: "transparent",
          fontSize: "12.5px",
          lineHeight: "1.55",
        }}
        lineNumberStyle={{
          opacity: 0.4,
          minWidth: "1.6em",
          paddingRight: "0.8em",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
          },
        }}
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

export function AIMarkdown({ children, className }: AIMarkdownProps) {
  return (
    <div className={cn("ai-prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-2 ai-gradient-text">{children}</h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-sm font-semibold mt-3 mb-1.5 ai-gradient-text">{children}</h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-foreground/90 mb-2 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-5 list-decimal marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed text-foreground/90 flex gap-2 items-start [li>&]:list-item">
              <span
                className="inline-block mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(258 90% 66%), hsl(190 95% 55%))",
                }}
              />
              <span className="flex-1 min-w-0">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/85">{children}</em>
          ),
          code: ({ children, className, ...props }: any) => {
            const match = /language-([\w+-]+)/.exec(className || "");
            const inline = !match && !(props.node?.position?.start?.line !== props.node?.position?.end?.line);
            // react-markdown v10 always passes `inline` based on context — fall back to className test
            if (!match) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.85em] border border-primary/20 break-words">
                  {children}
                </code>
              );
            }
            const code = flattenChildren(children);
            return <CodeBlock language={match[1]} code={code} />;
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote
              className="my-2 pl-3 border-l-2 italic text-foreground/80"
              style={{ borderImage: "linear-gradient(180deg, hsl(258 90% 66%), hsl(190 95% 55%)) 1" }}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="ai-gradient-text underline underline-offset-2">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 text-left font-semibold bg-muted/60 border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 border-b border-border/50">{children}</td>
          ),
          hr: () => (
            <hr
              className="my-3 border-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, hsl(258 90% 66% / 0.4), transparent)" }}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
