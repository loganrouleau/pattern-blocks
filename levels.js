const cos30 = 86.6;
const levels = {
  car: {
    outline: [
      [0, cos30],
      [100, cos30],
      [150, 0],
      [250, 2 * cos30],
      [450, 2 * cos30],
      [500, 3 * cos30],
      [400, 3 * cos30],
      [500, 5 * cos30],
      [400, 5 * cos30],
      [350, 4 * cos30],
      [250, 4 * cos30],
      [200, 5 * cos30],
      [100, 5 * cos30],
      [200, 3 * cos30],
      [100, 3 * cos30],
    ],
    requirements: [
      {
        shape: "triangle",
        points: [
          [0, cos30],
          [100, cos30],
          [50, 2 * cos30],
        ],
      },
      {
        shape: "triangle",
        points: [
          [100, cos30],
          [200, cos30],
          [150, 0],
        ],
      },
      {
        shape: "hexagon",
        points: [
          [50, 2 * cos30],
          [100, cos30],
          [200, cos30],
          [250, 2 * cos30],
          [200, 3 * cos30],
          [100, 3 * cos30],
        ],
      },
      {
        shape: "hexagon",
        points: [
          [200, 3 * cos30],
          [250, 2*cos30],
          [350, 2*cos30],
          [400, 3 * cos30],
          [350, 4 * cos30],
          [250, 4 * cos30],
        ],
      },
      {
        shape: "trapezoid",
        points: [
          [100, 5 * cos30],
          [200, 3*cos30],
          [250, 4*cos30],
          [200, 5 * cos30]
        ],
      },
      {
        shape: "trapezoid",
        points: [
          [350, 4*cos30],
          [400, 3*cos30],
          [500, 5*cos30],
          [400, 5 * cos30]
        ],
      },
      {
        shape: "parallelogram",
        points: [
          [350, 2*cos30],
          [450, 2*cos30],
          [500, 3*cos30],
          [400, 3 * cos30]
        ],
      },
    ],
  },
};
