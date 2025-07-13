import {PoolTrackerApp} from "./pool-tracker-app.mjs";
import {DiminishingPools} from "./diminishing-pools.mjs";

const addPoolCommandRegExp = new RegExp("^(\/(?:add|new)pool)\s?.*$", "i");

/**
 * @param {ChatLog} chatLog
 * @param {string} message
 * @param {string} user
 * @param {ChatSpeakerData} speaker
 */
function onChatMessage(chatLog, message, {user, speaker}) {
    if (message.startsWith("/pools")) {
        PoolTrackerApp.render()
        return false;
    }
    if (addPoolCommandRegExp.test(message)) {
        DiminishingPools.add();
        return false;
    }
}


function initialize() {
    foundry.helpers.Hooks.on("chatMessage", onChatMessage)
}

export const ChatCommands = Object.freeze({
    initialize
})