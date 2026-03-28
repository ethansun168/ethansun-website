import { client } from '@/constants';
import { useLogin, useUsername } from '@/hooks/query';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';

type LogEntry = {
  type: 'user' | 'system' | 'prompt' | 'error';
  text: string;
};

type CommandConfig = {
  fn: (args: string[]) =>
    LogEntry |
    Generator<LogEntry, void, string> |
    AsyncGenerator<LogEntry, void, string> |
    null;
  description: string;
  type: 'shell' | 'file' | 'game';
}

// File System stuff
type NodeType = 'file' | 'directory';
interface BaseNode {
  id: string;
  name: string;
  parentID: string | null;
  type: NodeType;
  createdAt: number;
}

interface FileNode extends BaseNode {
  type: 'file';
  content: string;
}

interface DirectoryNode extends BaseNode {
  type: 'directory';
  children: string[];
}
type FileSystemNode = FileNode | DirectoryNode;

const initFileSystem: Map<string, FileSystemNode> = new Map([
  ['root', {
    id: 'root',
    name: '/',
    parentID: null,
    type: 'directory',
    children: ['bin', 'etc', 'home', 'var', 'file'],
    createdAt: Date.now(),
  }],
  ['bin', {
    id: 'bin',
    name: 'bin',
    parentID: 'root',
    type: 'directory',
    children: ['sh'],
    createdAt: Date.now(),
  }],
  ['sh', {
    id: 'sh',
    name: 'sh',
    parentID: 'bin',
    type: 'file',
    content: '#!/bin/sh\necho "Shell initialized."',
    createdAt: Date.now(),
  }],
  ['etc', {
    id: 'etc',
    name: 'etc',
    parentID: 'root',
    type: 'directory',
    children: ['hostname'],
    createdAt: Date.now(),
  }],
  ['hostname', {
    id: 'hostname',
    name: 'hostname',
    parentID: 'etc',
    type: 'file',
    content: 'v-linux-web-01',
    createdAt: Date.now(),
  }],
  ['home', {
    id: 'home',
    name: 'home',
    parentID: 'root',
    type: 'directory',
    children: ['user'],
    createdAt: Date.now(),
  }],
  ['user', {
    id: 'user',
    name: 'user',
    parentID: 'home',
    type: 'directory',
    children: ["bashrc"],
    createdAt: Date.now(),
  }],
  ['bashrc', {
    id: 'bashrc',
    name: '.bashrc',
    parentID: 'user',
    type: 'file',
    content: `alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
export HISTCONTROL=ignoreboth
export HISTSIZE=1000
export HISTFILESIZE=2000

export EDITOR='vi'

echo "Mirtsema Linux 1.0.4-LTS (GNU/Linux 5.15.0-generic x86_64)"
echo "Type 'help' to see available commands."`,
    createdAt: Date.now()
  }],
  ['var', {
    id: 'var',
    name: 'var',
    parentID: 'root',
    type: 'directory',
    children: [],
    createdAt: Date.now(),
  }],
]);

export function CommandLine() {
  const queryClient = useQueryClient();
  const COMMANDS: Record<string, CommandConfig> = {
    help: {
      fn: () => ({
        type: 'system',
        text: generateHelpText()
      }),
      description: 'Display this help menu',
      type: 'shell'
    },
    about: {
      fn: () => ({
        type: 'system',
        text: 'Mirtsema Terminal'
      }),
      description: 'Learn more about this terminal',
      type: 'shell'
    },
    clear: {
      fn: () => null,
      description: 'Clear the terminal screen',
      type: 'shell'
    },
    exit: {
      fn: () => null,
      description: 'Terminate the current session',
      type: 'shell'
    },
    sudo: {
      fn: () => ({
        type: 'error',
        text: 'User is not in the sudoers file. This incident will be reported.'
      }),
      description: "Execute a command as another user",
      type: 'shell'
    },
    history: {
      fn: () => ({
        type: 'system',
        text: generateHistoryText(commandHistory)
      }),
      description: 'List all commands typed in this session',
      type: 'shell'
    },
    whoami: {
      fn: () => ({
        type: 'system',
        text: username ?? "user"
      }),
      description: 'Print effective user name',
      type: 'shell'
    },
    login: {
      fn: async function* () {
        const username = yield { type: 'prompt', text: 'Enter username: ' };
        const password = yield { type: 'prompt', text: 'Enter password: ' };
        yield { type: 'system', text: "Verifying..." };
        try {
          const data = await login({ username, password })
          yield { type: 'system', text: `Welcome, ${data.username}!` }
        } catch (error) {
          yield { type: 'error', text: String(error) }
        }
      },
      description: "Log into the system",
      type: 'shell'
    },
    logout: {
      fn: async function* () {
        yield { type: 'system', text: "Logging out..." };
        try {
          await client.api.v1.logout.$get();
          queryClient.setQueryData(['user'], null);
          yield { type: 'system', text: "Successfully logged out!" };
        }
        catch {
          yield { type: 'error', text: "Logout failed." };
        }
      },
      description: "Log out of the system",
      type: 'shell'
    },
    game: {
      fn: async function* () {
        yield { type: 'system', text: `Welcome to the game, ${username}!` };

        while (true) {
          const answer = yield {
            type: 'prompt', text: `What would you like to do? Valid choices are
(1) rock paper scissors
(2) help
(3) quit
choice: `
          };
          switch (answer) {
            case "1": {
              const choice = yield {
                type: 'prompt', text: `(1) rock
(2) paper
(3) scissors
choice: `
              };

              const random = Math.floor(Math.random() * (3));
              let computerChoice: "rock" | "paper" | "scissors" | null = null;
              switch (random) {
                case 0: { computerChoice = "rock"; break; }
                case 1: { computerChoice = "paper"; break; }
                case 2: { computerChoice = "scissors"; break; }
              }

              let result: "tie" | "win" | "loss" | null = null;
              switch (choice) {
                case "1": {
                  switch (computerChoice) {
                    case "rock": { result = "tie"; break; }
                    case "paper": { result = "loss"; break; }
                    case "scissors": { result = "win"; break; }
                  }
                  break;
                }
                case "2": {
                  switch (computerChoice) {
                    case "rock": { result = "win"; break; }
                    case "paper": { result = "tie"; break; }
                    case "scissors": { result = "loss"; break; }
                  }
                  break;
                }
                case "3": {
                  switch (computerChoice) {
                    case "rock": { result = "loss"; break; }
                    case "paper": { result = "win"; break; }
                    case "scissors": { result = "tie"; break; }
                  }
                  break;
                }
              }

              switch (result) {
                case "tie": {
                  yield { type: 'system', text: `TIE: Computer chose ${computerChoice}` };
                  break;
                }
                case "loss": {
                  const newBalance = Math.max(0, coins - 1);
                  setCoins(newBalance);
                  yield { type: 'error', text: `LOSS: Computer chose ${computerChoice}. You lost one coin. Your new balance is ${newBalance}.` };
                  break;
                }
                case "win": {
                  const newBalance = coins + 1;
                  setCoins(newBalance);
                  yield { type: 'system', text: `WIN: Computer chose ${computerChoice}. Congratulations! You earned one coin. Your new balance is ${newBalance}!` };
                  break;
                }
              }
              break;
            }
            case "2": {
              yield { type: 'error', text: `Just play the game` };
              break;
            }
            case "3": {
              yield { type: 'system', text: `Thanks for playing!` };
              return;
            }
          }
        }
      },
      description: 'Play a game',
      type: 'game'
    },
    bal: {
      fn: () => ({
        type: 'system',
        text: `You currently have: ${coins} ${coins == 1 ? "coin" : "coins"}.`
      }),
      description: "Check your balance",
      type: 'game'
    },
    ls: {
      fn: (args) => {
        try {
          return {
            type: 'system',
            text: getFiles(args.length === 0 ? "." : args[0])
              .sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name)
              })
              .map((file) => {
                let name = file.name;
                if (file.type === 'directory') {
                  name += '/';
                }
                const dateString = new Date(file.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return `${name.padEnd(10)} ${dateString}`;
              })
              .join("\n")
          }
        } catch (e) {
          if (e instanceof Error) {
            return {
              type: 'error',
              text: e.message
            }
          }
        }
        return {
          type: 'error',
          text: "Unexpected Error"
        }
      },
      description: 'List directory contents',
      type: 'file'
    },
    cat: {
      fn: (args) => {
        if (args.length === 0) {
          return { type: 'error', text: "cat: usage: cat <filename>" };
        }
        const file = fileExists(args[0]);
        if (!file) {
          return { type: 'error', text: `cat: ${args[0]} does not exist.` };
        }
        else if (file.type === 'directory') {
          return { type: 'error', text: `cat: ${file.name} is a directory.` };
        }
        return { type: 'system', text: file.content };
      },
      description: "Print file contents to screen",
      type: 'file'
    },
    touch: {
      fn: (args) => {
        if (args.length === 0) {
          return { type: 'error', text: "touch: usage: touch <filename>" };
        }
        const file = fileExists(args[0]);
        if (file) {
          return { type: 'error', text: `touch: ${args[0]} already exists.` };
        }
        createFile(args[0]);
        return { type: 'system', text: '' };
      },
      description: "Create a file",
      type: 'file'
    },
    mkdir: {
      fn: (args) => {
        if (args.length === 0) {
          return { type: 'error', text: "mkdir: usage: mkdir <dirname>" };
        }
        const file = fileExists(args[0]);
        if (file) {
          return { type: 'error', text: `touch: ${args[0]} already exists.` };
        }
        createDirectory(args[0]);
        return { type: 'system', text: '' };
      },
      description: "Make directories",
      type: 'file'
    },
    cd: {
      fn: (args) => {
        if (args.length === 0) {
          return { type: 'error', text: "cd: usage: cd <dirname>" };
        }

        const dir = fileExists(args[0]);
        if (!dir) {
          return { type: 'error', text: `cd: ${args[0]} does not exist.` };
        }
        else if (dir.type === 'file') {
          return { type: 'error', text: `cd: ${dir.name} is a file.` };
        }
        setDirID(dir.id);
        return { type: 'system', text: '' };
      },
      description: 'Change directories',
      type: 'file'
    },
    rm: {
      fn: (args) => {
        if (args.length === 0) {
          return { type: 'error', text: "rm: usage: rm <filename>" };
        }
        const file = fileExists(args[0]);
        if (!file) {
          return { type: 'error', text: `cd: ${args[0]} does not exist.` };
        }
        else if (file.type === 'directory') {
          return { type: 'error', text: `cd: ${file.name} is a directory.` };
        }
        try {
          removeFile(args[0]);
          return { type: 'system', text: '' };
        }
        catch (e) {
          if (e instanceof Error) {
            return {
              type: 'error',
              text: e.message
            }
          }
        }
        return {
          type: 'error',
          text: "Unexpected Error"
        }
      },
      description: "Remove a file",
      type: 'file'
    },
    vi: {
      fn: async function* (args) {
        if (args.length === 0) {
          yield { type: 'error', text: 'vi: usage: vi <filename>' };
          return;
        }
        const fileID = getIDInDirectory(args[0]);
        const file = fileID ? files.get(fileID) : null;

        if (file && file.type === 'directory') {
          yield { type: 'error', text: 'vi: cannot edit directory' };
          return;
        }

        yield { type: 'system', text: `--- EDITING ${args[0]} ---` };

        if (file) {
          setInput(file.content);
        }
        const newContent = yield { type: 'prompt', text: 'NEW CONTENT: ' };
        const choice = yield { type: 'prompt', text: 'Save changes? (y/n): ' };

        if (choice.toLowerCase() === 'y') {
          if (fileID) {
            const newFiles = new Map(files);
            newFiles.set(fileID, { ...file, content: newContent } as FileNode);
            setFiles(newFiles);
          } else {
            createFile(args[0], newContent);
          }
          yield { type: 'system', text: 'File saved.' };
        }
      },
      description: 'Edit a file',
      type: 'file'
    }
  };

  const [coins, setCoins] = useState(0);

  const generateHelpText = (): string => {
    const getCommandGroup = (type: typeof COMMANDS[keyof typeof COMMANDS]['type']) => {
      const header = `${type.toUpperCase()} COMMANDS:\n-------------------\n`;
      const footer = "-------------------\n";
      const body = Object.entries(COMMANDS)
        .filter(([, config]) => config.type === type)
        .map(([name, config]) => {
          return `${name.padEnd(12)} - ${config.description}`;
        })
        .join('\n') + '\n';
      return header + body + footer;
    }
    const types = [...new Set(Object.values(COMMANDS).map(c => c.type))];
    return types.map(type => getCommandGroup(type)).join('')
  };

  const generateHistoryText = (history: string[]) => {
    return history.slice(0).reverse().map((command, idx) => {
      const idxNumDigits = String(idx + 1).length;
      const maxNumDigits = String(history.length).length;
      return ' '.repeat(maxNumDigits - idxNumDigits) + `${idx + 1}\t${command}`;

    }).join('\n');
  }

  const { mutateAsync: login } = useLogin()

  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<LogEntry[]>([
    { type: 'system', text: 'Terminal Initialized. Type "help" for commands.' },
  ]);

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExited, setIsExited] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeGeneratorRef = useRef<AsyncGenerator<LogEntry, void, string> | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const [dirID, setDirID] = useState("home");
  const [files, setFiles] = useState(initFileSystem);

  function createFile(name: string, content: string = "") {
    const parent = files.get(dirID);
    if (!parent || parent.type !== 'directory') throw new Error("Invalid parent");
    const id = Math.random().toString(36).substr(2, 9);
    const newFile: FileNode = {
      id,
      name,
      parentID: dirID,
      type: 'file',
      content,
      createdAt: Date.now()
    }
    const newFiles = new Map(files);
    newFiles.set(id, newFile);
    newFiles.set(dirID, {
      ...parent,
      children: [...parent.children, id]
    })
    setFiles(newFiles);
    return id;
  }

  function createDirectory(name: string) {
    const parent = files.get(dirID);
    if (!parent || parent.type !== 'directory') throw new Error("Invalid parent");
    const id = Math.random().toString(36).substr(2, 9);
    const newDir: DirectoryNode = {
      id,
      name,
      parentID: dirID,
      type: 'directory',
      children: [],
      createdAt: Date.now()
    }
    const newFiles = new Map(files);
    newFiles.set(id, newDir);
    newFiles.set(dirID, {
      ...parent,
      children: [...parent.children, id]
    })
    setFiles(newFiles);
  }

  // Remove filename in dirID
  function removeFile(name: string) {
    const parent = files.get(dirID);
    if (!parent || parent.type !== 'directory') throw new Error("Invalid parent");

    const fileID = getIDInDirectory(name);
    if (!fileID) throw new Error("File not in directory");

    const newFiles = new Map(files);
    newFiles.delete(fileID);
    newFiles.set(dirID, {
      ...parent,
      children: parent.children.filter(id => id !== fileID)
    })
    setFiles(newFiles);
  }

  function getPath(nodeID: string): string {
    const file = files.get(nodeID);
    if (!file || !file.parentID) return file?.name || "";
    const fullPath = `${getPath(file.parentID)}/${file.name}`.replace('//', '/');
    if (fullPath.startsWith("/home")) {
      return "~" + fullPath.slice(5);
    }
    return fullPath;
  }

  // Get all files at this directory
  function getFiles(dirName: string) {
    const dir = fileExists(dirName);
    if (!dir) {
      throw new Error(`${dirName} doesn't exist.`);
    }
    else if (dir.type !== 'directory') throw new Error(`${dirName} is not a directory.`);
    return dir.children
      .map(childID => files.get(childID))
      .filter((node): node is FileSystemNode => node !== undefined);
  }

  // Does file exist in dirID
  function fileExists(name: string): FileSystemNode | undefined {
    const fileID = getIDInDirectory(name);
    if (!fileID) {
      return undefined;
    }
    return files.get(fileID);
  }

  function getIDInDirectory(name: string) {
    if (name == "/") {
      return "root";
    }
    else if (name == "~") {
      return "home";
    }
    else if (name == ".") {
      return dirID;
    }

    const dirNode = files.get(dirID);
    if (!dirNode || dirNode.type !== 'directory') {
      return undefined;
    }

    if (name == "..") {
      return dirNode.parentID;
    }

    const childID = dirNode.children.find(id => {
      const childNode = files.get(id);
      return childNode?.name === name;
    })
    return childID;
  }

  // const [username, setUsername] = useState("user")
  const { data: username, isLoading } = useUsername();
  const userPrefix = isLoading || !username
    ? "user@dev:" + getPath(dirID) + "$"
    : username + "@dev:" + getPath(dirID) + "$";

  function forceFocus() {
    if (inputRef.current) inputRef.current.focus();
  }

  useEffect(() => {
    forceFocus();
    window.addEventListener('focus', forceFocus);
    return () => window.removeEventListener('focus', forceFocus);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only block input if we are executing AND NOT waiting for a prompt
    if (isExecuting && !activePrompt) return;

    if (e.key === 'Enter') {
      const userInput = input.trim();
      setIsExecuting(true);
      setInput('');

      let gen: AsyncGenerator<LogEntry, void, string> | null = null;
      let pendingValue: string | undefined = undefined;

      // Resume prompt
      if (activeGeneratorRef.current) {
        gen = activeGeneratorRef.current;
        setHistory(prev => [...prev, {
          type: 'prompt',
          text: `${activePrompt}${userInput}`
        }]);
        setActivePrompt(null);
        pendingValue = userInput;
      }
      // Start a new command
      else {
        const [command, ...args] = userInput.toLowerCase().split(' ');
        if (!command) { setIsExecuting(false); return; }

        setHistory(prev => [...prev, { type: 'user', text: userPrefix + " " + userInput }]);

        if (commandHistory[0] !== userInput) {
          setCommandHistory(prev => [userInput, ...prev]);
        }
        setHistoryIndex(-1);

        const action = COMMANDS[command]?.fn;
        if (action) {
          const result = action(args);

          if (command === 'clear') {
            setHistory([]);
            setIsExecuting(false);
            return;
          } else if (command === 'exit') {
            setIsExited(true);
            setIsExecuting(false);
            return;
          }

          if (!result || !(Symbol.asyncIterator in result || Symbol.iterator in result)) {
            if (result) setHistory(prev => [...prev, result]);
            setIsExecuting(false);
            return;
          }
          gen = result as AsyncGenerator<LogEntry, void, string>;
        } else {
          setHistory(prev => [...prev, { type: 'error', text: `Unknown command: ${command}` }]);
          setIsExecuting(false);
          return;
        }
      }

      try {
        let nextTick = await gen.next(pendingValue!);

        while (!nextTick.done) {
          const entry = nextTick.value;

          if (entry.type === 'prompt') {
            const lines = entry.text.split('\n');

            if (lines.length > 1) {
              // Everything before the last line is treated as a system message
              const intro = lines.slice(0, -1).join('\n');
              setHistory(prev => [...prev, { type: 'system', text: intro }]);
            }

            const lastLine = lines[lines.length - 1];

            activeGeneratorRef.current = gen;
            setActivePrompt(lastLine);
            // Wait for next enter
            return;
          }

          setHistory(prev => [...prev, entry]);
          nextTick = await gen.next();
        }
        activeGeneratorRef.current = null;
      } catch {
        setHistory(prev => [...prev, { type: 'error', text: 'Runtime error.' }]);
      } finally {
        setIsExecuting(false);
        setTimeout(forceFocus, 10);
      }
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
    else if (e.key === 'Escape' || ((e.ctrlKey || e.metaKey) && e.key === 'c')) {
      activeGeneratorRef.current = null;
      setActivePrompt(null);
      setInput('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] font-mono p-6 transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-emerald-500"
      onClick={() => !isExited && forceFocus()}
    >
      {isExited ? (
        <div className="flex items-center justify-center h-full">
          <span>[Process completed - Close tab to exit]</span>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-1 mb-4">
            {history.map((line, i) => (
              <div key={i} className="flex flex-wrap">
                <span className={`whitespace-pre-wrap break-all
                  ${line.type === 'user' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                  ${line.type === 'prompt' ? 'text-amber-500 dark:text-amber-400 font-bold' : ''}
                  ${line.type === 'system' ? 'opacity-70 italic' : ''}
                  ${line.type === 'error' ? 'text-red-600 dark:text-red-400 font-bold' : ''}
                `}>
                  {line.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-start flex-wrap">
            <span className={`mr-2 shrink-0 font-bold ${activePrompt ? 'text-amber-400' : 'text-blue-400'}`}>
              {activePrompt ? activePrompt : !isExecuting ? userPrefix : ""}
            </span>
            <div className="relative flex-grow">
              <input
                type="text"
                ref={inputRef}
                autoFocus
                disabled={isExecuting && !activePrompt}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none text-emerald-500 caret-transparent"
              />
              <span
                className="absolute inline-block w-2 h-5 bg-emerald-500 animate-[pulse_1s_infinite] pointer-events-none"
                style={{
                  left: isExecuting ? `${input.length - 1}ch` : `${input.length}ch`,
                  top: '2px'
                }}
              />
            </div>
          </div>
          <div ref={scrollRef} className="h-1" />
        </div>
      )}
    </div>
  );
}
