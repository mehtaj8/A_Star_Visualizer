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
var runCond = false;
var diagCond = false;

function Spot(i, j) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbours = [];
  this.previous = undefined;
  this.wall = false;
  this.start = false;
  this.end = false;

  if (random(1) < 0.3) {
    this.wall = true;
  }

  this.show = function () {
    //fill(colour);
    if (this.wall) {
      fill(0);
      noStroke(0);
      ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
    }
    if (this.start) {
      fill(0, 255, 0);
      noStroke(0);
      ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
    }

    if (this.end) {
      fill(255, 0, 0);
      noStroke();
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
    if (diagCond) {
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
  offset = 30;
  button.position(x + width + 40, y + 120 + offset);
  select("#inputStartx").position(x + width + 40, y + 10 + offset);
  select("#inputStarty").position(x + width + 150, y + 10 + offset);
  select("#inputEndx").position(x + width + 40, y + 80 + offset);
  select("#inputEndy").position(x + width + 150, y + 80 + offset);
  select("#toggle").position(x + width + 40, y + 200 + offset);
  select("#start").position(x + width + 40, y);
  select("#end").position(x + width + 40, y + 50 + offset);
  select("#diag").position(x + width + 120, y + 205 + offset);
}

function windowResized() {
  centerCanvas();
}

function diag() {
  diagCond = !diagCond;
  console.log(diagCond);
}

function run() {
  // SET START AND END
  if (select("#inputStartx").value() == undefined) {
  }
  start = grid[select("#inputStartx").value()][select("#inputStarty").value()];
  end = grid[select("#inputEndx").value()][select("#inputEndy").value()];
  start.wall = false;
  end.wall = false;
  start.start = true;
  end.end = true;
  openSet.push(start);
  runCond = !runCond;
}

function setup() {
  cnv = createCanvas(700, 700);
  button = createButton("Play Animation");
  button.mousePressed(run);
  select("#inputStartx").style("width", "70px");
  select("#inputStartx").style("height", "23px");
  select("#inputStarty").style("width", "70px");
  select("#inputStarty").style("height", "23px");
  select("#inputEndx").style("width", "70px");
  select("#inputEndx").style("height", "23px");
  select("#inputEndy").style("width", "70px");
  select("#inputEndy").style("height", "23px");
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

  console.log(grid);
}

function draw() {
  background(255);

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show(color(255));
    }
  }
  if (runCond) {
    //Adding Neighbours
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        grid[i][j].addNeighbours(grid);
      }
    }

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

    for (var i = 0; i < closedSet.length; i++) {
      closedSet[i].show(color(255, 0, 0));
    }

    for (var i = 0; i < openSet.length; i++) {
      openSet[i].show(color(0, 255, 0));
    }

    frameRate(25);
    // Find the path
    path = [];
    var temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }
  }
  //Line Creation
  noFill();
  stroke(0, 0, 255);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    curveVertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}
