
//0) Module Requirements "Advanced Macros", "MIDI-QOL"
//1) Don't let your friend convince you of having a DOTA inspired Ursa Warrior character
//2) After friends begs for so long, make sure you create the class feature "Ursa Warrior" (just create the feature use the +add button)
//3) Make sure to add the "Fury Swipes" Feature to the char as well (just create the feature use the +add button, assign it simple salshing 1d8 damage)
//4) Add this Macro to the "FurySwipesMacro" as script in your HotBar
//5) Edit Fury Swipes feature->Details, scroll down to the part "On Use Macro" and input FurySwipesMacro -> Before damage roll
//6) ..enjoy!
//***It only overwrites the mwadmg (melee weapon damage?) to the new stack calculated value
//Does not wait 4 turns to reset  stacks, as soon as the UrsaWarrior changes target and uses "Fury Swipes" the stack disappears
//***There are macros out there that save the previous mwadmg and handle that. This one does not do that (yet).
//***If you modify it with that functionality (case an Ursa Warrior can have other sources of mwadmg, which from my POV is super OverPowered), please let me know so I can take a look at your approach
//
//6) Learning mode, uncommment the //console.log lines
//7) Learning mode, in your browser console, hit F12, if your console suppor filters, filter by "FurySwipesMacro"
//The unlinked token Id gets stored in the Actor as a keyValue Flag called ursaVictim
//If the new Targer tokenId is diferent than the previous, stack counter gets re-set to 0



//Should be only used with the Claw attack of an Ursa Warrior
const ursaName    = "Ursa Warrior";
const attackName  = "Fury Swipes";
  
//Either the player or the GM
const ursaActor= game.user.character || canvas.tokens.controlled[0].actor;

//Try to get if that the Ursa Warrior has the Fury Swipes
const ursaNameItem    = ursaActor.items.find(i => i.data.name.includes(ursaName)); 
const attackNameItem  = ursaActor.items.find(i => i.data.name.includes(attackName)); 

//DEBUG
//Make sure we are ready, "Ursa Warrior" Class, "Fury Swipes" Ability
//Use ui.notifications.warn toast and //console.log, learn, learn
if ( typeof ursaNameItem === 'undefined' ){
    ui.notifications.warn(this.name + ": You are not a Ursa Warrior ");
    if(typeof attackNameItem === 'undefined' ){
        return ui.notifications.warn(this.name + ": ...AND You do not have Fury Swipes ");
    }
} else {
    //console.log("FurySwipesMacro : ursaNameItem.name   value: " + ursaNameItem.name   );
    //console.log("FurySwipesMacro : attackNameItem.name value: " + attackNameItem.name );
}

let ursaTarget  = Array.from(game.user.targets)[0];
ursaTarget = ursaTarget.actor;
let ursaTargetId = ursaTarget.id;
//console.log(this.name + ": The target token Actor's name is " + ursaTarget.name)

let targetTokenId  = Array.from(game.user.targets)[0].id;
let targetToken    = canvas.scene.data.tokens.find(targetToken => targetToken.id == targetTokenId);
let targetTokenName= targetToken.name;

//console.log("FurySwipesMacro : The token target name  is        " + targetTokenName)
//console.log("FurySwipesMacro : The token target id    is        " + targetTokenId)


if ( typeof targetToken === 'undefined' ){
    return ui.notifications.warn(this.name + ": aaaghhh.. you do not have a target! " );
} else {
    //console.log("FurySwipesMacro : furySwipes victim is    : " + targetToken.name);
}

let furySwipes = await clawsOnVictim(ursaActor, ursaTarget, attackNameItem, targetTokenId, targetTokenName);

async function clawsOnVictim(ursaActor, ursaTarget, attackNameItem, targetTokenId, targetTokenName){
    let counter = 0;
    
    //Ursa Warrior know who whas the last Target
    let ursaVictimId= await ursaActor.getFlag("world","ursaVictimId");
    counter         = await ursaTarget.getFlag("world","ursaSwipesCounter");
    
    //If our new Target does not have a ursaSwipesCounter, it should be created and set to 0
    if (isNaN(counter)){
        await ursaTarget.setFlag("world","ursaSwipesCounter",0);
        counter = await ursaTarget.getFlag("world","ursaSwipesCounter");
    }
  
    
    let obj = {};
    
    if(ursaVictimId !== undefined){
        //console.log("FurySwipesMacro :: We already have a Victim, its Id is : " + ursaVictimId);

        if(ursaVictimId != targetTokenId){
            //console.log("FurySwipesMacro : We have a previous diferent Victim Id   " + ursaVictimId);
            //console.log("FurySwipesMacro : New Victim's token Id is                " + targetTokenId);

            //console.log("FurySwipesMacro : Re-setting Victim name to :" + ursaTarget.name);
            //console.log("FurySwipesMacro : Re-setting Victim Id   to :" + targetTokenId);
            
            await ursaActor.setFlag("world","ursaVictimId",targetTokenId);

            //console.log("FurySwipesMacro : Re-setting SwipesCounter value to 1 ");
            await ursaTarget.setFlag("world","ursaSwipesCounter",1);
            
            counter = 0;
            
            obj['data.bonuses.mwak.damage'] = `${counter}d8`;
            await ursaActor.update(obj);
            
            let newMDmg = ursaActor.data.data.bonuses.mwak.damage;
            //console.log("FurySwipesMacro : Re-setted melee weapon attack bonus damage is : " + newMDmg);        

        }else{
            
            //Finally something interesting. Same ursaVictim, now we get to FurySwipe the poor Victim
            //console.log("FurySwipesMacro :  Old victim Id : " + ursaVictimId + " is the same as Id " + targetTokenId);

            //Announce your brutal prowess to the world
            let msgContent =`My claws have sunk <b>${counter}</b> many extra times on this <b>${targetTokenName}</b> prey`
            ChatMessage.create({content:`<div class="dnd5e chat-card">
                                            <header class="card-header flexrow">
                                                <img src="${attackNameItem.data.img}" title="${attackNameItem.data.name}" width="36" height="36" />
                                                <h3 class="item-name">${attackNameItem.data.name}:</h3>
                                            </header></div>` + msgContent, speaker:{alias: ursaActor.name}});
                                            
            let oldMDmg = ursaActor.data.data.bonuses.mwak.damage;
            //console.log("FurySwipesMacro : Old melee weapon attack bonus damage is : " + oldMDmg);        

            //console.log("FurySwipesMacro : Currently the Fury Swipes bonus damage is " + counter + "d8" );
            
            obj['data.bonuses.mwak.damage'] = `${counter}d8`;
            await ursaActor.update(obj);

            let newMDmg = ursaActor.data.data.bonuses.mwak.damage;
            //console.log("FurySwipesMacro : New melee weapon attack bonus damage is : " + newMDmg);   
            
            //console.log("FurySwipesMacro :  Increasing SwipesCounter +1 ");
            counter++;
            await ursaTarget.setFlag("world","ursaSwipesCounter",counter);
            //console.log("FurySwipesMacro :  Now SwipesCounter value is " + await ursaTarget.getFlag("world","ursaSwipesCounter"));            
            
        }

    }else{
        
        //This part gets called if no ursaVictim nor ursaSwipesCounter exist in the Actor DB
        //This means is the first time EVER the macro is being called for the ursaActor.
        
        //console.log("FurySwipesMacro : : ursaVictimId data : is undefined and should be initialized" );
        //console.log("FurySwipesMacro : : attempting to initialize the Victim and SwipesCounter flags");
        await ursaActor.setFlag("world","ursaVictimId",ursaTargetId);
        await ursaTarget.setFlag("world","ursaSwipesCounter",1)
        
    }
    
    return counter;
}