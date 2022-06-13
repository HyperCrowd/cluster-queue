var N=(o,e)=>()=>(e||o((e={exports:{}}).exports,e),e.exports);var C=N((M,q)=>{q.exports={name:"@psysecgroup/cluster-queue",description:"Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.",version:"1.0.0",author:"The PsySec Group",license:"MIT",bugs:{url:"https://github.com/PsySecGroup/cluster-queue/issues"},homepage:"https://github.com/PsySecGroup/cluster-queue#readme",repository:{type:"git",url:"git+https://github.com/PsySecGroup/cluster-queue.git"},scripts:{start:"node -r source-map-support/register dist/index.js",dev:`echo 'Type "npm run sb-watch" to get started'`,build:"tsup-node --legacy-output --dts --minify --format esm,cjs,iife","sb-watch":`nodemon --watch src/ -e ts,tsx,js --exec "tsup-node --dts --onSuccess 'node -r source-map-support/register dist/index.js setText -f test'"`,watch:"tsup-node --watch --dts --onSuccess 'node -r source-map-support/register dist/index.js'",test:`nodemon --watch tests/ -e ts,tsx,js --exec "tsup-node --entry.tests=tests/index.ts --onSuccess 'uvu -r source-map-support/register dist ^tests.js$'"`},tsup:{entry:["src/index.ts"],splitting:!1,sourcemap:!0,clean:!1,dts:!1},main:"./dist/index.js",module:"./dist/esm/index.js",types:"./dist/index.d.ts",files:["/dist"],devDependencies:{"@types/node":"^17.0.41",nodemon:"^2.0.16","source-map-support":"^0.5.21",tsup:"^6.1.0",typescript:"^4.7.3",uvu:"^0.5.3"},dependencies:{commander:"^9.3.0"}}});import y from"cluster";import w from"cluster";import{Command as v}from"commander";var g={},n=class{static register(e,s){g[e]=s}static fromJSON(e){return new n(e.command,e.args,e.from,e.to)}constructor(e,s,t,m){if(g[e]===void 0&&e[0]!=="_")throw new RangeError(`"${e}" has not been registered.`);this.command=e,this.args=s,this.from=t,this.to=m}clone(e,s){return new n(this.command,this.args,e,s)}async run(e,s){return g[this.command](this,e,s)}log(e){console.log(`[${e||this.from} -> ${this.to}] ${this.command}`,this.args)}};var r={getNextJob:"_getNextJob",getNextPrimaryJob:"_getNextJob_primary",enqueueJob:"_enqueueJob",enqueueJobPrimary:"_enqueueJob_primary",newJobNotice:"_newJobNotice",message:"message"},b=[{command:"log",action:async(o,e,s)=>{o.log(),console.log("State:",e)}},{command:"setState",action:async(o,e,s)=>{for(let t of Object.keys(o.args))e[t]=o.args[t]}},{command:"iterateState",action:async(o,e,s)=>{for(let t of Object.keys(o.args))e[t]===void 0&&(e[t]=0),e[t]+=o.args[t]}}];var{name:K,description:S,version:W}=C(),Q=/[^A-Za-z0-9_]/g,f=class{constructor(e,s=!0){this.active=!0;if(this.active=s,this.active!==!1){this.program=new v,this.program.name(K).description(S).version(W);for(let t of e)this.register(t)}}register(e){if(this.active===!1||!w.isPrimary)return;let s=e.command.substring(4);n.register(e.command,e.action);let t=s===""?this.program:this.program.command(s);t.description(e.description);let m=Object.keys(e.args);for(let i of m){let a=e.args[i];t.argument(i,a)}for(let i of Object.keys(e.options)){let a=e.options[i];t.option(i,a)}t.action((...i)=>{let a=typeof i[i.length-2]=="string"?{}:i[i.length-2];a.cli={};let u=0;for(let c of m)a.cli[c.replace(Q,"")]=i[u],u+=1;w.emit("message",new n(e.command,a,"cli",r.enqueueJobPrimary))})}start(){this.active!==!1&&this.program.parse(process.argv)}};import L from"cluster";import*as x from"os";var d=class{constructor(){this.queue=[]}add(e){return this.queue.push(e)}shift(){return this.queue.shift()}getNext(e){let s=this.queue.shift();return s===void 0?void 0:s.clone("primary",e)}};function P(o){return{getNextJob:()=>o.process.emit("message",new n(r.getNextPrimaryJob,{},"primary",r.getNextPrimaryJob)),enqueueJob:(e,s={},t="workers")=>t==="primary"?o.process.emit("message",new n(e,s,"primary",r.enqueueJobPrimary)):o.process.emit("message",new n(e,s,"primary",r.enqueueJob)),newJobNotice:()=>o.process.emit("message",new n(r.newJobNotice,{},"primary",r.newJobNotice)),message:async(e,s={})=>o.process.emit("message",new n(e,s,"primary",r.message))}}var T=x.cpus(),A=T.length,h=class{constructor(e,s,t,m=!1){this.state={};this.cli=s,this.process=e,this.useLogging=m,this.primaryQueue=new d,this.workerQueue=new d,this.onMessage=t,this.sends=P(this),e.on("message",async(i,a)=>{let u=a!==void 0,c=n.fromJSON(a||i);if(this.useLogging){let k=u?i.process.pid:i.from;c.log(k.toString())}switch(c.to){case r.enqueueJob:await this.enqueueJob(c);break;case r.getNextJob:await this.getNextJob(i);break;case r.message:await this.message(c);break;case r.enqueueJobPrimary:await this.enqueueJob(c);break;case r.getNextPrimaryJob:await this.getNextPrimaryJob();break;case r.newJobNotice:break;default:console.warn("Unknown command:",c);return}}),e.on("exit",(i,a,u)=>{this.useLogging&&console.info(`${i.process.pid} died: ${a} ${u}`),this.spawnWorker()}),e.on("online",i=>{this.useLogging&&console.info("Worker "+i.process.pid+" is online"),this.getNextJob(i)})}async start(e=A){await Promise.all([new Promise(t=>{setTimeout(()=>{this.primaryQueue.queue.length===0&&t(!0)},100)})]),this.useLogging&&console.info("Primary cluster setting up "+e+" workers...");for(var s=0;s<e;s++)this.spawnWorker()}spawnWorker(){let e=this.process.fork();return e.on("disconnect",()=>{e.removeAllListeners(),e.kill(),e=void 0}),e}addTask(e){return e.to==="primary"?this.primaryQueue.add(e):this.workerQueue.add(e),e}getWorkers(){return Object.values(L.workers)}async enqueueJob(e){if(e.to===r.enqueueJobPrimary){let s=await this.onMessage(e,this.state,this.sends);s===void 0?await e.run(this.state,this.sends):await s.run(this.state,this.sends)}else this.addTask(e),this.process.workers&&this.sends.newJobNotice()}async getNextJob(e){let s=this.workerQueue.getNext(e.process.pid);if(s===void 0)return;let t=await this.onMessage(s,this.state,this.sends);t?e.send(t):e.send(s)}async getNextPrimaryJob(){let e=this.primaryQueue.getNext("primary");if(e===void 0)return;let s=await this.onMessage(e,this.state,this.sends);s===void 0?await e.run(this.state,this.sends):await s.run(this.state,this.sends)}async message(e){this.useLogging&&console.log("Primary Message:",e),await this.onMessage(e,this.state,this.sends)}};function J(o){return{getNextJob:()=>o.process.send(new n(r.getNextJob,{},o.pid,r.getNextJob)),enqueueJob:(e,s={},t="workers")=>t==="primary"?o.process.send(new n(e,s,o.pid,r.enqueueJobPrimary)):o.process.send(new n(e,s,o.pid,r.enqueueJob)),newJobNotice:()=>o.process.send(new n(r.newJobNotice,{},o.pid,r.newJobNotice)),message:async(e,s={})=>o.process.send(new n(e,s,o.pid,r.message))}}var l=class{constructor(e,s,t=!1){this.state={};this.isWorking=!1;this.process=e,this.useLogging=t,this.pid=this.process.process.pid,this.sends=J(this),e.on(r.message,async m=>{if(this.isWorking)return;this.isWorking=!0;let i=n.fromJSON(m);switch(this.useLogging&&i.log("primary"),i.to){case r.newJobNotice:this.sends.getNextJob();break;case r.message:break}let a=await s(i,this.state,this.sends);a===void 0?await i.run(this.state,this.sends):await a.run(this.state,this.sends),this.isWorking=!1,this.sends.getNextJob()})}kill(){this.process.removeAllListeners(),this.process.kill("SIGKILL"),this.process=void 0}};var p=()=>{},_=class{constructor(e=[],s=!1){this.cliCommands=[];this.onPrimaryCommand=p;this.onWorkerCommand=p;this.useLogging=s;for(let t of b.concat(e))t.command.indexOf("cli:")===0?this.cliCommands.push(t):n.register(t.command,t.action);return this}onCommand(e,s){return this.onPrimaryCommand=e,this.onWorkerCommand=s,this}async start(e=p,s=p,t=!0,m){if(y.isPrimary){let i=new f(this.cliCommands,t),a=new h(y,i,this.onPrimaryCommand,this.useLogging);i.start(),await a.start(m),await e(a)}else await s(new l(y.worker,this.onWorkerCommand,this.useLogging))}};export{_ as Cluster};
//# sourceMappingURL=index.js.map