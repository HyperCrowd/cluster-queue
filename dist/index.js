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
        "sb-watch": `nodemon --watch src/ -e ts,tsx,js --exec "tsup-node --onSuccess 'node -r source-map-support/register dist/index.js setState test'"`,
        watch: "tsup-node --watch --onSuccess 'node -r source-map-support/register dist/index.js'"
      },
      tsup: {
        entry: ["src/index.ts"],
        splitting: false,
        sourcemap: true,
        clean: true,
        dts: true
      },
      main: "./dist/index.js",
      module: "./dist/esm/index.js",
      types: "./dist/index.d.ts",
      files: ["/dist"],
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
var import_cluster4 = __toESM(require("cluster"));

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
    if (commands[command] === void 0) {
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
  run(state, priamryQueue, workerQueue) {
    return commands[this.command](this.args, state, this, priamryQueue, workerQueue);
  }
};

// src/cli.ts
var { name, description, version } = require_package();
var removeChars = /[^A-Za-z0-9_]/g;
var Cli = class {
  constructor(queue, definitions) {
    this.queue = queue;
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
      this.queue.add(new Command(definition.command, options, "cli", "primary"));
    });
  }
  start() {
    this.program.parse(process.argv);
  }
};

// src/primary.ts
var import_cluster2 = __toESM(require("cluster"));
var os = __toESM(require("os"));

// src/worker.ts
var Worker = class {
  constructor(worker, onMessage) {
    this.process = worker;
    this.process.on("message", async (message) => {
      if (this.process.process !== void 0) {
        console.info(`[PRIMARY -> PID ${this.process.process.pid}]`, message);
        await onMessage(message);
      }
    });
  }
  restart() {
    this.send({
      command: "shutdown",
      from: this.process.process.pid
    });
    this.kill();
  }
  kill() {
    this.process.removeAllListeners();
    this.process.kill("SIGKILL");
    this.process = void 0;
  }
  send(message) {
    console.info(`[PID ${this.process.process.pid} -> PRIMARY]`, message);
    this.process.process.send(message);
  }
};

// src/primary.ts
var cpus2 = os.cpus();
var numWorkers = cpus2.length;
var Primary = class {
  constructor(process2, cli, primaryQueue, workerQueue, onPrimaryMessage, onWorkerMessage, useLogging = false) {
    this.workers = [];
    this.state = {};
    this.cli = cli;
    this.process = process2;
    this.useLogging = useLogging;
    this.primaryQueue = primaryQueue;
    this.workerQueue = workerQueue;
    process2.on("newCommand", (to) => {
      if (to === "primary") {
        const command = this.primaryQueue.next();
        command.run(this.state, this.primaryQueue, this.workerQueue);
      } else {
        this.send(new Command("_pending", {}, "primary", "workers"));
      }
    });
    process2.on("message", async (worker, command) => {
      console.log("WAT");
      if (command.command === "_next") {
        const nextCommand = this.workerQueue.next(worker);
        await onPrimaryMessage(worker, nextCommand);
      } else {
        await onPrimaryMessage(worker, command);
      }
    });
    process2.on("exit", (worker, code, signal) => {
      if (this.useLogging) {
        console.info("Worker " + worker.process.pid + " died with code: " + code + ", and signal: " + signal);
      }
      this.spawnWorker();
    });
    process2.on("online", (worker) => {
      if (this.useLogging) {
        console.info("Worker " + worker.process.pid + " is online");
      }
      const newWorker = new Worker(worker, onWorkerMessage);
      this.workers.push(newWorker);
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
  async addTask(command) {
    if (command.to === "primary") {
      this.primaryQueue.add(command);
    } else {
      this.workerQueue.add(command);
    }
    return command;
  }
  getWorkerProcesses() {
    return Object.values(import_cluster2.default.workers);
  }
  restartWorkers() {
    for (const worker of this.workers) {
      worker.restart();
    }
  }
  send(command) {
    const workers = this.getWorkerProcesses();
    for (const worker of workers) {
      if (command.to === "workers" || worker.process !== void 0 && worker.process.pid === command.to) {
        if (this.useLogging) {
          console.info(`[PRIMARY -> PID ${worker.process.pid}]`, command);
        }
        worker.process.send(command);
      }
    }
  }
};

// src/queue.ts
var import_cluster3 = __toESM(require("cluster"));
var Queue = class {
  constructor(primary) {
    this.queue = [];
    this.primary = primary;
  }
  add(command) {
    const index = this.queue.push(command);
    this.primary.emit("newCommand", command.to);
    return index;
  }
  shift() {
    return this.queue.shift();
  }
  next(worker) {
    const command = this.queue.shift();
    if (command === void 0) {
      return;
    }
    const pid = import_cluster3.default.isPrimary ? "primary" : worker.process.pid;
    const newCommand = command.clone("primary", pid);
    if (worker) {
      worker.send(newCommand);
    }
    return newCommand;
  }
};

// src/index.ts
var Cluster = class {
  constructor(commands2, useLogging = false) {
    this.commands = commands2;
    this.useLogging = useLogging;
    this.commands.push({
      command: "log",
      action: console.log
    });
    return this;
  }
  onMessage(onPrimaryMessage, onWorkerMessage) {
    this.onPrimaryMessage = onPrimaryMessage;
    this.onWorkerMessage = onWorkerMessage;
    return this;
  }
  async start(onPrimaryStart, onWorkerStart) {
    if (import_cluster4.default.isPrimary) {
      const primaryQueue = new Queue(import_cluster4.default);
      const workerQueue = new Queue(import_cluster4.default);
      const cli = new Cli(primaryQueue, this.commands);
      const primary = new Primary(import_cluster4.default, cli, primaryQueue, workerQueue, this.onPrimaryMessage, this.onWorkerMessage, this.useLogging);
      cli.start();
      await primary.start();
      await onPrimaryStart(primary);
    } else {
      await onWorkerStart(import_cluster4.default.worker);
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
      options: {},
      action: (args, state) => {
        state.text = args.cli.text;
      }
    }
  ], true).onMessage(async (worker, message) => {
    console.log("PRIMARY MESSAGE");
  }, async (message) => {
    console.log("WORKER MESSAGE");
  });
  await instance.start(async () => {
    console.log("PRIMARY START");
  }, async () => {
    console.log("WORKER START");
  });
})();
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cluster
});
//# sourceMappingURL=index.js.map