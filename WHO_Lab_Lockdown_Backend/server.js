'use strict';
const express=require('express');
const http=require('http');
const path=require('path');
const fs=require('fs');
const {Server}=require('socket.io');
const BANK=require('./bank.json');
const app=express(),server=http.createServer(app),io=new Server(server);
app.use(express.json({limit:'16kb'}));
app.use(express.static(path.join(__dirname,'public')));
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD;
const SAVE_FILE=process.env.GAME_STATE_FILE||''; // Set to persistent disk path if hosting supports it.
const empty=()=>({started:false,startedAt:null,updatedAt:Date.now(),teams:{},rankings:[]});
let game=empty();
try{if(SAVE_FILE&&fs.existsSync(SAVE_FILE))game=JSON.parse(fs.readFileSync(SAVE_FILE,'utf8'))}catch(e){console.warn('Could not load saved game',e.message)}
const persist=()=>{if(SAVE_FILE){try{fs.mkdirSync(path.dirname(SAVE_FILE),{recursive:true});fs.writeFileSync(SAVE_FILE,JSON.stringify(game))}catch(e){console.warn('Could not persist game:',e.message)}}};
const broadcast=()=>{game.updatedAt=Date.now();persist();io.emit('challenge:state',game)};
const validTeam=id=>Number.isInteger(id)&&id>=1&&id<=4;
const auth=(req,res,next)=>{if(!ADMIN_PASSWORD||req.body?.password!==ADMIN_PASSWORD)return res.status(401).json({ok:false,error:'Admin authentication failed'});next()};
app.get('/api/state',(_req,res)=>res.json(game));
app.post('/api/auth',auth,(_req,res)=>res.json({ok:true}));
app.post('/api/start',auth,(_req,res)=>{if(!game.started){game=empty();game.started=true;game.startedAt=Date.now();broadcast()}res.json({ok:true,state:game})});
app.post('/api/reset',auth,(_req,res)=>{game=empty();broadcast();res.json({ok:true,state:game})});
app.post('/api/answer',(req,res)=>{
 if(!game.started)return res.status(409).json({ok:false,error:'Challenge has not started'});
 const teamId=Number(req.body?.teamId),level=Number(req.body?.level),question=Number(req.body?.question),option=Number(req.body?.option);
 if(!validTeam(teamId)||!Number.isInteger(level)||level<0||level>4||!Number.isInteger(question)||!Number.isInteger(option)||option<0||option>3)return res.status(400).json({ok:false,error:'Invalid question'});
 const q=BANK[String(teamId)]?.[level]?.[question];if(!q)return res.status(400).json({ok:false,error:'Unknown question'});
 let t=game.teams[teamId]||(game.teams[teamId]={done:{},answers:{},count:0,finishedAt:null});
 if(t.finishedAt||game.rankings.length>=3)return res.status(409).json({ok:false,error:'The podium has been finalized'});
 const key=`${level}-${question}`;
 if(t.done[key])return res.json({ok:true,correct:true,count:t.count});
 // Enforce sequential levels to prevent skipping the puzzle path.
 for(let l=0;l<level;l++)for(let i=0;i<BANK[String(teamId)][l].length;i++)if(!t.done[`${l}-${i}`])return res.status(409).json({ok:false,error:'Finish earlier levels first'});
 if(option!==q.a)return res.json({ok:true,correct:false});
 t.done[key]=true;t.answers[key]=option;t.count=Object.keys(t.done).length;broadcast();res.json({ok:true,correct:true,count:t.count});
});
app.post('/api/finish',(req,res)=>{
 if(!game.started)return res.status(409).json({ok:false,error:'Challenge has not started'});
 const teamId=Number(req.body?.teamId),code=String(req.body?.code||'');if(!validTeam(teamId))return res.status(400).json({ok:false,error:'Invalid team'});
 const t=game.teams[teamId];if(!t||t.count!==12)return res.status(409).json({ok:false,error:'All twelve questions must be cleared first'});
 const expected=BANK[String(teamId)][4].map(q=>q.a+1).join('');if(code!==expected)return res.status(403).json({ok:false,error:'Incorrect escape code'});
 if(t.finishedAt)return res.json({ok:true,state:game});
 if(game.rankings.length>=3)return res.status(409).json({ok:false,error:'The first three places have already been awarded'});
 const now=Date.now();t.finishedAt=now;
 game.rankings.push({teamId,rank:game.rankings.length+1,finishedAt:now,elapsedMs:now-game.startedAt});
 broadcast();res.json({ok:true,state:game});
});
io.on('connection',socket=>socket.emit('challenge:state',game));
const port=process.env.PORT||3000;server.listen(port,()=>console.log(`WHO Lab Lockdown on ${port}`));
