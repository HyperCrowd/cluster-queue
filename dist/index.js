var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// package.json
var require_package = __commonJS({
  "package.json"(exports, module2) {
    module2.exports = {
      name: "@psysecgroup/cluster-queue",
      description: "Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.",
      version: "1.0.0",
      author: "The PsySec Group",
      license: "MIT",
      bugs: {
        url: "https://github.com/PsySecGroup/cluster-queue/issues"
      },
      homepage: "https://github.com/PsySecGroup/cluster-queue#readme",
      repository: {
        type: "git",
        url: "git+https://github.com/PsySecGroup/cluster-queue.git"
      },
      scripts: {
        start: "node -r source-map-support/register dist/index.js",
        dev: `echo 'Type "npm run sb-watch" to get started'`,
        build: "tsup-node --legacy-output --minify --format esm,cjs,iife",
        "sb-watch": `nodemon --watch src/ -e ts,tsx,js --exec "tsup-node --onSuccess 'node -r source-map-support/register dist/index.js setState -f test'"`,
        watch: "tsup-node --watch --onSuccess 'node -r source-map-support/register dist/index.js'"
      },
      tsup: {
        entry: [
          "src/index.ts"
        ],
        splitting: false,
        sourcemap: true,
        clean: false,
        dts: true
      },
      main: "./dist/index.js",
      module: "./dist/esm/index.js",
      types: "./dist/index.d.ts",
      files: [
        "/dist"
      ],
      devDependencies: {
        "@types/node": "^17.0.41",
        nodemon: "^2.0.16",
        "source-map-support": "^0.5.21",
        tsup: "^6.1.0",
        typescript: "^4.7.3"
      },
      dependencies: {
        commander: "^9.3.0"
      }
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Cluster: () => Cluster
});
var import_cluster3 = __toESM(require("cluster"));

// src/cli.ts
var import_cluster = __toESM(require("cluster"));
var import_commander = require("commander");

// src/command.ts
var commands = {};
var Command = class {
  static register(command, onAction) {
    commands[command] = onAction;
  }
  constructor(command, args, from, to) {
    if (commands[command] === void 0 && command[0] !== "_") {
      throw new RangeError(`"${command}" has not been registered.`);
    }
    this.command = command;
    this.args = args;
    this.from = from;
    this.to = to;
  }
  clone(from, to) {
    return new Command(this.command, this.args, from, to);
  }
  async run(state, quickSends) {
    return commands[this.command](this, state, quickSends);
  }
};

// src/commands.ts
var internalCommands = {
  getNextJob: "_getNextJob",
  getNextPrimaryJob: "_getNextJob_primary",
  enqueueJob: "_enqueueJob",
  enqueueJobPrimary: "_enqueueJob_primary",
  newJobNotice: "_newJobNotice",
  message: "message"
};
var defaultCommands = [
  {
    command: "log",
    action: async (command, state, sends) => {
      console.log(command);
    }
  }
];

// src/cli.ts
var { name, description, version } = require_package();
var removeChars = /[^A-Za-z0-9_]/g;
var Cli = class {
  constructor(definitions) {
    this.program = new import_commander.Command();
    this.program.name(name).description(description).version(version);
    for (const definition of definitions) {
      this.register(definition);
    }
  }
  register(definition) {
    if (!import_cluster.default.isPrimary) {
      return;
    }
    const isCliCommand = definition.command.indexOf("cli:") === 0;
    const commandName = isCliCommand ? definition.command.substring(4) : definition.command;
    Command.register(definition.command, definition.action);
    if (!isCliCommand) {
      return;
    }
    const newCommand = commandName === "" ? this.program : this.program.command(commandName);
    newCommand.description(definition.description);
    const argKeys = Object.keys(definition.args);
    for (const arg of argKeys) {
      const description2 = definition.args[arg];
      newCommand.argument(arg, description2);
    }
    for (const option of Object.keys(definition.options)) {
      const description2 = definition.options[option];
      newCommand.option(option, description2);
    }
    newCommand.action((...args) => {
      const options = typeof args[args.length - 2] === "string" ? {} : args[args.length - 2];
      options.cli = {};
      let i = 0;
      for (const key of argKeys) {
        options.cli[key.replace(removeChars, "")] = args[i];
        i += 1;
      }
      import_cluster.default.emit("message", new Command(definition.command, options, "cli", internalCommands.enqueueJobPrimary));
    });
  }
  start() {
    this.program.parse(process.argv);
  }
};

// src/primary.ts
var import_cluster2 = __toESM(require("cluster"));
var os = __toESM(require("os"));

// src/queue.ts
var Queue = class {
  constructor() {
    this.queue = [];
  }
  add(command) {
    const index = this.queue.push(command);
    return index;
  }
  shift() {
    return this.queue.shift();
  }
  getNext(to) {
    const command = this.queue.shift();
    if (command === void 0) {
      return;
    }
    const newCommand = command.clone("primary", to);
    return newCommand;
  }
};

// src/primaryEvents.ts
function getPrimaryEvents(primary) {
  return {
    getNextJob: () => {
      return primary.process.emit("message", new Command(internalCommands.getNextPrimaryJob, {}, "primary", internalCommands.getNextPrimaryJob));
    },
    enqueueJob: (command, args = {}, to = "workers") => {
      if (to === "primary") {
        return primary.process.emit("message", new Command(command, args, "primary", internalCommands.enqueueJobPrimary));
      } else {
        return primary.process.emit("message", new Command(command, args, "primary", internalCommands.enqueueJob));
      }
    },
    newJobNotice: () => {
      return primary.process.emit("message", new Command(internalCommands.newJobNotice, {}, "primary", internalCommands.newJobNotice));
    },
    message: async (command, args = {}) => {
      return primary.process.emit("message", new Command(command, args, "primary", internalCommands.message));
    }
  };
}

// src/primary.ts
var cpus2 = os.cpus();
var numWorkers = cpus2.length;
var Primary = class {
  constructor(process2, cli, onMessage, useLogging = false) {
    this.state = {};
    this.cli = cli;
    this.process = process2;
    this.useLogging = useLogging;
    this.primaryQueue = new Queue();
    this.workerQueue = new Queue();
    this.onMessage = onMessage;
    this.sends = getPrimaryEvents(this);
    process2.on("message", async (worker, possibleCommand) => {
      const hasWorker = !(worker instanceof Command);
      const command = hasWorker ? possibleCommand : worker;
      if (this.useLogging) {
        const label = hasWorker ? "PID" + worker.process.pid : worker.from;
        console.log(`[${label}]:`, command);
      }
      switch (command.to) {
        case internalCommands.enqueueJob:
          await this.enqueueJob(command);
          break;
        case internalCommands.getNextJob:
          await this.getNextJob(worker);
          break;
        case internalCommands.newJobNotice:
          this.newJobNotice();
          break;
        case internalCommands.message:
          await this.message(command);
          break;
        case internalCommands.enqueueJobPrimary:
          await this.enqueueJob(command);
          break;
        case internalCommands.getNextPrimaryJob:
          await this.getNextPrimaryJob();
          break;
        default:
          console.warn("Unknown command:", command);
      }
    });
    process2.on("exit", (worker, code, signal) => {
      if (this.useLogging) {
        console.info(`${worker.process.pid} died: ${code} ${signal}`);
      }
      this.spawnWorker();
    });
    process2.on("online", (worker) => {
      if (this.useLogging) {
        console.info("Worker " + worker.process.pid + " is online");
      }
    });
  }
  async start() {
    await Promise.all([
      new Promise((resolve) => {
        setTimeout(() => {
          if (this.primaryQueue.queue.length === 0) {
            resolve(true);
          }
        }, 100);
      })
    ]);
    if (this.useLogging) {
      console.info("Primary cluster setting up " + numWorkers + " workers...");
    }
    for (var i = 0; i < numWorkers; i++) {
      this.spawnWorker();
    }
  }
  spawnWorker() {
    let worker = this.process.fork();
    worker.on("disconnect", () => {
      worker.removeAllListeners();
      worker.kill();
      worker = void 0;
    });
    return worker;
  }
  addTask(command) {
    if (command.to === "primary") {
      this.primaryQueue.add(command);
    } else {
      this.workerQueue.add(command);
    }
    return command;
  }
  getWorkers() {
    return Object.values(import_cluster2.default.workers);
  }
  send(command) {
    const workers = this.getWorkers();
    for (const worker of workers) {
      if (command.to === "workers" || worker.process !== void 0 && worker.process.pid === command.to) {
        if (this.useLogging) {
          console.info(`[PRIMARY -> PID ${worker.process.pid}]`, command);
        }
        worker.process.send(command);
      }
    }
  }
  async enqueueJob(command) {
    if (command.to === internalCommands.enqueueJobPrimary) {
      const newCommand = await this.onMessage(command, this.state, this.sends);
      if (newCommand === void 0) {
        await command.run(this.state, this.sends);
      } else {
        await newCommand.run(this.state, this.sends);
      }
    } else {
      this.addTask(command);
      this.sends.newJobNotice();
    }
  }
  async getNextJob(worker) {
    const nextCommand = this.workerQueue.getNext(worker.process.pid);
    if (nextCommand === void 0) {
      return;
    }
    const finalCommand = await this.onMessage(nextCommand, this.state, this.sends);
    if (finalCommand) {
      worker.send(finalCommand);
    } else {
      worker.send(nextCommand);
    }
  }
  async getNextPrimaryJob() {
    const nextCommand = this.primaryQueue.getNext("primary");
    if (nextCommand === void 0) {
      return;
    }
    const finalCommand = await this.onMessage(nextCommand, this.state, this.sends);
    if (finalCommand === void 0) {
      await nextCommand.run(this.state, this.sends);
    } else {
      await finalCommand.run(this.state, this.sends);
    }
  }
  async message(command) {
    if (this.useLogging) {
      console.log("Primary Message:", command);
    }
    await this.onMessage(command, this.state, this.sends);
  }
  newJobNotice() {
  }
};

// src/workerEvents.ts
function getWorkerEvents(worker) {
  return {
    getNextJob: () => {
      return worker.process.send(new Command("", {}, worker.pid, internalCommands.getNextPrimaryJob));
    },
    enqueueJob: (command, args = {}, to = "workers") => {
      if (to === "primary") {
        return worker.process.send(new Command(command, args, worker.pid, internalCommands.enqueueJobPrimary));
      } else {
        return worker.process.send(new Command(command, args, worker.pid, internalCommands.enqueueJob));
      }
    },
    newJobNotice: () => {
      return worker.process.send(new Command("", {}, worker.pid, internalCommands.newJobNotice));
    },
    message: async (command, args = {}) => {
      return worker.process.send(new Command(command, args, worker.pid, internalCommands.message));
    }
  };
}

// src/worker.ts
var Worker = class {
  constructor(process2, onCommand, useLogging = false) {
    this.state = {};
    this.process = process2;
    this.useLogging = useLogging;
    this.pid = this.process.process.pid;
    this.sends = getWorkerEvents(this);
    process2.on(internalCommands.message, async (command) => {
      if (this.useLogging) {
        console.log("Worker Message:", command);
      }
      const newCommand = await onCommand(command, this.state, this.sends);
      if (newCommand === void 0) {
        await command.run(this.state, this.sends);
      } else {
        await newCommand.run(this.state, this.sends);
      }
    });
  }
  kill() {
    this.process.removeAllListeners();
    this.process.kill("SIGKILL");
    this.process = void 0;
  }
};

// src/index.ts
var noop = () => void 0;
var Cluster = class {
  constructor(commands2 = [], useLogging = false) {
    this.onPrimaryCommand = noop;
    this.onWorkerCommand = noop;
    this.commands = commands2;
    this.useLogging = useLogging;
    for (const defaultCommand of defaultCommands) {
      this.commands.push(defaultCommand);
    }
    return this;
  }
  onCommand(onPrimaryCommand, onWorkerCommand) {
    this.onPrimaryCommand = onPrimaryCommand;
    this.onWorkerCommand = onWorkerCommand;
    return this;
  }
  async start(onPrimaryStart = noop, onWorkerStart = noop) {
    if (import_cluster3.default.isPrimary) {
      const cli = new Cli(this.commands);
      const primary = new Primary(import_cluster3.default, cli, this.onPrimaryCommand, this.useLogging);
      cli.start();
      await primary.start();
      await onPrimaryStart(primary);
    } else {
      await onWorkerStart(new Worker(import_cluster3.default.worker, this.onWorkerCommand, this.useLogging));
    }
  }
};
(async function main() {
  const instance = new Cluster([
    {
      command: "cli:setState",
      description: "Sets a state in the primary process",
      args: {
        "<text>": "The name of the state to set"
      },
      options: {
        "-f": "Force the text"
      },
      action: async (command, state, sends) => {
        state.text = command.args.cli.text;
        console.log("setState", state);
      }
    },
    {
      command: "iterate",
      action: async (command, state, sends) => {
        if (state.value === 0) {
          state.value = 0;
        }
        state.value += 1;
        console.log("value:", state.value);
      }
    }
  ], true).onCommand(async (command, state, sends) => {
    console.log("PRIMARY COMMAND", command);
  }, async (command, state, sends) => {
    console.log("WORKER COMMAND", command);
  });
  await instance.start(async (primary) => {
    console.log("PRIMARY START");
    primary.sends.enqueueJob("iterate");
  }, async (worker) => {
    console.log("WORKER START");
  });
})();
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cluster
});
//# sourceMappingURL=index.js.map