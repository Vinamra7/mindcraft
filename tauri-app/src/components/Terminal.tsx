import React, { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

interface TerminalProps {
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Terminal: React.FC<TerminalProps> = ({setIsTerminalOpen}) => {
  const [status, setStatus] = useState<string>("");
  const [nodeOut, setNodeOut] = useState<string>("");
  const [nodeErr, setNodeErr] = useState<string>("");

  useEffect(() => {
    const unsubscribers: Promise<() => void>[] = [];
    unsubscribers.push(
      listen("setup-status", (event) => {
        setStatus(event.payload as string);
      })
    );

    unsubscribers.push(
      listen("node-output", (event) => {
        setNodeOut((prev) => prev + "\n" + (event.payload as string));
      })
    );

    unsubscribers.push(
      listen("node-error", (event) => {
        setNodeErr((prev) => prev + "\n" + (event.payload as string));
      })
    );

    return () => {
      unsubscribers.forEach(async (unsub) => {
        const unsubFn = await unsub;
        unsubFn();
      });
    };
  }, []);

  const displayMessage = () => {
    if (status && status !== "Setup completed successfully!") return status;
    else if (nodeOut) return nodeOut;
    else if (nodeErr) return nodeErr;
    else return "";
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-95 overflow-hidden h-full w-full flex items-center justify-center p-4">
        <div className="relative bg-black w-full max-w-3xl h-[600px] rounded-lg shadow-2xl border border-gray-700">
          {/* Terminal Header */}
          <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
            <div className="flex space-x-2">
              {/* <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div> */}
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
          <div className="terminal-scrollbar p-4 h-[calc(100%-40px)] overflow-y-auto">
            <pre className="font-mono text-green-400 text-sm whitespace-pre-wrap">
              <code>{`$ ${displayMessage()}`}</code>
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