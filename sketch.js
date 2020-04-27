function removeFromArray(arr, elm) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elm) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j); // --> Euclidean Distance
  // Manhatten Distance
  // var d = Math.sqrt(Math.pow(abs(a.i - b.i), 2) + Math.pow(abs(a.j - b.j), 2));
  // var d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

var cols = 50;
var rows = 50;
var grid = new Array(cols);

var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path = [];

function Spot(i, j) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbours = [];
  this.previous = undefined;
  this.wall = false;

  if (random(1) < 0.3) {
    this.wall = true;
  }

  this.show = function (colour) {
    //fill(colour);
    if (this.wall) {
      fill(0);
      stroke(0);
      ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
    }
    //rect(this.i * w, this.j * h, w, h);
  };

  this.addNeighbours = function (grid) {
    var i = this.i;
    var j = this.j;
    if (i < cols - 1) {
      this.neighbours.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbours.push(grid[i - 1][j]);
    }
    if (j < rows - 1) {
      this.neighbours.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbours.push(grid[i][j - 1]);
    }
    if (i > 0 && j > 0) {
      this.neighbours.push(grid[i - 1][j - 1]);
    }
    if (i < cols - 1 && j > 0) {
      this.neighbours.push(grid[i + 1][j - 1]);
    }
    if (i > 0 && j < rows - 1) {
      this.neighbours.push(grid[i - 1][j + 1]);
    }
    if (i < cols - 1 && j < rows - 1) {
      this.neighbours.push(grid[i + 1][j + 1]);
    }
  };
}

var cnv;
var x;
var y;

function centerCanvas() {
  x = (windowWidth - width) / 2;
  y = (windowHeight - height) / 2;
  cnv.position(x, y);
  button.position(x + width + 50, y + 10);
}

function windowResized() {
  centerCanvas();
}

function setup() {
  cnv = createCanvas(600, 600);
  button = createButton("click me");
  centerCanvas();
  console.log("A*");

  w = width / cols;
  h = height / rows;

  // Create the array
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  //Initialize Spots
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  //Adding Neighbours
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbours(grid);
    }
  }

  // SET START AND END
  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;

  openSet.push(start);

  console.log(grid);
}

function draw() {
  if (openSet.length > 0) {
    // Keep Going
    var lowestIndex = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    var current = openSet[lowestIndex];

    if (current == end) {
      noLoop();
      console.log("DONE!");
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    var neighbours = current.neighbours;
    for (var i = 0; i < neighbours.length; i++) {
      var neighbour = neighbours[i];

      if (!closedSet.includes(neighbour) && !neighbour.wall) {
        var tempG = current.g + 1;

        var newPath = false;
        if (openSet.includes(neighbour)) {
          if (tempG < neighbour.g) {
            neighbour.g = tempG;
            newPath = true;
          }
        } else {
          neighbour.g = tempG;
          newPath = true;
          openSet.push(neighbour);
        }

        // Heuristic Calculation
        if (newPath) {
          neighbour.h = heuristic(neighbour, end);
          neighbour.f = neighbour.g + neighbour.h;
          neighbour.previous = current;
        }
      }
    }
  } else {
    //No Solution
    console.log("No Solution");
    noLoop();
    return;
  }

  background(255);

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show(color(255));
    }
  }

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0));
  }

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0));
  }

  // Find the path
  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }

  for (var i = 0; i < path.length; i++) {
    //path[i].show(color(0, 0, 255));
  }

  noFill();
  stroke(0, 0, 255);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    curveVertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}
