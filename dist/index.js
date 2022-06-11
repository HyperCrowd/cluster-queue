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
        start: "npm run dev",
        dev: `echo 'Type "npm run sb-watch" to get started'`,
        build: "tsup-node --legacy-output --minify --format esm,cjs,iife",
        "sb-watch": `nodemon --watch src/ -e ts,tsx,js --exec "tsup-node --onSuccess 'node --enable-source-maps dist/index.js'"`,
        watch: "tsup-node --watch --onSuccess 'node --enable-source-maps dist/index.js'"
      },
      tsup: {
        entry: [
          "src/index.ts"
        ],
        splitting: false,
        sourcemap: true,
        clean: true,
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
  startCluster: () => startCluster
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
    if (commands[command] === void 0) {
      throw new RangeError(`"${command}" has not been regsitered.`);
    }
    this.command = command;
    this.args = args;
    this.from = from;
    this.to = to;
  }
  clone(from, to) {
    return new Command(this.command, this.args, from, to);
  }
  run() {
    return commands[this.command](this.args);
  }
};

// src/cli.ts
var { name, description, version } = require_package();
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
    const commandName = isCliCommand ? definition.command.substring(3) : definition.command;
    Command.register(commandName, definition.action);
    if (!isCliCommand) {
      return;
    }
    const newCommand = this.program.command(commandName).description(definition.description);
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
      const options = typeof args[args.length - 1] === "string" ? {} : args[args.length - 1];
      options.cli = {};
      let i = 0;
      for (const key of argKeys) {
        options.cli[key] = args[i];
        i += 1;
      }
      this.queue.add(new Command(definition.command, options, "cli", "primary"));
    });
  }
  start() {
    this.program.parse(process.argv);
  }
};

// src/master.ts
var import_cluster2 = __toESM(require("cluster"));
var os = __toESM(require("os"));

// src/worker.ts
var Worker = class {
  constructor(worker, onMessage) {
    this.process = worker;
    this.process.on("message", (message) => {
      if (this.process.process !== void 0) {
        console.info(`[MASTER -> PID ${this.process.process.pid}]`, message);
        onMessage(message);
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
    console.info(`[PID ${this.process.process.pid} -> MASTER]`, message);
    this.process.process.send(message);
  }
};

// src/master.ts
var cpus2 = os.cpus();
var numWorkers = cpus2.length;
var Master = class {
  constructor(process2, cli, priamryQueue, workerQueue, onMessage, onWorkerMessage, useLogging = false) {
    this.workers = [];
    this.cli = cli;
    this.process = process2;
    this.useLogging = useLogging;
    this.priamryQueue = priamryQueue;
    this.workerQueue = workerQueue;
    process2.on("newCommand", (to) => {
      if (to === "primary") {
        const command = this.workerQueue.next();
        command.run();
      }
    });
    process2.on("message", (worker, command) => {
      if (command.command === "_next") {
        const nextCommand = this.workerQueue.next(worker);
        onMessage(worker, nextCommand);
      } else {
        onMessage(worker, command);
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
    if (this.useLogging) {
      console.info("Master cluster setting up " + numWorkers + " workers...");
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
      this.priamryQueue.add(command);
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
          console.info(`[MASTER -> PID ${worker.process.pid}]`, command);
        }
        worker.process.send(command);
      }
    }
  }
};

// src/queue.ts
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
    const newCommand = command.clone("primary", worker.process.pid);
    if (worker) {
      worker.send(newCommand);
    }
    return newCommand;
  }
};

// src/index.ts
function startCluster(commands2, onMasterStart, onMasterMessage, onWorkerStart, onWorkerMessage, useLogging = false) {
  if (import_cluster3.default.isPrimary) {
    const primaryQueue = new Queue(import_cluster3.default);
    const workerQueue = new Queue(import_cluster3.default);
    const cli = new Cli(primaryQueue, commands2);
    const master = new Master(import_cluster3.default, cli, primaryQueue, workerQueue, onMasterMessage, onWorkerMessage, useLogging);
    onMasterStart(master);
  } else {
    const worker = import_cluster3.default.worker;
    onWorkerStart(worker);
  }
}
startCluster([
  {
    command: "cli:test",
    description: "Test",
    args: {},
    options: {},
    action: (command) => {
    }
  },
  {
    command: "doThing",
    action: (command) => {
    }
  }
], () => {
}, () => {
}, () => {
}, () => {
}, true);
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startCluster
});
//# sourceMappingURL=index.js.map