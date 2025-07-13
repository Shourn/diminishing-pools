import {DiminishingPoolDataModel} from "./diminishing-pool-data-model.mjs";
import {MODULE} from "./constants.mjs";
import {Hooks} from "./hooks.mjs";

const settings = Object.freeze({
    dataStorage: "dataStorage",
})


function initialize() {
    const {ArrayField, EmbeddedDataField} = foundry.data.fields;
    game.settings.register(MODULE, settings.dataStorage, {
        type: new ArrayField(new EmbeddedDataField(DiminishingPoolDataModel)),
        onChange: (value) => foundry.helpers.Hooks.callAll(Hooks.poolsChanged, value),
        scope: "world"
    })
}

export const Settings = Object.freeze({
    initialize,
    settings
})