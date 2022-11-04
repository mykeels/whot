export type CardMove =
  | "PickTwo"
  | "PickThree"
  | "GeneralMarket"
  | "HoldOn"
  | "Suspension"
  | "None";

/**
 * A Move determines the power a card holds
 */
export const Moves: Record<CardMove, CardMove> = {
  PickTwo: "PickTwo",
  PickThree: "PickThree",
  GeneralMarket: "GeneralMarket",
  HoldOn: "HoldOn",
  Suspension: "Suspension",
  None: "None",
};

export default Moves;

export const GetMove = (value: number): CardMove => {
  return value === 2
    ? Moves.PickTwo
    : value === 5
    ? Moves.PickThree
    : value === 14
    ? Moves.GeneralMarket
    : value === 1
    ? Moves.HoldOn
    : value === 8
    ? Moves.Suspension
    : Moves.None;
};
