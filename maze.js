var DEFAULT_WIDTH = 20;
var DEFAULT_HEIGHT = DEFAULT_WIDTH;

var currentMaze;
var height;
var width;
var outNode = document.getElementsByClassName('out')[0];
var viewNode; //for view div (cell) of maze

var Cell = function( x, y ){
    this.x = x;
    this.y = y;
    this.variety = undefined; //уникальное множество
    this.background = 'white';
    this.flag = 0;
    this.borders = {
        left: false,
        top: false,
        right: false,
        bottom: false
    }
    //Создаем верхнюю и левую границу. ***Левая и верхняя граница больше не используется.***
    if (y == 0){
        this.borders.left = true;
    }
    if (x == 0){
        this.borders.top = true;
    }
};

var Maze = function( height, width ){
    this.maze = [];
    for ( var i = 0; i < height; i++ ) {
        var mazeLine = [];
        for (var j = 0; j < width; j++ ) {
            mazeLine.push( new Cell( i, j ) );
        }
        this.maze.push( mazeLine );
    }

    for ( i = 0; i < height; i++){
        for (j = 0; j < width; j++){
            if (this.maze[i][j].variety == undefined){
                for (var Number = 1; Number <= width; Number++) {
                    if (getCountOfVariety(this.maze[i], Number) == 0) {
                        this.maze[i][j].variety = Number;
                        break;
                    }
                }
            }
        }

        //Set random right border
        for ( j = 0; j < width - 1; j++) {
            if (this.maze[i][j + 1].variety != this.maze[i][j].variety) {
                if (Math.round(Math.random()) == 0) {
                    //нет границы, присваеваем следующей клетке множество от текущей
                    this.maze[i][j + 1].variety = this.maze[i][j].variety;
                }
                else {
                    this.maze[i][j].borders.right = true;
                }
            }
            else {
                this.maze[i][j].borders.right = true;
            }
        }

        //Set over right border of maze
        this.maze[i][width-1].borders.right = true;

        //Set bottom border
        var temp = undefined; //Временная переменная для сравнивания
        var countOfBlock = 0; //Счетчик нижних границ для одного множества
        for (j = 0; j < width; j++){
            if (temp != this.maze[i][j].variety){
                countOfBlock = 0; //Обнуление счетчика при переходе к новому множеству
                temp = this.maze[i][j].variety;
            }
            if (getCountOfVariety(this.maze[i], this.maze[i][j].variety) > 1 && countOfBlock + 1 < getCountOfVariety(this.maze[i], this.maze[i][j].variety)){
                if (Math.round(Math.random()) == 1){
                    countOfBlock += 1;
                    this.maze[i][j].borders.bottom = true;
                }
            }
        }

        //Copy and edit next line
        if ( i < height - 1){
            for (j = 0; j < width; j++){
                if (this.maze[i][j].borders.bottom == false){
                    this.maze[i+1][j].variety = this.maze[i][j].variety;
                }
            }
        }
    }

    //build last line
    for (j = 0; j < width - 1; j++){
        this.maze[height - 1][j].borders.bottom = true;
        //debugger;
        if (this.maze[height - 1][j].variety != this.maze[height - 1][j+1].variety){
            this.maze[height - 1][j+1].variety = this.maze[height - 1][j].variety;
            this.maze[height - 1][j].borders.right = false;
        }
    }
};

Maze.prototype.draw = function( node ){
    this.viewNode = node;
    for ( var i = 0; i < this.maze.length; i++ ) {
        var mazeLine = this.maze[ i ];
        for ( var j = 0; j < mazeLine.length; j++ ) {
            var div = document.createElement('div');
            generateDiv( div, this.maze[ i ][ j ]);
            if (this.maze[i][j].flag != 0){
                div.textContent = this.maze[ i ][ j ].flag;
            }
            this.viewNode.appendChild( div );
        }
    }

    function generateDiv( div, cell ) {
        div.classList.add('cellNode');
        div.style.width = DEFAULT_WIDTH + 'px';
        div.style.height = DEFAULT_HEIGHT + 'px';
        div.style.left = cell.y * DEFAULT_WIDTH + 'px';
        div.style.top = cell.x * DEFAULT_HEIGHT + 'px';
        div.style.boxSizing = "border-box";
        div.style.background = cell.background;

        var borders = cell.borders;
        if ( borders.left ) {
            div.style.borderLeft = "1px solid black";
        }
        if ( borders.top ) {
            div.style.borderTop = "1px solid black";
        }
        if ( borders.right ) {
            div.style.borderRight = "1px solid black";
        }
        if ( borders.bottom ) {
            div.style.borderBottom = "1px solid black";
        }
    }
};

var findSolution = function (maze, height, width) {
    console.log("findSolution", maze);
    var startCell = [0,0];
    var finishCell = [height-1, width-1];
    var price = 0;
    var path;

    maze[startCell[0]][startCell[1]].flag = 1;

    //Волновое заполнение лабиринта
    var timerWaveFilling  = setInterval(function() {
        price += 1;
        if (maze[finishCell[0]][finishCell[1]].flag == 0) {
            for (var i = 0; i < height; i++){
                for (var j = 0; j < width; j++){
                    if (maze[i][j].flag == price){
                        //bottom
                        if (maze[i][j].borders.bottom == false && maze[i+1][j].flag == 0){
                            maze[i+1][j].flag = price + 1;
                        }
                        //right
                        if (maze[i][j].borders.right == false && maze[i][j+1].flag == 0){
                            maze[i][j+1].flag = price + 1;
                        }
                        //top
                        if (i != 0 && maze[i-1][j].borders.bottom == false && maze[i-1][j].flag == 0){
                            maze[i-1][j].flag = price + 1;
                        }
                        //left
                        if (j != 0 && maze[i][j-1].borders.right == false && maze[i][j-1].flag == 0){
                            maze[i][j-1].flag = price + 1;
                        }
                    }
                }
            }
            outNode.textContent = "";
            currentMaze.draw(outNode);
        }
        else {
            clearInterval(timerWaveFilling);
            path = findPath(maze, startCell, finishCell);

            var timerShowPath  = setInterval(function() {
                if (path.length > 0) {
                    maze[path[path.length - 1][0]][path[path.length - 1][1]].background = "green";
                    path.length = path.length - 1;
                    outNode.textContent = "";
                    currentMaze.draw(outNode);
                }
                else { clearInterval(timerShowPath) }
            }, 500);
        }
    }, 500);
};

function findPath (maze, startCell, finishCell) {
    var i = finishCell[0];
    var j = finishCell[1];
    var path = [new Array(i,j)];
    var price = maze[i][j].flag - 1;

    while (path[path.length-1][0] != startCell[0] || path[path.length-1][1] != startCell[1]){
        //left
        if (j > 0 && maze[i][j-1].borders.right == false && maze[i][j-1].flag == price){
            j = j - 1;
            price = price - 1;
            path.push(new Array(i,j));
        }
        //top
        else if (i > 0 && maze[i-1][j].borders.bottom == false && maze[i-1][j].flag == price){
            i = i - 1;
            price = price - 1;
            path.push(new Array(i,j));
        }
        //right
        else if (maze[i][j].borders.right == false && maze[i][j+1].flag == price){
            j += 1;
            price = price - 1;
            path.push(new Array(i,j));
        }
        //down (первое условие возможно избыточное)
        else if (i != height - 1 && maze[i][j].borders.bottom == false && maze[i+1][j].flag == price){
            i += 1;
            price = price - 1;
            path.push(new Array(i,j));
        }
    }
    return path;
}


function getCountOfVariety(array, num) {
    var countOfVariety = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i].variety == num) {
            countOfVariety += 1;
        }
    }
    return countOfVariety;
}

function buildMaze() {
    outNode.textContent = "";
    height = parseInt(document.getElementsByClassName("height")[0].value, 10);
    width = parseInt(document.getElementsByClassName("width")[0].value, 10);
    currentMaze = new Maze(height, width);
    currentMaze.draw(outNode);
}

function solution() {
    console.log("solution", currentMaze);
    findSolution(currentMaze.maze, height, width);

}

var startButton = document.getElementsByClassName( "start-btn" )[ 0 ];
startButton.addEventListener( 'click', buildMaze );

var exit = document.getElementsByClassName("start-btn")[ 1 ];
exit.addEventListener('click', solution);