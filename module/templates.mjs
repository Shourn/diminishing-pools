
const templates = {
    "diminishing-pools:pool-tracker-app": "modules/diminishing-pools/templates/pool-tracker-app.hbs",
    "diminishing-pools:configure-pool-dialog": "modules/diminishing-pools/templates/configure-pool-dialog.hbs",
    "diminishing-pools:pool-created-message": "modules/diminishing-pools/templates/pool-created-message.hbs",
    "diminishing-pools:pool-rolled-message": "modules/diminishing-pools/templates/pool-rolled-message.hbs",
    "diminishing-pools:pool-completed-message": "modules/diminishing-pools/templates/pool-completed-message.hbs",
}

function initialize() {
    foundry.applications.handlebars.loadTemplates(templates);
}


export const Templates = Object.freeze({
    initialize,
    templates
})