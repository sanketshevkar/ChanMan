const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const mongoose = require('mongoose');
const User = require('./models/user');
const connectDB = require('./config/db');
const readline = require('readline');




connectDB();

async function run() {
  try {
    const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  await page.goto('https://account.booking.com/sign-in?op_token=EgVvYXV0aCJHChQ2Wjcyb0hPZDM2Tm43emszcGlyaBIJYXV0aG9yaXplGhpodHRwczovL2FkbWluLmJvb2tpbmcuY29tLyoCe31CBGNvZGUqCjoAQgBYrOmC8QU');

  // dom element selectors
  const USERNAME_SELECTOR = '#loginname';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_PASSWORD_SELECTOR = '#root > div > div.access-container.bui_font_body > div > div.access-panel.bui-spacer--large.box-shadow.nw-access-panel > div.transition-container > div > div > div > form > button';
  const BUTTON_USERNAME_SELECTOR = '#root > div > div.access-container.bui_font_body > div > div.access-panel.bui-spacer--large.box-shadow.nw-access-panel > div.transition-container > div > div > div > form > div.bui-spacer > button';
//login
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(CREDS.username);
  await page.click(BUTTON_USERNAME_SELECTOR);

  await page.waitFor(10 * 1000);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);
  await page.click(BUTTON_PASSWORD_SELECTOR);

  await page.waitFor(10 * 1000);
//verification
  var verification = page.url();
  var veriURL1=verification.slice(0, 48);
  var veriURL2='https://account.booking.com/sign-in/verification'
   if(veriURL1==veriURL2){
    const PULSE_BUTTON_SELECTOR='#root > div > div.access-container.bui_font_body > div > div.access-panel.bui-spacer--large.box-shadow.nw-access-panel > div.transition-container > div > div > div > div.icon-nav-list.nw-signin-verification > a.icon-nav-list__item.icon-nav-list__item--with-icon.bui_color_action.nw-pulse-verification-link'
    await page.click(PULSE_BUTTON_SELECTOR);
    /*
    //get code
    var code;
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

     rl.question('What is the pulse code? ',  (answer) => {
    // TODO: Log the answer in a database                               //async-await issue
     code = answer;
     console.log(code);

    rl.close();
    });

    //enter verification
    const BUTTON_CODE_SELECTOR='#sms_code';
    await page.click(BUTTON_CODE_SELECTOR);
    await page.keyboard.type(code);
    //click login
    const BUTTON_VERIFY_SELECTOR='#root > div > div.access-container.bui_font_body > div > div.access-panel.bui-spacer--large.box-shadow.nw-access-panel > div.transition-container > div > div > div > form > div.bui-spacer > button > span';
    await page.click(BUTTON_VERIFY_SELECTOR);
    */
  }


  //property selector
  await page.waitFor(40 * 1000);
  const BUTTON_PROPERTY_SELECTOR='body > div.peg-content-wrapper.js-dont-warn-about-unsaved-changes > main > div > div > div.bui-spacer > div.peg-table__wrapper.peg-u-print-overflow > table > tbody > tr:nth-child(3) > td:nth-child(2) > div.bui-avatar-block > div.bui-avatar-block__text > span.bui-avatar-block__title > a';
  await page.click(BUTTON_PROPERTY_SELECTOR);






  browser.close();
} catch (err) {
    console.log(err);
}
}


function upsertUser(userObj) {
  

  // if this email exists, update the entry, don't insert
  const conditions = { email: userObj.email };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(conditions, userObj, options, (err, result) => {
    if (err) {
      throw err;
    }
  });
}

run();
