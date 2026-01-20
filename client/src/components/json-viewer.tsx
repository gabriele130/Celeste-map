import { useState } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: unknown;
  collapsed?: boolean;
}

export function JsonViewer({ data, collapsed = false }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-md border bg-muted/30 overflow-hidden" data-testid="json-viewer">
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCopy}
          className="h-8 w-8"
          data-testid="button-copy-json"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <div className="p-4 overflow-auto max-h-96 font-mono text-sm">
        <JsonNode data={data} initialCollapsed={collapsed} depth={0} />
      </div>
    </div>
  );
}

interface JsonNodeProps {
  data: unknown;
  initialCollapsed: boolean;
  depth: number;
  keyName?: string;
}

function JsonNode({ data, initialCollapsed, depth, keyName }: JsonNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed && depth > 0);

  if (data === null) {
    return (
      <span>
        {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-orange-600 dark:text-orange-400">null</span>
      </span>
    );
  }

  if (typeof data === "boolean") {
    return (
      <span>
        {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-blue-600 dark:text-blue-400">{data.toString()}</span>
      </span>
    );
  }

  if (typeof data === "number") {
    return (
      <span>
        {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-green-600 dark:text-green-400">{data}</span>
      </span>
    );
  }

  if (typeof data === "string") {
    return (
      <span>
        {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-amber-600 dark:text-amber-400">"{data}"</span>
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <span>
          {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">[]</span>
        </span>
      );
    }

    return (
      <div>
        <span 
          className="cursor-pointer inline-flex items-center gap-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">[</span>
          {isCollapsed && <span className="text-muted-foreground">{data.length} items</span>}
          {isCollapsed && <span className="text-foreground">]</span>}
        </span>
        {!isCollapsed && (
          <>
            <div className="ml-4 border-l border-border pl-2">
              {data.map((item, index) => (
                <div key={index}>
                  <JsonNode data={item} initialCollapsed={initialCollapsed} depth={depth + 1} />
                  {index < data.length - 1 && <span className="text-foreground">,</span>}
                </div>
              ))}
            </div>
            <span className="text-foreground">]</span>
          </>
        )}
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return (
        <span>
          {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">{"{}"}</span>
        </span>
      );
    }

    return (
      <div>
        <span 
          className="cursor-pointer inline-flex items-center gap-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {keyName && <span className="text-purple-600 dark:text-purple-400">"{keyName}"</span>}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">{"{"}</span>
          {isCollapsed && <span className="text-muted-foreground">{entries.length} keys</span>}
          {isCollapsed && <span className="text-foreground">{"}"}</span>}
        </span>
        {!isCollapsed && (
          <>
            <div className="ml-4 border-l border-border pl-2">
              {entries.map(([key, value], index) => (
                <div key={key}>
                  <JsonNode data={value} initialCollapsed={initialCollapsed} depth={depth + 1} keyName={key} />
                  {index < entries.length - 1 && <span className="text-foreground">,</span>}
                </div>
              ))}
            </div>
            <span className="text-foreground">{"}"}</span>
          </>
        )}
      </div>
    );
  }

  return <span className="text-muted-foreground">undefined</span>;
}
