/**
 * shapes determine the type of a card
 */

const Shapes = {
    Circle: 'Circle',
    Triangle: 'Triangle',
    Cross: 'Cross',
    Square: 'Square',
    Star: 'Star',
    Whot: 'Whot'
}

module.exports = Shapes

module.exports.renderShape = (shape) => {
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