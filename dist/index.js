var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  startCluster: () => startCluster
});
var import_cluster2 = __toESM(require("cluster"));

// src/master.ts
var import_cluster = __toESM(require("cluster"));
var import_os = __toESM(require("os"));

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
var cpus = import_os.default.cpus();
var numWorkers = cpus.length;
var Master = class {
  constructor(process, onMessage, onWorkerMessage) {
    this.process = process;
    this.workers = [];
    process.on("message", (worker, message) => {
      onMessage(worker, message);
    });
    process.on("exit", (worker, code, signal) => {
      console.info("Worker " + worker.process.pid + " died with code: " + code + ", and signal: " + signal);
      console.info("Starting a new worker...");
      this.spawnWorker();
    });
    process.on("online", (worker) => {
      console.info("Worker " + worker.process.pid + " is online");
      const newWorker = new Worker(worker, onWorkerMessage);
      this.workers.push(newWorker);
    });
    console.info("Master cluster setting up " + numWorkers + " workers...");
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
  getWorkerProcesses() {
    return Object.values(import_cluster.default.workers);
  }
  restartWorkers() {
    for (const worker of this.workers) {
      worker.restart();
    }
  }
  send(target, message) {
    const workers = this.getWorkerProcesses();
    for (const worker of workers) {
      if (target === "all" || worker.process !== void 0 && worker.process.pid === target) {
        console.info(`[MASTER -> PID ${worker.process.pid}]`, message);
        worker.process.send({
          from: "master",
          message
        });
      }
    }
  }
};

// src/index.ts
function startCluster(onMasterStart, onMasterMessage, onWorkerStart, onWorkerMessage) {
  if (import_cluster2.default.isMaster) {
    const master = new Master(import_cluster2.default, onMasterMessage, onWorkerMessage);
    onMasterStart(master);
  } else {
    const worker = import_cluster2.default.worker;
    onWorkerStart(worker);
  }
}
startCluster(() => {
}, () => {
}, () => {
}, () => {
});
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startCluster
});
//# sourceMappingURL=index.js.map