import {DIE_SIZES} from "./constants.mjs";


/**
 * @property {string} id
 * @property {string} name
 * @property {boolean} hidden
 * @property {string} completionMessage
 * @property {"d4", "d6", "d8", "d10", "d12", "d20", "d100"} dieSize
 * @property {number} initialDice
 * @property {number} currentDice
 * @property {number} dropThreshold
 */
export class DiminishingPoolDataModel extends foundry.abstract.DataModel {

    static defineSchema() {
        const {StringField, BooleanField, NumberField} = foundry.data.fields;
        return {
            id: new StringField({
                nullable: false,
                blank: false,
                required: true,
                initial: () => foundry.utils.randomID()
            }),
            name: new StringField({nullable: false, blank: false, required: true}),
            hidden: new BooleanField({required: true}),
            completionMessage: new StringField({blank: true, required: true}),
            dieSize: new StringField({initial: "d6", choices: Object.keys(DIE_SIZES), blank: false, required: true}),
            initialDice: new NumberField({initial: 6, min: 1, max: 100, required: true}),
            currentDice: new NumberField({
                initial: (source) => source.initialDice ?? 6,
                min: 0,
                max: 100,
                required: true
            }),
            dropThreshold: new NumberField({
                initial: 3, min: 1, validate: (value, options) => {
                    const upperBound = Number(options.source.dieSize.substring(1));
                    return upperBound > value;
                },
                required: true
            })
        }
    }

    get maxDropThreshold() {
        return Number(this.dieSize.substring(1)) - 1;
    }

    get poolFormula() {
        return `${this.currentDice}${this.dieSize}cs>${this.dropThreshold}`;
    }

    get completed() {
        return this.currentDice === 0;
    }
}