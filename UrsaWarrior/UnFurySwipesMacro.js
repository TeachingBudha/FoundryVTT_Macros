//Either the player or the GM
const ursaActor= game.user.character || canvas.tokens.controlled[0].actor;

let ursaTarget  = Array.from(game.user.targets)[0];
ursaTarget = ursaTarget.actor;

return await mwakDmgToZero();

async function mwakDmgToZero(){
let counter = 0;
let obj = {};

    await ursaTarget.setFlag("world","ursaSwipesCounter",0);
    
    obj['data.bonuses.mwak.damage'] = `${counter}d8`;
    await ursaActor.update(obj);
           
}