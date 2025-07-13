import {DiminishingPools} from "./diminishing-pools.mjs";
import {PoolTrackerApp} from "./pool-tracker-app.mjs";

const {Hooks: FoundryHooks} = foundry.helpers

function onRenderChatLog(application, element) {
    let poolActionClickHandler = (event) => {
        const poolActionElement = event.target.closest("[data-pool-action]");
        if (poolActionElement) {
            let poolIdElement = poolActionElement.closest("[data-pool-id]");
            if (poolIdElement) {
                const action = poolActionElement.dataset.poolAction;
                const poolId = poolIdElement.dataset.poolId;
                switch (action) {
                    case "roll": {
                        DiminishingPools.roll(poolId);
                        break;
                    }
                    case "remove": {
                        DiminishingPools.remove(poolId);
                        break;
                    }
                    case "showTracker": {
                        PoolTrackerApp.render()
                        break
                    }
                }
            }
        }
    };
    element.addEventListener("click", poolActionClickHandler);
    document.body.querySelector("#chat-notifications").addEventListener("click", poolActionClickHandler);
}

function onRenderChatMessageHTML(message, html) {
    if (game.user.isGM) {
        html.querySelectorAll(".hidden[data-pool-action]").forEach((el) => {
            el.classList.remove("hidden");
        })
    }
}

function initialize() {
    FoundryHooks.on("renderChatLog", onRenderChatLog)

    FoundryHooks.on("renderChatMessageHTML", onRenderChatMessageHTML)
}

export const ChatInteraction = Object.freeze({
    initialize
})