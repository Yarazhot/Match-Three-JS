"use strict";

const IMAGE_COUNT = 6;
const TIME_INTERVAL = 1000 / 60;
const TIME_OUT = 30;
const MX_DIMENSION = 8;
const COLOR_NUM = 5;
const GEM_SIZE = 23;
const PLAY_TIME = "01:00";

let IsProcessing = false;
let IsGame = false;
let IsBlowing = false;
let ReSwapping = false;
let IsFalling = false;
let IsSwapping = false;

let loaded_img_num = 0;
let time_out_buff = 0;
let blow_time = 0;
let cell_size = {};
let swap_gems = [{}, {}];
let gems = []; //Массив кристаллов
let vals = [];
let images = []; //Массив с картинками
let timer = null;

let score_label = document.getElementById('score');
let time_label = document.getElementById('timer');
let start_game_btn = document.getElementById('start-game-btn');
let end_game_btn = document.getElementById('cross');

end_game_btn.onclick = function() {
    if(IsGame){
        time_label.innerHTML = "00:00";
    }
}

start_game_btn.onclick = function() {
    if(!IsGame){
        score_label.innerHTML = 0;
        time_label.innerHTML = PLAY_TIME;
        startTimer();
        StartGameLoop();
        IsGame = true;
    }
}

let canvas = document.getElementById("canvas"); //Получение холста из DOM
let ctx = canvas.getContext("2d"); //Получение контекста — через него можно работать с холстом
canvas.addEventListener('mousedown', function (e) {
    let m_pos = {};
    m_pos.x = e.pageX - e.target.offsetLeft;
    m_pos.y = e.pageY - e.target.offsetTop;
    if (!IsProcessing)
    {
        let BeforeActive = {};
        BeforeActive.x = -1;
        for (let i = 0; i < gems.length; i++)
            for (let j = 0; j < gems[i].length; j++)
            {
                if (gems[i][j].is_active)
                {
                    BeforeActive.x = j;
                    BeforeActive.y = i;
                }
            }
        let gem_cell = {};
        gem_cell.x = Math.floor(m_pos.x / cell_size.x);
        gem_cell.y = Math.floor(m_pos.y / cell_size.y);
        gems[gem_cell.y][gem_cell.x].is_active = !(gems[gem_cell.y][gem_cell.x].is_active);
        if ((BeforeActive.x >= 0) && (gems[gem_cell.y][gem_cell.x].is_active))
            if (!((BeforeActive.x == gem_cell.x) && (Math.abs(BeforeActive.y - gem_cell.y) == 1)) &&
                !((BeforeActive.y == gem_cell.y) && (Math.abs(BeforeActive.x - gem_cell.x) == 1)))
                gems[BeforeActive.y][BeforeActive.x].is_active = false;
    }
});
//window.addEventListener("resize", Resize); //При изменении размеров окна будут меняться размеры холста

//Resize(); // При загрузке страницы задаётся размер холста

class Gem {
    constructor()
    {
        this.is_active = false;
        this.pos = {};
        this.pos.x = 0;
        this.pos.y = 0;
        this.type = 0;
        this.destruction_phase = 0;
    }
    //void Reactivate() { is_active = !is_active; }
};

Main();

function Main(){
    Init();
    //StartGameLoop();
}

function Init(){
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    LoadImages();
}

function StartGameLoop()
{
    IsProcessing = false;
    IsBlowing = false;
    ReSwapping = false;
    IsFalling = false;
    IsSwapping = false;
    CreateMx(vals, MX_DIMENSION, COLOR_NUM);
    let a = 0;
    while (Check(vals) && (a++ < 100))
    {
        NumFalling(vals);
        AddNums(vals, COLOR_NUM);
    }
    cell_size.x = (canvas.width) / MX_DIMENSION;
    cell_size.y = (canvas.height) / MX_DIMENSION;
    CreateGemMX(gems, vals, cell_size);
    if(loaded_img_num == IMAGE_COUNT){
        timer = setInterval(Update, TIME_INTERVAL);
    }else if (time_out_buff < TIME_OUT) {
        setTimeout(StartGameLoop, 30);
        time_out_buff++;
    }else{
        alert( 'Что-то пошло не так' );
    }
}

function EndGameLoop()
{
    IsGame = false;
    if(auth.currentUser){
        sendDocToCangeScoreFunc();
    }
    alert(`Time's up. Score: ` + score_label.innerHTML);
    clearInterval(timer); //Game stop
    timer = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
}

function startTimer() {
    
    var time = time_label.innerHTML;
    var arr = time.split(":");
    var m = arr[0];
    var s = arr[1];
    if (s == 0) {
        if (m == 0) {
            EndGameLoop();
            return;
        }
        m--;
        if (m < 10) m = "0" + m;
        s = 59;
    }
    else s--;
    if (s < 10) s = "0" + s;
    time_label.innerHTML = m+":"+s;
    setTimeout(startTimer, 1000);
  }

function ShowScore(){
    for (let i = 0; i < gems.length; i++) {
        for (let j = 0; j < gems[i].length; j++) {
            if (gems[i][j].type < 0) {
                score_label.innerHTML = +score_label.innerHTML + 1;
            }
        }
    }
}
 
function Update() //Обновление игры
{
    IsProcessing = IsSwapping;
    if (!IsProcessing)
    {
        IsSwapping = CheckActive(gems, swap_gems);
        if (IsSwapping)
            SwapGems(gems, swap_gems[0], swap_gems[1]);
        IsProcessing = IsSwapping;
    }
    if (IsSwapping)
    {
        IsSwapping = SwapGemsVis(gems, swap_gems[0], swap_gems[1], cell_size, TIME_INTERVAL / 2);
        if (!IsSwapping && !ReSwapping)
        {
            GemsToVals(vals, gems);
            IsSwapping = !Check(vals);
            ReSwapping = IsSwapping;
            if (IsSwapping)
                SwapGems(gems, swap_gems[0], swap_gems[1]);
            IsBlowing = !IsSwapping;
            if (IsBlowing)
            {
                ValsToGems(vals, gems);
                //TimeToBlow = TimeToBlow.Zero;
            }
        }
        if (!IsSwapping && ReSwapping)
            ReSwapping = false;
        IsProcessing = IsSwapping;
        //InvalidateRect(hwnd, NULL, FALSE);
    }
    if (IsBlowing)
    {
        blow_time += TIME_INTERVAL;
        if (blow_time > 20)
        {
            IsBlowing = BlowVis(gems);
            blow_time = 0;
        }
        if (!IsBlowing)
        {
            ShowScore();
            TPGems(gems, cell_size);
            GemsFalling(gems);
            AddGems(gems, COLOR_NUM);
            IsFalling = true;
        }
        IsProcessing = IsBlowing;
        //InvalidateRect(hwnd, NULL, FALSE);
    }
    if(IsFalling)
    {
        IsFalling = FallingVis(gems, cell_size, TIME_INTERVAL / 2);
        IsProcessing = IsFalling;
        //InvalidateRect(hwnd, NULL, FALSE);
        if (!IsProcessing)
        {
            GemsToVals(vals, gems);
            IsBlowing = Check(vals);
            ValsToGems(vals, gems);
            IsProcessing = IsBlowing;
        }
    }
    Draw();
}
 
function Draw() //Работа с графикой
{
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
    ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gems.length; i++) {
        for (let j = 0; j < gems.length; j++)
        ctx.drawImage(images[Math.abs(gems[i][j].type)], gems[i][j].destruction_phase * GEM_SIZE,
            0, GEM_SIZE, GEM_SIZE, gems[i][j].pos.x, gems[i][j].pos.y, cell_size.x, cell_size.y);
    }
}
 
function Resize()
{
    canvas.width = 500;
    canvas.height = 500;
    Update();
}

function LoadImages()
{
    for (let i = 0; i < IMAGE_COUNT; i++){
        images[i] = new Image();
        images[i].addEventListener("load", function() {loaded_img_num++;}, false);
    }
    images[0].src = "assets/images/Field.png";
    for (let i = 1; i < IMAGE_COUNT; i++){
        images[i].src = `assets/images/Gem_${i}.png`;
    }
}

function sendDocToCangeScoreFunc(){
    db.collection('High scores').where('userId', '==', auth.currentUser.uid).get().then((snapshot) =>{
        snapshot.docs.forEach(doc => {
            ChangeHighScore(doc);
        });
    });
}

function ChangeHighScore(doc){
    if(+doc.data().highScore < +score_label.innerHTML){
        doc.ref.update({
            highScore : +score_label.innerHTML
        });
    }
}


//--------------------------------------------------------------------------------------------------------------------
//GAME CLASSES--------------------------------------------------------------------------------------------------------





//END OF GAME CLASSES-------------------------------------------------------------------------------------------------
//LOGIK FOR INTEGER MATRIX--------------------------------------------------------------------------------------------



function GetRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум включается, минимум включается
}

function CreateMx(num_mx, N, color_num) {
    for (let i = 0; i < N; i++) {
        num_mx[i] = [];
        for (let j = 0; j < N; j++) {
            num_mx[i][j] = GetRandomInt(1, color_num);
        }
    }
}

function Swap(swap_mx, c1, c2)
{
    let buff = swap_mx[c1.y][c1.x];
    swap_mx[c1.y][c1.x] = swap_mx[c2.y][c2.x];
    swap_mx[c2.y][c2.x] = buff;
}

function Check(num_mx)
{
    let cur_cell = {};
    let gem_line = [];
    let founded = false;
    for (cur_cell.y = 0; cur_cell.y < num_mx.length; cur_cell.y++) {
        for (cur_cell.x = 0; cur_cell.x < num_mx[0].length; cur_cell.x++) {
            gem_line = CheckHor(num_mx, cur_cell);
            if (gem_line.length > 2)
            {
                DestroyGems(num_mx, gem_line);
                founded = true;
            }
            gem_line = CheckVert(num_mx, cur_cell);
            if (gem_line.length > 2)
            {
                DestroyGems(num_mx, gem_line);
                founded = true;
            }
        }
    }
    return founded;
}

function CheckHor(num_mx, cur_cell)
{
    let gem_line = [];
    gem_line.push(cur_cell);
    let buff_point = {};
    buff_point.y = cur_cell.y;
    for (let i = cur_cell.x + 1; i < num_mx[0].length; i++) {
        if (Math.abs(num_mx[cur_cell.y][cur_cell.x]) == Math.abs(num_mx[cur_cell.y][i]))
        {
            buff_point.x = i;
            gem_line.push(Object.assign({}, buff_point));
        }
        else {
            return gem_line;
        }
    }
    return gem_line;
}

function CheckVert(num_mx, cur_cell)
{
    let gem_line = [];
    gem_line.push(cur_cell);
    let buff_point = {};
    buff_point.x = cur_cell.x;
    for (let i = cur_cell.y + 1; i < num_mx.length; i++) {
        if (Math.abs(num_mx[cur_cell.y][cur_cell.x]) == Math.abs(num_mx[i][cur_cell.x]))
        {
            buff_point.y = i;
            gem_line.push(Object.assign({}, buff_point));
        }
        else {
            return gem_line;
        }
    }
    return gem_line;
}

function DestroyGems(num_mx, gem_line)
{
    for (let i = 0; i < gem_line.length; i++) {
        num_mx[gem_line[i].y][gem_line[i].x] = -1 * Math.abs(num_mx[gem_line[i].y][gem_line[i].x]);
    }
}

function NumFalling(num_mx)
{
    let buff;
    for (let j = 0; j < num_mx[0].length; j++) {
        let n = 0;
        for (let k = num_mx.length - 1; k > n; k--) {
            if (num_mx[k][j] < 0)
            {
                for (let i = k; i > 0; i--)
                {
                    buff = num_mx[i][j];
                    num_mx[i][j] = num_mx[i - 1][j];
                    num_mx[i - 1][j] = buff;
                }
                k++;
                n++;
            }
        }
    }
}

function AddNums(num_mx, gem_var_num)
{
    for (let i = 0; i < num_mx.length; i++) {
        for (let j = 0; j < num_mx[i].length; j++) {
            if (num_mx[i][j] < 0) {
                num_mx[i][j] = GetRandomInt(1, gem_var_num);
            }
        }
    }
}

/*function cloneMass(num_mx)
{
    new
    for(let key in num_mx){
        
    }
}*/

function CanMove(num_mx)
{
    let result = false;
    let LocMx = [];
    let c1 = {};
    let c2 = {};
    let i = 0;
    let j;
    while (!result && (i < num_mx.length))
    {
        j = 0;
        while (!result && (j < num_mx.length))
        {
            if (j < num_mx.length - 1)
            {
                LocMx = num_mx.slice();
                c1.y = i;
                c1.x = j;
                c2.y = i;
                c2.x = j + 1;
                Swap(LocMx, c1, c2);
                result = Check(LocMx);
            }
            if (!result && i < num_mx.length - 1)
            {
                LocMx = num_mx.slice();
                c1.y = i;
                c1.x = j;
                c2.y = (i + 1);
                c2.x = j;
                Swap(LocMx, c1, c2);
                result = Check(LocMx);
            }
            j++;
        }
        i++;
    }
    return(result);
}


//END OF LOGIK FOR INTEGER MATRIX-------------------------------------------------------------------------------------
//LOGIC FOR GEM MATRIX------------------------------------------------------------------------------------------------


/*function LoadBMPs(names)
{
    HBITMAPS result;
    result.resize(names.size());
    for (int i = 0; i < names.size(); i++)
        result[i] = (HBITMAP)LoadImageA(NULL, names[i].c_str(), IMAGE_BITMAP, 0, 0, LR_LOADFROMFILE);
    return result;
}*/


function CreateGemMX(gem_mx, vals, cell_size)
{
    for (let i = 0; i < vals.length; i++) {
        gem_mx[i] = []
        for (let j = 0; j < vals[i].length; j++) {
            gem_mx[i][j] = new Gem();
            gem_mx[i][j].type = vals[i][j];
            gem_mx[i][j].pos.x = cell_size.x * j;
            gem_mx[i][j].pos.y = cell_size.y * i;
        }
    }
}

function AddGems(Gems, color_num) 
{
    for (let i = 0; i < Gems.length; i++) {
        for (let j = 0; j < Gems[i].length; j++) {
            if (Gems[i][j].type < 0) {
                Gems[i][j].type = GetRandomInt(1, color_num);
            }
        }
    }
}

function FallingVis(Gems, cell_size, time)
{
    let result = false;
    for (let i = 0; i < Gems.length; i++){
        for (let j = 0; j < Gems[i].length; j++){
            if (Gems[i][j].pos.y < i * cell_size.y)
            {
                Gems[i][j].pos.y += time;
                result = true;
            }
        }
    }
    if (!result)
        for (let i = 0; i < Gems.length; i++){
            for (let j = 0; j < Gems[i].length; j++){
                Gems[i][j].pos.y = i * cell_size.y;
            }
        }
    return result;
}

function BlowVis(Gems)
{
    for (let i = 0; i < Gems.length; i++){
        for (let j = 0; j < Gems[i].length; j++){
            if (Gems[i][j].type < 0){
                if (Gems[i][j].destruction_phase < 8){
                    Gems[i][j].destruction_phase++;
                }
                else{
                    return false;
                }
            }
        }
    }
    return true;
}

function TPGems(Gems, cell_size)
{
    for (let j = 0; j < Gems[0].length; j++)
    {
        let counter = 0;
        for (let i = 0; i < Gems.length; i++)
            if (Gems[i][j].type < 0)
            {
                counter++;
                Gems[i][j].destruction_phase = 0;
                Gems[i][j].pos.y = -counter * cell_size.y;
            }
    }
}

function GemsFalling(Gems)
{
    for (let j = 0; j < Gems[0].length; j++){
        for (let k = 0; k < Gems.length; k++){
            for (let i = Gems.length - 1; i > k; i--){
                if (Gems[i][j].type < 0){
                    let buff = Gems[i][j];
                    Gems[i][j] = Gems[i - 1][j];
                    Gems[i - 1][j] = buff;
                }
            }
        }
    }
}

function CheckActive(Gems, SwapCells)
{
    SwapCells.length = 2;
    let k = 0;
    for (let i = 0; i < Gems.length; i++)
        for (let j = 0; j < Gems[i].length; j++)
            if (Gems[i][j].is_active)
            {
                SwapCells[k].x = j;
                SwapCells[k].y = i;
                k++;
            }
    //?k == 2;
    return (k == 2);
}

function SwapGems(SwapMx, c1, c2)
{
    let buff = SwapMx[c1.y][c1.x];
    SwapMx[c1.y][c1.x] = SwapMx[c2.y][c2.x];
    SwapMx[c2.y][c2.x] = buff;
    SwapMx[c1.y][c1.x].is_active = false;
    SwapMx[c2.y][c2.x].is_active = false;
}

function SwapGemsVis(gems, c1, c2, cell_size, time)
{
    let dir = {};
    dir.x = c2.x - c1.x;
    dir.y = c2.y - c1.y;
    gems[c1.y][c1.x].pos.x -= dir.x * time;
    gems[c1.y][c1.x].pos.y -= dir.y * time;
    gems[c2.y][c2.x].pos.x += dir.x * time;
    gems[c2.y][c2.x].pos.y += dir.y * time;
    if ((gems[c1.y][c1.x].pos.x < cell_size.x * c1.x) || (gems[c1.y][c1.x].pos.y < cell_size.y * c1.y))
    {
        gems[c1.y][c1.x].pos.x = cell_size.x * c1.x;
        gems[c1.y][c1.x].pos.y = cell_size.y * c1.y;
        gems[c2.y][c2.x].pos.x = cell_size.x * c2.x;
        gems[c2.y][c2.x].pos.y = cell_size.y * c2.y;
        return false;
    }
    return true;
}

function ValsToGems(Vals, Gems)
{
    for (let i = 0; i < Vals.length; i++)
        for (let j = 0; j < Vals[i].length; j++)
            Gems[i][j].type = Vals[i][j];
}

function GemsToVals(Vals, Gems)
{
    for (let i = 0; i < Vals.length; i++)
        for (let j = 0; j < Vals[i].length; j++)
            Vals[i][j] = Gems[i][j].type;
}


//END OF LOGIC FOR GEM MATRIX-------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
