import React, { useState, useEffect, useRef  } from "react";
import { listen } from "@tauri-apps/api/event";
import { TerminalMessasge } from "./HomePage";

interface TerminalProps {
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: TerminalMessasge[];
  setMessages: React.Dispatch<React.SetStateAction<TerminalMessasge[]>>;

}

const Terminal: React.FC<TerminalProps> = ({ setIsTerminalOpen, messages, setMessages }) => {
  const [activeTab, setActiveTab] = useState<"output" | "error">("output");

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    
    const unsubscribers: Promise<(() => void)>[] = [];

    // Setup status listener
    unsubscribers.push(
      listen("setup-status", (event) => {
        setMessages(prev => [...prev, { type: 'output', content: event.payload as string }]);
      })
    );

    // Install status listener
    unsubscribers.push(
      listen("install-status", (event) => {
        setMessages(prev => [...prev, { type: 'output', content: event.payload as string }]);
      })
    );

    // Install error listener
    unsubscribers.push(
      listen("install-error", (event) => {
        setMessages(prev => [...prev, { type: 'error', content: event.payload as string }]);
      })
    );

    // Node output listener
    unsubscribers.push(
      listen("node-output", (event) => {
        setMessages(prev => [...prev, { type: 'output', content: event.payload as string }]);
      })
    );

    // Node error listener
    unsubscribers.push(
      listen("node-error", (event) => {
        setMessages(prev => [...prev, { type: 'error', content: event.payload as string }]);
      })
    );

    return () => {
      unsubscribers.forEach(async (unsub) => {
        const unsubFn = await unsub;
        unsubFn();
      });
    };
  }, []);

  const displayMessages = () => {
    return messages
      .filter(msg => activeTab === "output" ? msg.type === 'output' : msg.type === 'error')
      .map(msg => msg.content)
      .join('\n');
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-95 overflow-hidden h-full w-full flex items-center justify-center p-4">
        <div className="relative bg-black w-full max-w-3xl h-[600px] rounded-lg shadow-2xl border border-gray-700">
          {/* Terminal Header */}
          <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("output")}
                className={`px-3 py-1 rounded ${
                  activeTab === "output"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Output
              </button>
              <button
                onClick={() => setActiveTab("error")}
                className={`px-3 py-1 rounded ${
                  activeTab === "error"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Error
              </button>
            </div>
            <div className="text-gray-400 text-sm">Terminal Output</div>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              ✕
            </button>
          </div>

          {/* Terminal Content */}
          <div
          ref={terminalRef}
          className="terminal-scrollbar p-4 h-[calc(100%-40px)] overflow-y-auto">
            <pre className={`font-mono ${activeTab === "output" ? "text-green-400" : "text-red-400"} text-sm whitespace-pre-wrap`}>
              <code>{`$ ${displayMessages()}`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Inline styles */}
      <style>
        {`
          .terminal-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .terminal-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1a;
          }

          .terminal-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }

          .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </>
  );
};

export default Terminal;