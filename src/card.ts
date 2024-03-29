import { CardShape } from "./shapes";

import Shapes from "./shapes";
import { CardMove, GetMove } from "./moves";

type CardProps = {
  value: number;
  shape: CardShape;
  move?: CardMove;
  image?: string;
  iNeed?: CardShape;
};

/**
 * Generate a new Card, which may be of any shape and value
 */
export class Card {
  value: number;
  shape: CardShape;
  move: CardMove;
  image?: string;
  iNeed?: CardShape;

  constructor(props: CardProps) {
    this.value = props.value;
    this.shape = props.shape;
    this.move = props.move || GetMove(props.value);
    this.image = props.image;
    this.iNeed = props.iNeed;
  }

  matches = (card: Card) => {
    return (
      card.shape === this.shape ||
      card.value === this.value ||
      (this.shape === Shapes.Whot && this.iNeed && this.iNeed === card.shape) ||
      card.shape === Shapes.Whot
    );
  };

  render = () => `${this.shape} (${this.value})`;

  reset = () => {
    this.iNeed = undefined;
  };

  get score() {
    if (this.shape === Shapes.Star) return this.value * 2;
    else return this.value;
  }
}
export default Card;

export const GetTriangle = (props: Omit<CardProps, "shape">) =>
  new Card({
    ...props,
    shape: Shapes.Triangle,
  });
export const GetCircle = (props: Omit<CardProps, "shape">) =>
  new Card({
    ...props,
    shape: Shapes.Circle,
  });
export const GetSquare = (props: Omit<CardProps, "shape">) =>
  new Card({
    ...props,
    shape: Shapes.Square,
  });
export const GetStar = (props: Omit<CardProps, "shape">) =>
  new Card({
    ...props,
    shape: Shapes.Star,
  });
export const GetCross = (props: Omit<CardProps, "shape">) =>
  new Card({
    ...props,
    shape: Shapes.Cross,
  });
export const GetWhot = (props: Omit<CardProps, "shape">) =>
  new Card({
    ...props,
    shape: Shapes.Whot,
  });
