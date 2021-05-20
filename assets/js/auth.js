// listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('guides').get().then(snapshot => {
      //setupGuides(snapshot.docs);
      setupUI(user);
    });
  } else {
    setupUI();
    //setupGuides([]);
  }
});

//signup
const signup_form = document.getElementById("signup-form");
signup_form.addEventListener('submit', (e) =>{
	e.preventDefault();
  
  // get user info
  const email = signup_form['signup-email'].value;
  const password = signup_form['signup-password'].value;

  // sign up the user
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    // close the signup modal & reset form
    db.collection('High scores').add({
    	highScore : 0,
    	userId : auth.currentUser.uid,
    	userName: "user-" + auth.currentUser.uid,
    });
    const modal = document.getElementById('modal-signup');
    modal.style.display = "none";
    signup_form.reset();
    signup_form.querySelector('.error').innerHTML = '';
  }).catch(err => {
  	signup_form.querySelector('.error').innerHTML = err.message;
  });
});

// logout
const logout = document.getElementById("logout-btn");
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// login
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.getElementById('modal-login');
    modal.style.display = "none";
    loginForm.reset();
    signup_form.querySelector('.error').innerHTML = '';
  }).catch(err => {
  	signup_form.querySelector('.error').innerHTML = err.message;
  });
});

const change_name_form = document.getElementById("change-username");
change_name_form.addEventListener('submit', (e) =>{
	e.preventDefault();
  
  // get user info
  const new_name = change_name_form['new-username'].value;
  if(new_name != '')
    db.collection('High scores').where('userId', '==', auth.currentUser.uid).get().then((snapshot) =>{
        snapshot.docs[0].ref.update({
        userName : new_name
    });
    });
	change_name_form.reset();
});