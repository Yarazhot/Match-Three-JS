let modal_singup = document.getElementById('modal-signup');
let modal_login = document.getElementById('modal-login');
let modal_account = document.getElementById('modal-account');

let signup_btn = document.getElementById("signup-btn");
let login_btn = document.getElementById("login-btn");
let account_btn = document.getElementById("account-btn");

let span = document.getElementsByClassName("close")[0];


login_btn.onclick = function() {
    modal_login.style.display = "block";
}

account_btn.onclick = function() {
    modal_account.style.display = "block";
}

signup_btn.onclick = function() {
    modal_singup.style.display = "block";
}

window.onclick = function(event) {
    if (event.target == modal_singup || event.target == modal_login || event.target == modal_account) {
    	signup_form.reset();
    	loginForm.reset();
    	change_name_form.reset();
        modal_singup.style.display = "none";
        modal_login.style.display = "none";
        modal_account.style.display = "none";
    }
}


const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');

function setupAccountInfo(doc){
	const html = `
      <div>Logged in as ${auth.currentUser.email}</div>
      <div>Username: ${doc.data().userName}</div>
      <div>High score: ${doc.data().highScore}</div>
    `;
    accountDetails.innerHTML = html;
}

const setupUI = (user) => {
  if (user) {
  	let userData = {};
  	db.collection('High scores').where('userId', '==', auth.currentUser.uid).onSnapshot((snapshot) =>{
        	setupAccountInfo(snapshot.docs[0]);
  	});
  	//userData.highScore = db.collection('High scores').where('userId', '==', auth.currentUser.uid).get().docs.data().highScore;
    // toggle user UI elements
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {
    // toggle user elements
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};

db.collection('High scores').orderBy('highScore').onSnapshot((snapshot) =>{
	 /*snapshot.docs.forEach(doc => {
         FillTable(doc);
     });*/
     CleanTable();
	let i = snapshot.docs.length;
	for(let doc in snapshot.docs){
		FillTable(snapshot.docs[doc], i--);
	}
});

const scoreTable = document.getElementById('score-table');

function CleanTable(){
	for(let i = scoreTable.rows.length - 1; i>0; i--){
		scoreTable.deleteRow(i);
	}
}

function FillTable(doc, i){
	tr = scoreTable.insertRow(1);
	let td_place = document.createElement('td');
	let td_userName = document.createElement('td');
	let td_highScore = document.createElement('td');
	td_place.textContent = i;
	td_userName.textContent = doc.data().userName;
	td_highScore.textContent = doc.data().highScore;
	tr.appendChild(td_place);
	tr.appendChild(td_userName);
	tr.appendChild(td_highScore);
	tr = scoreTable.insertRow(1);
}

/*span.onclick = function() {
    modal.style.display = "none";
}*/