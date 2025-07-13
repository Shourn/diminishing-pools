import {Settings} from "./settings.mjs";
import {Templates} from "./templates.mjs";
import {PoolTrackerApp} from "./pool-tracker-app.mjs";
import {ChatCommands} from "./chat-commands.mjs";
import {ChatInteraction} from "./chat-interaction.mjs";

foundry.helpers.Hooks.once("init", () => {

    console.log("Initializing 'Diminishing Pools'");

    Settings.initialize();
    Templates.initialize();
    ChatCommands.initialize();
    ChatInteraction.initialize();
    PoolTrackerApp.initialize();

})