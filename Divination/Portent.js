//////////////////............How does this work?.............//////////////////////
// You as the GM have to check the itemName is correct in this macro. (see main function)
// The player clicks the macro and on first run it will only give the button refresh
// this will set the dice for the first time. CLicking the macro again will allow the
// player to use the dice set by the macro. It is then upto the DM and player on how
// to interpret this number. Since there are too many use cases to capture at once.
//
// Gallery: https://imgur.com/a/PYpMbUy
//
// Required: FoundryVTT v0.75+, DND5e v 1.2+
// works in  FoundryVTT v0.8.6, DND5e v 1.3.4
// Originally by @Freeze
// 22APR2022 Modified @TeachingBudha
//  -Tested: FoundryVTT v0.9.269 DND5e v 1.5.7
//  -Added rollTable creation default name is "DivinationVisions", non-refreshing
//  -Rolltable is used to flavor texts whenever you use your portent
//  If you want to add/edit to the rollTable later on, you can go to the rollTables, input new
//      entries, update the formula.

const itemName = "Portent"                                                    
// set this string to what the Portent feature item is called in your game.
const wizardActor = game.user.character || canvas.tokens.controlled[0].actor; 
//second option is for the GM.
const portentItem = wizardActor.items.find(i => i.data.name.includes(itemName)); 
// finds that item name.

if(!portentItem) return ui.notifications.warn("Your actor does not have the Portent feature");

let tableName ="DivinationVisions";
let daVision  = "I have foreseen this in the stars : "; //just in case the table can't be found
let table = game.tables.contents.find(t => t.name == tableName);

if (table) {
  if (checkTable(table)) {
    let roll = await table.roll();
    let result = roll.results[0];
    daVision = result.data.text;
    await table.updateEmbeddedDocuments("TableResult", [{
      _id: result.id,
      drawn: true
    }]);
  }
}else{
    //DivinationVisions rollTable not present, let's create it!
    createTable(tableName);
    ui.notifications.notify(tableName + " rollTable created, execute the macro or feature again")
    return;
}

let myButtons = await generateButtons(wizardActor, portentItem, itemName, daVision); // creates the buttons, see function below.  

new Dialog({
    title: "Divination wizard's Portent",
    content: "Make a choice",
    buttons: myButtons,
}).render(true);

async function generateButtons(macroActor, item, itemName, daVision){
    let portentRolled = await macroActor.getFlag("world","portent"); 
        // does the character already have a set of buttons
    let diceNumber = macroActor.items.getName("Wizard").data.data.levels < 14 ? 2 : 3; 
        //sets up for Greater Portent where the player gets 3 dice at level 14.
    let myButtons = {};
  
    if (portentRolled !== undefined){
        myButtons = portentRolled.reduce((buttons, roll) => {
            let msgContent = `${daVision} - And so the foretold roll is <b>${roll}</b>`;
            buttons[roll] = {
                label: `Roll: ${roll}`,
                callback: async () => {
                    ChatMessage.create({content:`<div class="dnd5e chat-card">
                                                    <header class="card-header flexrow">
                                                        <img src="${item.data.img}" title="${item.data.name}" width="36" height="36" />
                                                        <h3 class="item-name">${item.data.name}:</h3>
                                                    </header></div>` + msgContent, speaker:{alias: macroActor.name}});
                    portentRolled.splice(portentRolled.indexOf(roll), 1); 
                        // removes the used value from the array.
                    await macroActor.setFlag("world", "portent", portentRolled); 
                        // sets the new array as the flag value
                    await item.update({name: `${itemName} [${portentRolled}]`});  
                        // updates the item name to contain the new array.
                }
            };
            return buttons;
        }, {});
    }
    myButtons.reset = {
        label: "Refresh, new day",
        callback: async () => {
            let portentRolls = [];
            let msgContent = "";
            let i = 1; // roll counter
            let myRoll = await new Roll(`${diceNumber}d20`).evaluate({async: true}); // rolling the new dice
            for(let result of myRoll.terms[0].results){
                portentRolls.push(result.result); 
                    // adding the result to the array.
                msgContent += `Roll ${i} - <b>${result.result}</b></br>`; 
                    // preps part of the chat message content
                i++;
            }
            await macroActor.setFlag("world", "portent", portentRolls); 
                // sets a fresh array of 2 or 3 d20s 
            await item.update({name: `${itemName} [${portentRolls}]`})
            ChatMessage.create({content: `<div class="dnd5e chat-card">
                                            <header class="card-header flexrow">
                                            <img src="${item.data.img}" title="${item.data.name}" width="36" height="36" />
                                            <h3 class="item-name">${item.data.name}:</h3>
                                        </header></div>
                                            My portent forsees the following outcomes:</br>` + msgContent, speaker:{alias: macroActor.name}});
        }
    };
    return myButtons;
}

  function checkTable(table) {
    let results = 0;
    for (let data of table.data.results) {
      if (!data.drawn) {
        results++;
      }
    }
    if (results < 1) {
      table.reset();
      ui.notifications.notify("Table Reset")
      return false
    }
    console.log(" PortentMacro : the rollTable " + table.name + " exists, returning TRUE");
    return true
  }
  
  function createTable(tableName){
      
      let resultsArray= [];
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "A burly, well-endowed bronze skinned native appears from nowhere, just before everybody and says: 'The spirits want it this way' ",
         "weight" : 1,
         "range"  : [1,1], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "Had a vision last time I got drunk. Wasn't nice. But here is how it goes...",
         "weight" : 1,
         "range"  : [2,2], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "I have dreamt about it. Just last night. Or was it when I was just a child? Here is how it is going to happen:...",
         "weight" : 1,
         "range"  : [3,3], 
         "drawn"  : false
      });
            
      resultsArray.push({
         "type"   : 0,
         "text"   : "Ah. I read about this in the morning coffee.",
         "weight" : 1,
         "range"  : [4,4], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "Ah. I looked at it in the tea yeterday.",
         "weight" : 1,
         "range"  : [5,5], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "A majestic crow flies over us, his caws have foretold the unwinding of events.",
         "weight" : 1,
         "range"  : [6,6], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "In the distance, an Owl hoots and is letting me know how is it going to happen.",
         "weight" : 1,
         "range"  : [7,7], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "Some weeks ago, a child told me 'You have to pat hard while saying wacko! wacko!' This was an omen from the Gods",
         "weight" : 1,
         "range"  : [8,8], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "Our mushroom eating party member doesn't know, but he has an invisible crazy leprechaun sitting on shoulder. Sometimes tells of the future.",
         "weight" : 1,
         "range"  : [9,9], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "The voices. The voices in my head. Make them stop. They are telling what is going to happen. Meke them stop!",
         "weight" : 1,
         "range"  : [10,10], 
         "drawn"  : false
      });
      
      resultsArray.push({
         "type"   : 0,
         "text"   : "I see it in the fire. The fire talks to me. The fire is going to cleanse us all. -The wizard has a look like if watching the world burn- .",
         "weight" : 1,
         "range"  : [11,11], 
         "drawn"  : false
      });      
      
      
      let newRollTable = RollTable.create({
          'name'        : tableName,
          'description' : 'Created by the PortentMacro to help flavour text the Portent',
          'results'     : resultsArray,
          'formula'     : '1d11',
          'replacement' : false,
          'displayRoll' : true

      });
  }