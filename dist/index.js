var L=Object.create;var d=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var _=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var P=t=>d(t,"__esModule",{value:!0});var D=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),O=(t,e)=>{for(var s in e)d(t,s,{get:e[s],enumerable:!0})},x=(t,e,s,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let m of A(e))!j.call(t,m)&&(s||m!=="default")&&d(t,m,{get:()=>e[m],enumerable:!(o=T(e,m))||o.enumerable});return t},p=(t,e)=>x(P(d(t!=null?L(_(t)):{},"default",!e&&t&&t.__esModule?{get:()=>t.default,enumerable:!0}:{value:t,enumerable:!0})),t),M=(t=>(e,s)=>t&&t.get(e)||(s=x(P({}),e,1),t&&t.set(e,s),s))(typeof WeakMap!="undefined"?new WeakMap:0);var k=D((V,$)=>{$.exports={name:"@psysecgroup/cluster-queue",description:"Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.",version:"1.0.0",author:"The PsySec Group",license:"MIT",bugs:{url:"https://github.com/PsySecGroup/cluster-queue/issues"},homepage:"https://github.com/PsySecGroup/cluster-queue#readme",repository:{type:"git",url:"git+https://github.com/PsySecGroup/cluster-queue.git"},scripts:{start:"node -r source-map-support/register dist/index.js",dev:`echo 'Type "npm run sb-watch" to get started'`,build:"tsup-node --legacy-output --dts --minify --format esm,cjs,iife","sb-watch":`nodemon --watch src/ -e ts,tsx,js --exec "tsup-node --dts --onSuccess 'node -r source-map-support/register dist/index.js setText -f test'"`,watch:"tsup-node --watch --dts --onSuccess 'node -r source-map-support/register dist/index.js'",test:`nodemon --watch tests/ -e ts,tsx,js --exec "tsup-node --entry.tests=tests/index.ts --onSuccess 'uvu -r source-map-support/register dist ^tests.js$'"`},tsup:{entry:["src/index.ts"],splitting:!1,sourcemap:!0,clean:!1,dts:!1},main:"./dist/index.js",module:"./dist/esm/index.js",types:"./dist/index.d.ts",files:["/dist"],devDependencies:{"@types/node":"^17.0.41",nodemon:"^2.0.16","source-map-support":"^0.5.21",tsup:"^6.1.0",typescript:"^4.7.3",uvu:"^0.5.3"},dependencies:{commander:"^9.3.0"}}});var U={};O(U,{Cluster:()=>W});var f=p(require("cluster"));var y=p(require("cluster")),N=require("commander");var l={},n=class{static register(e,s){l[e]=s}static fromJSON(e){return new n(e.command,e.args,e.from,e.to)}constructor(e,s,o,m){if(l[e]===void 0&&e[0]!=="_")throw new RangeError(`"${e}" has not been registered.`);this.command=e,this.args=s,this.from=o,this.to=m}clone(e,s){return new n(this.command,this.args,e,s)}async run(e,s){return l[this.command](this,e,s)}log(e){console.log(`[${e||this.from} -> ${this.to}] ${this.command}`,this.args)}};var r={getNextJob:"_getNextJob",getNextPrimaryJob:"_getNextJob_primary",enqueueJob:"_enqueueJob",enqueueJobPrimary:"_enqueueJob_primary",newJobNotice:"_newJobNotice",message:"message"},J=[{command:"log",action:async(t,e,s)=>{t.log(),console.log("State:",e)}},{command:"setState",action:async(t,e,s)=>{for(let o of Object.keys(t.args))e[o]=t.args[o]}},{command:"iterateState",action:async(t,e,s)=>{for(let o of Object.keys(t.args))e[o]===void 0&&(e[o]=0),e[o]+=t.args[o]}}];var{name:E,description:G,version:F}=k(),I=/[^A-Za-z0-9_]/g,b=class{constructor(e,s=!0){this.active=!0;if(this.active=s,this.active!==!1){this.program=new N.Command,this.program.name(E).description(G).version(F);for(let o of e)this.register(o)}}register(e){if(this.active===!1||!y.default.isPrimary)return;let s=e.command.substring(4);n.register(e.command,e.action);let o=s===""?this.program:this.program.command(s);o.description(e.description);let m=Object.keys(e.args);for(let i of m){let a=e.args[i];o.argument(i,a)}for(let i of Object.keys(e.options)){let a=e.options[i];o.option(i,a)}o.action((...i)=>{let a=typeof i[i.length-2]=="string"?{}:i[i.length-2];a.cli={};let u=0;for(let c of m)a.cli[c.replace(I,"")]=i[u],u+=1;y.default.emit("message",new n(e.command,a,"cli",r.enqueueJobPrimary))})}start(){this.active!==!1&&this.program.parse(process.argv)}};var v=p(require("cluster")),K=p(require("os"));var g=class{constructor(){this.queue=[]}add(e){return this.queue.push(e)}shift(){return this.queue.shift()}getNext(e){let s=this.queue.shift();return s===void 0?void 0:s.clone("primary",e)}};function q(t){return{getNextJob:()=>t.process.emit("message",new n(r.getNextPrimaryJob,{},"primary",r.getNextPrimaryJob)),enqueueJob:(e,s={},o="workers")=>o==="primary"?t.process.emit("message",new n(e,s,"primary",r.enqueueJobPrimary)):t.process.emit("message",new n(e,s,"primary",r.enqueueJob)),newJobNotice:()=>t.process.emit("message",new n(r.newJobNotice,{},"primary",r.newJobNotice)),message:async(e,s={})=>t.process.emit("message",new n(e,s,"primary",r.message))}}var z=K.cpus(),R=z.length,C=class{constructor(e,s,o,m=!1){this.state={};this.cli=s,this.process=e,this.useLogging=m,this.primaryQueue=new g,this.workerQueue=new g,this.onMessage=o,this.sends=q(this),e.on("message",async(i,a)=>{let u=a!==void 0,c=n.fromJSON(a||i);if(this.useLogging){let Q=u?i.process.pid:i.from;c.log(Q.toString())}switch(c.to){case r.enqueueJob:await this.enqueueJob(c);break;case r.getNextJob:await this.getNextJob(i);break;case r.message:await this.message(c);break;case r.enqueueJobPrimary:await this.enqueueJob(c);break;case r.getNextPrimaryJob:await this.getNextPrimaryJob();break;case r.newJobNotice:break;default:console.warn("Unknown command:",c);return}}),e.on("exit",(i,a,u)=>{this.useLogging&&console.info(`${i.process.pid} died: ${a} ${u}`),this.spawnWorker()}),e.on("online",i=>{this.useLogging&&console.info("Worker "+i.process.pid+" is online"),this.getNextJob(i)})}async start(e=R){await Promise.all([new Promise(o=>{setTimeout(()=>{this.primaryQueue.queue.length===0&&o(!0)},100)})]),this.useLogging&&console.info("Primary cluster setting up "+e+" workers...");for(var s=0;s<e;s++)this.spawnWorker()}spawnWorker(){let e=this.process.fork();return e.on("disconnect",()=>{e.removeAllListeners(),e.kill(),e=void 0}),e}addTask(e){return e.to==="primary"?this.primaryQueue.add(e):this.workerQueue.add(e),e}getWorkers(){return Object.values(v.default.workers)}async enqueueJob(e){if(e.to===r.enqueueJobPrimary){let s=await this.onMessage(e,this.state,this.sends);s===void 0?await e.run(this.state,this.sends):await s.run(this.state,this.sends)}else this.addTask(e),this.process.workers&&this.sends.newJobNotice()}async getNextJob(e){let s=this.workerQueue.getNext(e.process.pid);if(s===void 0)return;let o=await this.onMessage(s,this.state,this.sends);o?e.send(o):e.send(s)}async getNextPrimaryJob(){let e=this.primaryQueue.getNext("primary");if(e===void 0)return;let s=await this.onMessage(e,this.state,this.sends);s===void 0?await e.run(this.state,this.sends):await s.run(this.state,this.sends)}async message(e){this.useLogging&&console.log("Primary Message:",e),await this.onMessage(e,this.state,this.sends)}};function S(t){return{getNextJob:()=>t.process.send(new n(r.getNextJob,{},t.pid,r.getNextJob)),enqueueJob:(e,s={},o="workers")=>o==="primary"?t.process.send(new n(e,s,t.pid,r.enqueueJobPrimary)):t.process.send(new n(e,s,t.pid,r.enqueueJob)),newJobNotice:()=>t.process.send(new n(r.newJobNotice,{},t.pid,r.newJobNotice)),message:async(e,s={})=>t.process.send(new n(e,s,t.pid,r.message))}}var w=class{constructor(e,s,o=!1){this.state={};this.isWorking=!1;this.process=e,this.useLogging=o,this.pid=this.process.process.pid,this.sends=S(this),e.on(r.message,async m=>{if(this.isWorking)return;this.isWorking=!0;let i=n.fromJSON(m);switch(this.useLogging&&i.log("primary"),i.to){case r.newJobNotice:this.sends.getNextJob();break;case r.message:break}let a=await s(i,this.state,this.sends);a===void 0?await i.run(this.state,this.sends):await a.run(this.state,this.sends),this.isWorking=!1,this.sends.getNextJob()})}kill(){this.process.removeAllListeners(),this.process.kill("SIGKILL"),this.process=void 0}};var h=()=>{},W=class{constructor(e=[],s=!1){this.cliCommands=[];this.onPrimaryCommand=h;this.onWorkerCommand=h;this.useLogging=s;for(let o of J.concat(e))o.command.indexOf("cli:")===0?this.cliCommands.push(o):n.register(o.command,o.action);return this}onCommand(e,s){return this.onPrimaryCommand=e,this.onWorkerCommand=s,this}async start(e=h,s=h,o=!0,m){if(f.default.isPrimary){let i=new b(this.cliCommands,o),a=new C(f.default,i,this.onPrimaryCommand,this.useLogging);i.start(),await a.start(m),await e(a)}else await s(new w(f.default.worker,this.onWorkerCommand,this.useLogging))}};module.exports=M(U);0&&(module.exports={Cluster});
//# sourceMappingURL=index.js.map