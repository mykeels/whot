/**
 * moved determine the power a card holds
 */

const Moves = {
    PickTwo: 'PickTwo',
    PickThree: 'PickThree',
    GeneralMarket: 'GeneralMarket',
    HoldOn: 'HoldOn',
    Suspension: 'Suspension',
    None: 'None'
}

module.exports = Moves

/**
 * @param {Number} value
 */
const GetMove = (value) => {
    return value === 2 ? Moves.PickTwo :
            (value === 5 ? Moves.PickThree :
            (value === 14 ? Moves.GeneralMarket : 
            (value === 1 ? Moves.HoldOn : 
            (value === 8 ? Moves.Suspension: Moves.None))))
}

module.exports.GetMove = GetMove