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
        "sb-watch": `nodemon --watch src/ -e ts,tsx,js --exec "tsup-node --onSuccess 'node -r source-map-support/register dist/index.js setText -f test'"`,
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
  static fromJSON(json) {
    return new Command(json.command, json.args, json.from, json.to);
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
  log(from) {
    console.log(`[${from || this.from} -> ${this.to}] ${this.command}`, this.args);
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
      command.log();
      console.log("State:", state);
    }
  },
  {
    command: "setState",
    action: async (command, state, sends) => {
      for (const key of Object.keys(command.args)) {
        state[key] = command.args[key];
      }
    }
  },
  {
    command: "iterateState",
    action: async (command, state, sends) => {
      for (const key of Object.keys(command.args)) {
        if (state[key] === void 0) {
          state[key] = 0;
        }
        state[key] += command.args[key];
      }
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
    const commandName = definition.command.substring(4);
    Command.register(definition.command, definition.action);
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
      const hasWorker = possibleCommand !== void 0;
      const command = Command.fromJSON(possibleCommand || worker);
      if (this.useLogging) {
        const from = hasWorker ? worker.process.pid : worker.from;
        command.log(from.toString());
      }
      switch (command.to) {
        case internalCommands.enqueueJob:
          await this.enqueueJob(command);
          break;
        case internalCommands.getNextJob:
          await this.getNextJob(worker);
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
        case internalCommands.newJobNotice:
          break;
        default:
          console.warn("Unknown command:", command);
          return;
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
      this.getNextJob(worker);
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
      if (this.process.workers)
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
};

// src/workerEvents.ts
function getWorkerEvents(worker) {
  return {
    getNextJob: () => {
      return worker.process.send(new Command(internalCommands.getNextJob, {}, worker.pid, internalCommands.getNextJob));
    },
    enqueueJob: (command, args = {}, to = "workers") => {
      if (to === "primary") {
        return worker.process.send(new Command(command, args, worker.pid, internalCommands.enqueueJobPrimary));
      } else {
        return worker.process.send(new Command(command, args, worker.pid, internalCommands.enqueueJob));
      }
    },
    newJobNotice: () => {
      return worker.process.send(new Command(internalCommands.newJobNotice, {}, worker.pid, internalCommands.newJobNotice));
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
    this.isWorking = false;
    this.process = process2;
    this.useLogging = useLogging;
    this.pid = this.process.process.pid;
    this.sends = getWorkerEvents(this);
    process2.on(internalCommands.message, async (json) => {
      if (this.isWorking) {
        return;
      }
      this.isWorking = true;
      const command = Command.fromJSON(json);
      if (this.useLogging) {
        command.log("primary");
      }
      switch (command.to) {
        case internalCommands.newJobNotice:
          this.sends.getNextJob();
          break;
        case internalCommands.message:
          break;
      }
      const newCommand = await onCommand(command, this.state, this.sends);
      if (newCommand === void 0) {
        await command.run(this.state, this.sends);
      } else {
        await newCommand.run(this.state, this.sends);
      }
      this.isWorking = false;
      this.sends.getNextJob();
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
    this.cliCommands = [];
    this.onPrimaryCommand = noop;
    this.onWorkerCommand = noop;
    this.useLogging = useLogging;
    for (const defaultCommand of defaultCommands.concat(commands2)) {
      if (defaultCommand.command.indexOf("cli:") === 0) {
        this.cliCommands.push(defaultCommand);
      } else {
        Command.register(defaultCommand.command, defaultCommand.action);
      }
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
      const cli = new Cli(this.cliCommands);
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
      command: "cli:setText",
      description: "Sets text in the primary process",
      args: {
        "<text>": "The name of the state to set"
      },
      options: {
        "-f": "First character only"
      },
      action: async (command, state, sends) => {
        state.text = command.args.f === true ? command.args.cli.text[0] : command.args.cli.text;
        console.log("setText", state);
      }
    },
    {
      command: "iterate",
      action: async (command, state, sends) => {
        if (state.value === void 0) {
          state.value = 0;
        }
        state.value += 1;
        console.log("Iterated value:", state.value);
      }
    }
  ], true).onCommand(async (command, state, sends) => {
    console.info(`Primary Message: ${command.command}`);
  }, async (command, state, sends) => {
    console.info(`Worker Message: ${command.command}`);
    sends.enqueueJob("iterateState", {
      commands: 1
    }, "primary");
  });
  await instance.start(async (primary) => {
    console.info(`Primary ready`);
    primary.sends.enqueueJob("iterate");
  }, async (worker) => {
    console.info(`Worker ${worker.pid} ready`);
  });
})();
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cluster
});
//# sourceMappingURL=index.js.map