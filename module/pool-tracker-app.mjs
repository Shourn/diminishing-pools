import {Templates} from "./templates.mjs";
import {DIE_SIZES} from "./constants.mjs";
import {Hooks} from "./hooks.mjs";
import {DiminishingPools} from "./diminishing-pools.mjs";

let app;

function initialize() {
    app ??= new PoolTrackerApplication();
    foundry.helpers.Hooks.once("ready", () => app.render(true));
}

function render(options = true) {
    app?.render(options)
}

class PoolTrackerApplication extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    static DEFAULT_OPTIONS = {
        window: {
            title: "DIMPOOLS.poolTrackerApp.title",
            contentClasses: ["pool-tracker-app"],
        },
        position: {
            width: 440,
        },
        actions: {
            addPool: PoolTrackerApplication.#addPool,
            deletePool: PoolTrackerApplication.#deletePool,
            configurePool: PoolTrackerApplication.#configurePool,
            rollPool: PoolTrackerApplication.#rollPool
        }
    }

    static PARTS = {
        tracker: {
            template: Templates.templates["diminishing-pools:pool-tracker-app"],
        }
    }

    static async #addPool() {
        return DiminishingPools.add();
    }

    static async #deletePool(event, element) {
        const poolIndex = element.closest("[data-index]").dataset.index;
        return DiminishingPools.remove(poolIndex)
    }

    static async #configurePool(event, element) {
        const poolIndex = element.closest("[data-index]").dataset.index;
        return DiminishingPools.configure(poolIndex);
    }

    static async #rollPool(event, element) {
        const poolIndex = element.closest("[data-index]").dataset.index;
        return DiminishingPools.roll(poolIndex);
    }

    constructor() {
        super(arguments);

        foundry.helpers.Hooks.on(Hooks.poolsChanged, () => this.render(false))
    }


    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.pools = DiminishingPools.getAll();
        context.dieSizes = DIE_SIZES;
        context.gm = game.user.isGM;
        return context;
    }

}

export const PoolTrackerApp = Object.freeze({
    initialize,
    render
})