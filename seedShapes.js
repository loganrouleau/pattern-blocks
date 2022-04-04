const cos30 = 100 * Math.cos(Math.PI / 6);
const seedShapes = {
  triangle: {
    colour: "green",
    points: [
      [50, 0],
      [100, cos30],
      [0, cos30],
    ],
    offset: [120, 290],
  },
  square: {
    colour: "orange",
    points: [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ],
    offset: [20, 140],
  },
  hexagon: {
    colour: "yellow",
    points: [
      [50, 0],
      [150, 0],
      [200, cos30],
      [150, 2 * cos30],
      [50, 2 * cos30],
      [0, cos30],
    ],
    offset: [10, 10],
  },
  trapezoid: {
    colour: "red",
    points: [
      [50, 0],
      [150, 0],
      [200, cos30],
      [0, cos30],
    ],
    offset: [10, 200],
  },
  parallelogram: {
    colour: "blue",
    points: [
      [50, 0],
      [150, 0],
      [100, cos30],
      [0, cos30],
    ],
    offset: [10, 290],
  },
  rhombus: {
    colour: "tan",
    points: [
      [0, 0],
      [100, 0],
      [100 + cos30, 50],
      [cos30, 50],
    ],
    offset: [10, 400],
  },
};
