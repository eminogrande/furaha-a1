import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.BASE_URL||'http://localhost:4173').replace(/\/$/,'');
test('level guide opens all levels, checks answers, and separates model review',async()=>{
 const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:390,height:844}}); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(base+'/levels.html');await page.waitForSelector('.level-section');assert.equal(await page.locator('.level-section').count(),5);
 for(const id of ['A2','B1','B2','C1','C2']){
 const section=page.locator('#level-'+id);await section.locator('.level-head').click();assert.equal(await section.locator('.mcq-item').count(),3);
 assert.equal(await section.locator('.situation audio').count(),1,'real German audio exists for each reading');
 assert.equal(await section.locator('.model-box:visible').count(),0);
 await section.locator('.option-btn').first().click();assert.equal(await section.locator('.feedback:visible').count(),1);
 await section.locator('.prompt-block button').first().click();assert.equal(await section.locator('.model-box:visible').count(),1);
 assert.ok(await section.locator('[id^="progress-"]').count(),'visible attempts summary');
 assert.equal(await section.locator('textarea').count(),1,'writing input available');
 }
 await page.locator('[data-lang="sw"]').click();assert.ok((await page.locator('#level-guide').innerText()).length>20);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
