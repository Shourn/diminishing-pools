import {Templates} from "./templates.mjs";
import {DIE_SIZES, MODULE} from "./constants.mjs";
import {DiminishingPoolDataModel} from "./diminishing-pool-data-model.mjs";
import {Settings} from "./settings.mjs";


/**
 * @return {DiminishingPoolDataModel[]}
 */
function getAll() {
    return game.settings.get(MODULE, Settings.settings.dataStorage);
}

/**
 * @param {DiminishingPoolDataModel[]} pools
 * @param {number, string, DiminishingPoolDataModel} pool
 * @return {DiminishingPoolDataModel, null}
 */
function findPool(pools, pool) {
    let result;
    if (pool instanceof DiminishingPoolDataModel) {
        result = pools.find(p => pool.id === p.id);
    } else if (typeof pool === "string") {
        if (!isNaN(Number(pool))) {
            result = pools[pool]
        } else {
            result = pools.find(p => pool === p.id);
        }
    } else if (typeof pool === "number") {
        result = pools[pool]
    }
    return result ?? null;
}

/**
 * @param {number, string} pool the index or id of the pool
 * @return {DiminishingPoolDataModel, null}
 */
function get(pool) {
    const allPools = getAll();
    return findPool(allPools, pool)
}

/**
 * @param {DiminishingPoolDataModel[]} pools
 * @return {Promise<DiminishingPoolDataModel[]>}
 */
async function save(pools) {
    return game.settings.set(MODULE, Settings.settings.dataStorage, pools);
}

async function configurePool(poolData, edit) {
    return await foundry.applications.api.DialogV2.input({
        window: {
            title: edit ? game.i18n.localize("DIMPOOLS.configurePool.title.edit") : game.i18n.localize("DIMPOOLS.configurePool.title.add"),
        },
        content: await foundry.applications.handlebars.renderTemplate(Templates.templates["diminishing-pools:configure-pool-dialog"], {
            pool: poolData,
            dieSizes: DIE_SIZES,
            edit: edit
        }),
        render: (ev, dialog) => {
            const dropThresholdInput = dialog.element.querySelector("[name=dropThreshold]");
            const dieSizeInput = dialog.element.querySelector("[name=dieSize]");

            dieSizeInput.addEventListener("change", e => {
                const selectedDieSize = Number(dieSizeInput.value.substring(1));
                const currentDropThreshold = Number(dropThresholdInput.value);
                if (currentDropThreshold >= selectedDieSize) {
                    dropThresholdInput.value = `${selectedDieSize - 1}`
                }
            })

            const form = dialog.element.querySelector("form");

            function handleFormValidity() {
                const formValid = form.checkValidity();
                form.querySelectorAll("button").forEach(button => {
                    button.disabled = !formValid;
                })
            }

            handleFormValidity()

            form.addEventListener("change", handleFormValidity)
        },
    });
}


async function add() {
    const poolData = DiminishingPoolDataModel.cleanData({});
    const newPool = await configurePool(poolData, false);

    if (newPool) {
        const pool = new DiminishingPoolDataModel(newPool);

        const pools = getAll();
        pools.push(pool);
        await save(pools);

        const messageData = {
            flavor: game.i18n.localize("DIMPOOLS.chat.created.flavor"),
            content: await foundry.applications.handlebars.renderTemplate(Templates.templates["diminishing-pools:pool-created-message"], {
                pool: pool,
                dieSizes: DIE_SIZES
            })
        };
        foundry.documents.ChatMessage.applyRollMode(messageData, pool.hidden ? "gmroll" : "publicroll")
        await foundry.documents.ChatMessage.create(messageData)
    }
}

/**
 * @param {number, string, DiminishingPoolDataModel} pool
 * @return {Promise<void>}
 */
async function remove(pool) {
    const allPools = getAll();
    pool = findPool(allPools, pool)

    if (pool) {
        allPools.splice(allPools.indexOf(pool), 1);
        await save(allPools);
    }
}

/**
 * @param {number, string, DiminishingPoolDataModel} pool
 * @return {Promise<DiminishingPoolDataModel, null>}
 */
async function configure(pool) {
    const pools = getAll();
    pool = findPool(pools, pool);

    if (!pool) {
        return null;
    }

    const updatedPool = await configurePool(pool, true);

    if (updatedPool) {
        pool.updateSource(updatedPool);
        await save(pools);
    }
}


/**
 * @param {number, string, DiminishingPoolDataModel} pool
 * @return {Promise<DiminishingPoolDataModel, null>}
 */
async function roll(pool) {
    const allPools = getAll();
    pool = findPool(allPools, pool);

    if (!pool || !game.user.isGM || pool.currentDice === 0) {
        return null;
    }

    const roll = await new foundry.dice.Roll(pool.poolFormula).roll();

    const newPoolSize = roll.result;
    const droppedDice = pool.currentDice - newPoolSize;

    pool.updateSource({currentDice: newPoolSize});

    if (newPoolSize > 0) {
        await foundry.documents.ChatMessage.create({
            flavor: game.i18n.localize("DIMPOOLS.chat.rolled.flavor"),
            content: await foundry.applications.handlebars.renderTemplate(Templates.templates["diminishing-pools:pool-rolled-message"], {
                pool: pool,
                droppedDice: droppedDice,
                roll: await roll.render()
            }),
            rolls: [roll],
        }, {
            rollMode: pool.hidden ? CONST.DICE_ROLL_MODES.PRIVATE : CONST.DICE_ROLL_MODES.PUBLIC,
        })
    } else {
        await foundry.documents.ChatMessage.create({
            flavor: game.i18n.localize("DIMPOOLS.chat.completed.flavor"),
            content: await foundry.applications.handlebars.renderTemplate(Templates.templates["diminishing-pools:pool-completed-message"], {
                pool: pool,
                droppedDice: droppedDice,
                roll: await roll.render()
            }),
            rolls: [roll],
        }, {
            rollMode: pool.hidden ? CONST.DICE_ROLL_MODES.PRIVATE : CONST.DICE_ROLL_MODES.PUBLIC,
        })

    }

    allPools.findSplice((p) => pool.id === p.id, pool);
    await save(allPools);

    return pool;
}

export const DiminishingPools = Object.freeze({
    get,
    getAll,
    add,
    remove,
    configure,
    roll
})