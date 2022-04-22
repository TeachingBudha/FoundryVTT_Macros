//Requires the FurySwipesMacro
// This takes the Ursa Warrior that has Enrage
// Goes for the ursaSwipesCounter and doubles it!

//Learn You can remove the comments for the console outputs
//Hit f12 on your browse, have the console open and see the outputs as the macro executes
//DualMonitor+ highly recommended, too much info to be shown in only one screen

const ursaName    = "Ursa Warrior";
const attackName  = "Enrage";

//Either the player or the GM
const ursaActor= game.user.character || canvas.tokens.controlled[0].actor;

//Try to get if that the Ursa Warrior has the Enrage feature
const ursaNameItem    = ursaActor.items.find(i => i.data.name.includes(ursaName)); 
const attackNameItem  = ursaActor.items.find(i => i.data.name.includes(attackName)); 

//DEBUG
//Make sure we are ready, "Ursa Warrior" Feature, "Enrage" Feature
//Use ui.notifications.warn toast and console.log, learn, learn
if ( typeof ursaNameItem === 'undefined' ){
    ui.notifications.warn(this.name + ": You are not a Ursa Warrior ");
    if(typeof attackNameItem === 'undefined' ){
        return ui.notifications.warn(this.name + ": ...AND You do not have Enrage ");
    }
} else {
    console.log(this.name + ": ursaNameItem.name   value: " + ursaNameItem.name   );
    console.log(this.name + ": attackNameItem.name value: " + attackNameItem.name );
}


let ursaTarget  = Array.from(game.user.targets)[0];
ursaTarget = ursaTarget.actor;
let ursaTargetId = ursaTarget.id;
console.log(this.name + ": The target token Actor's name is " + ursaTarget.name)

let targetTokenId  = Array.from(game.user.targets)[0].id;
let targetToken    = canvas.scene.data.tokens.find(targetToken => targetToken.id == targetTokenId);
let targetTokenName= targetToken.name;

console.log("EnrageMacro : The token target name  is        " + targetTokenName)
console.log("EnrageMacro : The token target id    is        " + targetTokenId)


let enrageMe = await enrageUrsa(ursaTarget);

async function enrageUrsa(ursaTarget){
    let counter = await ursaTarget.getFlag("world","ursaSwipesCounter");   
    console.log("EnrageMacro :  Old SwipesCounter value is " + counter);      
    
    counter = counter * 2;
    await ursaTarget.setFlag("world","ursaSwipesCounter",counter);
    
    console.log("EnrageMacro :  Now SwipesCounter value is " + await ursaTarget.getFlag("world","ursaSwipesCounter"));      
   
}