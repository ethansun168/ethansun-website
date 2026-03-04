import React, { useEffect, useRef, useState } from 'react';

type LogEntry = {
  type: 'user' | 'system' | 'prompt' | 'error';
  text: string;
};

type CommandConfig = {
  fn: (args: string[]) =>
    LogEntry |
    Generator<LogEntry, void, unknown> |
    AsyncGenerator<LogEntry, void, unknown> |
    null;
  description: string;
}

export function CommandLine() {
  const COMMANDS: Record<string, CommandConfig> = {
    help: {
      fn: () => ({
        type: 'system',
        text: generateHelpText()
      }),
      description: 'Display this help menu'
    },
    about: {
      fn: () => ({
        type: 'system',
        text: 'Mirtsema Terminal'
      }),
      description: 'Learn more about this terminal'
    },
    ls: {
      fn: () => ({
        type: 'system',
        text: `projects.txt  resume.pdf  contact.sh`
      }),
      description: 'List directory contents'
    },
    clear: {
      fn: () => null,
      description: 'Clear the terminal screen'
    },
    exit: {
      fn: () => null,
      description: 'Terminate the current session'
    },
    sudo: {
      fn: () => ({
        type: 'error',
        text: 'User is not in the sudoers file. This incident will be reported.'
      }),
      description: "Execute a command as another user"
    },
    history: {
      fn: () => ({
        type: 'system',
        text: generateHistoryText(commandHistory)
      }),
      description: 'List all commands typed in this session'
    },
    whoami: {
      fn: () => ({
        type: 'system',
        text: username
      }),
      description: 'Print effective user name'
    },
    login: {
      fn: async function* () {
        const username = yield { type: 'prompt', text: 'Enter username: ' };
        const password = yield { type: 'prompt', text: 'Enter password: ' };
        yield { type: 'system', text: "Verifying..." };
        await new Promise(r => setTimeout(r, 1000));
        if (username == 'admin' && password === "admin") {
          yield { type: "system", text: "Logged in!" };
          setUsername('admin');
        }
        else {
          yield { type: "error", text: "Invalid credentials." };
        }
      },
      description: "Log into the system"
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
                  yield { type: 'error', text: `LOSS: Computer chose ${computerChoice}. You lost one coin.` };
                  setCoins((prev) => (prev - 1));
                  break;
                }
                case "win": {
                  yield { type: 'system', text: `WIN: Computer chose ${computerChoice}. Congratulations! You earned one coin.` };
                  setCoins((prev) => (prev + 1));
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
      description: 'Play a game'
    },
    bal: {
      fn: () => ({
        type: 'system',
        text: `You currently have: ${coins} ${coins == 1 ? "coin" : "coins"}.`
      }),
      description: "Check your balance"
    }
  };

  const [coins, setCoins] = useState(0);

  const generateHelpText = () => {
    const header = "AVAILABLE COMMANDS:\n-------------------\n";

    const body = Object.entries(COMMANDS)
      .map(([name, config]) => {
        return `${name.padEnd(12)} - ${config.description}`;
      })
      .join('\n');

    return header + body;
  };

  const generateHistoryText = (history: string[]) => {
    return history.slice(0).reverse().map((command, idx) => {
      const idxNumDigits = String(idx + 1).length;
      const maxNumDigits = String(history.length).length;
      return ' '.repeat(maxNumDigits - idxNumDigits) + `${idx + 1}\t${command}`;

    }).join('\n');
  }

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

  const [username, setUsername] = useState("user")
  const userPrefix = username + "@dev:~$";

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

        setHistory(prev => [...prev, { type: 'user', text: userInput }]);

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
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1 mb-4">
            {history.map((line, i) => (
              <div key={i} className="flex flex-wrap">
                <span className={`whitespace-pre-wrap break-all
                  ${line.type === 'user' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                  ${line.type === 'prompt' ? 'text-amber-500 dark:text-amber-400 font-bold' : ''}
                  ${line.type === 'system' ? 'opacity-70 italic' : ''}
                  ${line.type === 'error' ? 'text-red-600 dark:text-red-400 font-bold' : ''}
                `}>
                  {line.type === 'user' && <span className="mr-2">{userPrefix}</span>}
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
