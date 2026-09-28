// Local integration fixture. Never imported by production code.
export function fixture(path:string,init:RequestInit={}){
 const models=[{id:'qa-chat',name:'QA Chat · test fixture',type:'chat',capabilities:['streaming','vision','reasoning','tools'],description:'Local test model. Not a real AI response.',context_window:128000},{id:'qa-web',name:'QA Web · test fixture',type:'chat',capabilities:['streaming','web_search']},{id:'qa-embedding',name:'QA Embedding',type:'embedding',capabilities:[]}];
 if(path==='/models')return Response.json({data:models});
 if(path==='/chat/completions'){
 const body=JSON.parse(String(init.body));const last=body.messages.at(-1)?.content;const txt=typeof last==='string'?last:last?.find((x:any)=>x.type==='text')?.text||'';
 if(txt.includes('error-test'))return Response.json({error:{message:'Mock rate limit'}},{status:429});
 const response='این یک پاسخ آزمایشی برای بررسی رابط کاربری است.\n\n**پیام دریافت شد:** '+txt.slice(0,70)+'\n\n- ذخیرهٔ گفتگو\n- ویرایش پیام\n- نمایش روان متن\n\n```js\nconst message = "Hello, MindGPT";\n```';
 let i=0;const parts=response.match(/[\s\S]{1,9}/g)!;let interval:ReturnType<typeof setInterval>;
 return new Response(new ReadableStream({start(c){interval=setInterval(()=>{if(init.signal?.aborted){clearInterval(interval);c.close();return}if(i<parts.length)c.enqueue(new TextEncoder().encode('data: '+JSON.stringify({choices:[{delta:{content:parts[i++]}}]})+'\n\n'));else{clearInterval(interval);c.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));c.close()}},60)},cancel(){clearInterval(interval)}}),{headers:{'Content-Type':'text/event-stream'}})
 }
 return Response.json({error:'Unknown fixture path'},{status:404});
}
