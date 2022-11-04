export type CardShape = "Circle" | "Triangle" | "Cross" | "Square" | "Star" | "Whot";

/**
 * shapes determine the type of a card
 */
export const Shapes: Record<CardShape, CardShape> = {
    Circle: 'Circle',
    Triangle: 'Triangle',
    Cross: 'Cross',
    Square: 'Square',
    Star: 'Star',
    Whot: 'Whot'
}

export const renderShape = (shape: CardShape) => {
    switch (shape) {
        case (Shapes.Circle): return 'c';
        case (Shapes.Cross): return '+';
        case (Shapes.Square): return 's';
        case (Shapes.Star): return '*';
        case (Shapes.Whot): return 'w';
        case (Shapes.Triangle): return 't';
        default: return shape;
    }
}

export default Shapes;