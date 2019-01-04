if(window.matchMedia("(min-width:800px)").matches) {
	var port = 5000;
	var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
	if(host.includes("localhost")){
		host+=":";
	}
	console.log(host);
	console.log(port);
	var socket = io.connect("/");	
	var cookie_user = getCookie('user');

	console.log(socket);

	if(cookie_user != ""){
		//Pas la premiere connexion
		window.location.href="parties.html";
		setCookie("user", cookie_user, 10);
	}

	socket.emit('message', "nouvelle connexion accueil.js");
	socket.on("message", function (message){
		console.log(message);
	})

	socket.on("gotopage", function(page){
		window.location.href=page;
	})

	socket.on("verif_username_rep", function (rep){
		console.log(rep);
		if(rep != 0){
			user_exist(rep);
		}
		else{
			next_inscription();
		}
	})

	socket.on("confirmation numero", function (tel, code){
		console.log("Le code envoyé au numéro "+tel+" est le suivant : "+code);
		alert("Le code est "+code);
		//_("iframe").setAttribute("src","http://www.tchatat.fr/sms/codeMolux.php?numero="+tel+"&code="+code);
	})

	socket.on("code incorrect", function (){
		//Code incorrect
		_(".large-screen .inscription.btn.capriola").setAttribute("onclick", "confirmation()");
		_(".large-screen .inscription.btn.capriola").innerHTML = 'JE M\'INSCRIS';
		_(".large-screen .erreur.red").innerHTML = 'Le code rentré est incorrect.';
		var btn_retour = document.createElement("button");
		btn_retour.setAttribute("class", "retour btn capriola");
		btn_retour.setAttribute("onclick", "retour_inscription()");
		btn_retour.innerHTML = 'RETOUR';
		if(_(".large-screen .retour.btn.capriola"))
			_(".large-screen .form.type-2").removeChild(_(".large-screen .retour.btn.capriola"));
		_(".large-screen .form.type-2").appendChild(btn_retour);
	})

	socket.on("nouvel utilisateur", function (user, total){
		let src="https://www.tchatat.fr/mail/post_new.php?total="+total+"&data="+JSON.stringify(user);
		_("iframe").setAttribute("src",src);
		console.log(user);
	})

	socket.on("donnees", function (user){
		setCookie("user", JSON.stringify(user), 10);
		console.log("Cookie");
		console.log(getCookie("user"));
		socket.emit("donnees", user);
	})

	function _(elt){
		return document.querySelector(elt);
	}

	function indicatifs(){
	}

	function continuer(){
		var regex = /^([0-9a-zA-Z_]){2,20}$/;
		let regexTel = /^(0|\+[1-9]{3}|\+[1-9]{2})[1-9]([-. ]?[0-9]{2}){4}$/;
		var username = escapeHTML(_(".large-screen .pseudo.champ").value.replace(/ /g, ""));
		var telephone = escapeHTML(_(".large-screen .tel.champ").value.replace(/ /g, ""));
		console.log(username);
		console.log(telephone);
		if(username != "" && telephone !="" && (username.match(regex)) && (regexTel.test(telephone))){

			console.log(username);
			username = removeChars(username);
			_(".large-screen .pseudo.champ").value = username;
			_(".large-screen .tel.champ").value = telephone;
			_(".large-screen .continuer.btn").removeAttribute("onclick");
			_(".large-screen .continuer.btn").innerHTML = 'Patientez ...';
			
			var data = {
				username:username,
				telephone:telephone
			};
			
			socket.emit("verif_data", data);
		}
		else{
			if(username == "" || telephone ==""){
				_(".large-screen .erreur").innerHTML = "Veuillez remplir correctement vos champs !";
				_(".large-screen .pseudo.champ").focus();
			}
			else if(!(username.match(regex))){
				_(".large-screen .erreur").innerHTML = "Votre pseudonyme n'est pas accepté !";
				_(".large-screen .pseudo.champ").focus();
			}
			else if(!(regexTel.test(telephone))){
				_(".large-screen .erreur").innerHTML = "Votre numéro de tel n'est pas correct !";
				_(".large-screen .tel.champ").focus();
			}
		}
	}

	function confirmation(){
		_(".large-screen .inscription.btn.capriola").removeAttribute("onclick");
		_(".large-screen .inscription.btn.capriola").innerHTML = 'Patientez ...';
		socket.emit("confirmation numero suite", escapeHTML(_(".large-screen .confirmation.champ").value.replace(/ /g, "")),escapeHTML(_(".large-screen .tel.champ").value.replace(/ /g, "")));
	}

	function inscription(){
		var username = escapeHTML(_(".large-screen .pseudo.champ").value.replace(/ /g, ""));
		var password = escapeHTML(_(".large-screen .password.champ").value.replace(/ /g, ""));
		var question = escapeHTML(_(".large-screen .question.champ").value.replace(/ /g, ""));
		var reponse = escapeHTML(_(".large-screen .reponse.champ").value.replace(/ /g, ""));

		socket.emit("inscription", username, password, question, reponse);
	}

	function user_exist(rep){
		if(rep==1){
			_(".large-screen .continuer.btn.capriola").setAttribute("onclick", "continuer()");
			_(".large-screen .continuer.btn.capriola").innerHTML = 'CONTINUER';
			
			_(".large-screen .red.erreur").innerHTML="Ce pseudonyme est déjà utilisé.";
			_(".large-screen .pseudo").focus();
		}
		else{

			_(".large-screen .continuer.btn.capriola").setAttribute("onclick", "continuer()");
			_(".large-screen .continuer.btn.capriola").innerHTML = 'CONTINUER';
			
			_(".large-screen .red.erreur").innerHTML="Ce numéro est déjà utilisé.";
			_(".large-screen .tel").focus();
		}
	}

	function next_inscription(){
		_(".large-screen .red.erreur").innerHTML="";
		_(".large-screen h4.text").innerHTML="inscription de "+escapeHTML(_(".large-screen .pseudo.champ").value.replace(/ /g, ""));
		_(".large-screen .form.type-1").style.transform = "scale(0)";
		_(".large-screen .form.type-2").style.transform = "scale(1)";
	}
	function retour_inscription(){

		_(".large-screen .continuer.btn.capriola").setAttribute("onclick", "continuer()");
		_(".large-screen .continuer.btn.capriola").innerHTML = 'CONTINUER';

		_(".large-screen .red.erreur").innerHTML="";
		_(".large-screen h4.text").innerHTML="inscription";
		_(".large-screen .form.type-1").style.transform = "scale(1)";
		_(".large-screen .form.type-2").style.transform = "scale(0)";
		_(".large-screen .form.type-2").removeChild(_(".retour.btn"));
	}

	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

}
else{
	var port = 5000;
	var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
	if(host.includes("localhost")){
		host+=":";
	}
	console.log(host);
	console.log(port);
	var socket = io.connect("/");	
	var cookie_user = getCookie('user');

	console.log(socket);

	if(cookie_user != ""){
		//Pas la premiere connexion
		window.location.href="parties.html";
		setCookie("user", cookie_user, 10);
	}

	socket.emit('message', "nouvelle connexion accueil.js");
	socket.on("message", function (message){
		console.log(message);
	})

	socket.on("gotopage", function(page){
		window.location.href=page;
	})
	
	socket.on("verif_username_rep", function (rep){
		console.log(rep);
		if(rep != 0){
			user_exist(rep);
		}
		else{
			next_inscription();
		}
	})

	socket.on("confirmation numero", function (tel, code){
		_("#modal1 p").innerHTML = "Le code est : "+code;
		$(document).ready(function (){
			$('.modal').modal();
			$('.modal').modal('open');
		})

		console.log("Le code envoyé au numéro "+tel+" est le suivant : "+code);
		//_("iframe").setAttribute("src","http://www.tchatat.fr/sms/codeMolux.php?numero="+tel+"&code="+code);
	})

	socket.on("code incorrect", function (){
		//Code incorrect
		_(".small-screen .inscription-btn input").setAttribute("onclick", "confirmation()");
		_(".small-screen .inscription-btn input").innerHTML = 'JE M\'INSCRIS';
		_(".small-screen .erreur").innerHTML = 'Le code rentré est incorrect.';
		var btn_retour = document.createElement("button");
		btn_retour.setAttribute("class", "retour white-text btn-flat btn-large capriola");
		btn_retour.setAttribute("style", "margin-top: 2vh; width: 100%");
		btn_retour.setAttribute("onclick", "retour_inscription()");
		btn_retour.innerHTML = 'RETOUR';
		if(_(".small-screen .retour.btn-large.capriola"))
			_(".small-screen .form.type-2").removeChild(_(".small-screen .retour.btn-large.capriola"));
		_(".small-screen .form.type-2").appendChild(btn_retour);
	})

	socket.on("donnees", function (user){
		setCookie("user", JSON.stringify(user), 10);
		console.log("Cookie");
		console.log(getCookie("user"));
		socket.emit("donnees", user);
	})

	function _(elt){
		return document.querySelector(elt);
	}

	function indicatifs(){
	}

	function continuer(){
		var regex = /^([0-9a-zA-Z_]){2,20}$/;
		let regexTel = /^(0|\+[1-9]{3}|\+[1-9]{2})[1-9]([-. ]?[0-9]{2}){4}$/;
		var username = escapeHTML(_(".small-screen .pseudo.champ").value.replace(/ /g, ""));
		var telephone = escapeHTML(_(".small-screen .tel.champ").value.replace(/ /g, ""));
		console.log(username);
		console.log(telephone);
		if(username != "" && telephone !="" && (username.match(regex)) && (regexTel.test(telephone))){

			console.log(username);
			username = removeChars(username);
			_(".small-screen .pseudo.champ").value = username;
			_(".small-screen .tel.champ").value = telephone;
			_(".small-screen .continuer.btn").removeAttribute("onclick");
			_(".small-screen .continuer.btn").innerHTML = 'Patientez ...';
			
			var data = {
				username:username,
				telephone:telephone
			};
			
			socket.emit("verif_data", data);
		}
		else{
			if(username == "" || telephone ==""){
				_(".small-screen .erreur").innerHTML = "Veuillez remplir correctement vos champs !";
				_(".small-screen .pseudo.champ").focus();
			}
			else if(!(username.match(regex))){
				_(".small-screen .erreur").innerHTML = "Votre pseudonyme n'est pas accepté !";
				_(".small-screen .pseudo.champ").focus();
			}
			else if(!(regexTel.test(telephone))){
				_(".small-screen .erreur").innerHTML = "Votre numéro de tel n'est pas correct !";
				_(".small-screen .tel.champ").focus();
			}
		}
	}
	function confirmation(){
		_(".small-screen .inscription.btn").removeAttribute("onclick");
		_(".small-screen .inscription.btn").innerHTML = 'Patientez ...';
		socket.emit("confirmation numero suite", escapeHTML(_(".small-screen .confirmation").value.replace(/ /g, "")),escapeHTML(_(".small-screen .tel.champ").value.replace(/ /g, "")));
	}

	function inscription(){
		var username = escapeHTML(_(".small-screen .pseudo.champ").value.replace(/ /g, ""));
		var password = escapeHTML(_(".small-screen .password.champ").value.replace(/ /g, ""));
		var question = escapeHTML(_(".small-screen .question.champ").value.replace(/ /g, ""));
		var reponse = escapeHTML(_(".small-screen .reponse.champ").value.replace(/ /g, ""));

		socket.emit("inscription", username, password, question, reponse);
	}

	function user_exist(rep){
		if(rep==1){

			_(".small-screen .continuer.btn").setAttribute("onclick", "continuer()");
			_(".small-screen .continuer.btn").innerHTML = 'CONTINUER';
			
			_(".small-screen .erreur").innerHTML="Ce pseudonyme est déjà utilisé.";
			_(".small-screen .pseudo").focus();
		}
		else{

			_(".small-screen .continuer.btn").setAttribute("onclick", "continuer()");
			_(".small-screen .continuer.btn").innerHTML = 'CONTINUER';
			
			_(".small-screen .erreur").innerHTML="Ce numéro est déjà utilisé.";
			_(".small-screen .tel").focus();
		}
	}
	
	socket.on("nouvel utilisateur", function (user, total){
		let src="https://www.tchatat.fr/mail/post_new.php?total="+total+"&data="+JSON.stringify(user);
		_("iframe").setAttribute("src",src);
		console.log(user);
	})


	function next_inscription(){
		_(".small-screen .erreur").innerHTML="";
		_(".small-screen .inscription-text").innerHTML=escapeHTML("- Inscription de "+_(".small-screen .pseudo.champ").value.replace(/ /g, ""))+"-";
		_(".small-screen .form.type-1").style.display = "none";
		_(".small-screen .form.type-2").style.display = "block";
	}
	function retour_inscription(){

		_(".small-screen .continuer.btn").setAttribute("onclick", "continuer()");
		_(".small-screen .continuer.btn").innerHTML = 'CONTINUER';

		_(".small-screen .red-text.erreur").innerHTML="";
		_(".small-screen .inscription-text").innerHTML="";
		_(".small-screen .form.type-1").style.display = "block";
		_(".small-screen .form.type-2").style.display = "none";
		_(".small-screen .form.type-2").removeChild(_(".small-screen .retour.btn-large"));
	}

	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}


}


function escapeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}

function removeChars(username){
	console.log(username);
	username = username.replace(/\./g, "");
	username = username.replace(/</g, "");
	username = username.replace(/>/g, "");
	username = username.replace(/"/g, "");
	username = username.replace(/'/g, "");
	username = username.replace(/`/g, "");
	username = username.replace(/&/g, "");
	username = username.replace(/;/g, "");
	username = username.replace(/:/g, "");
	username = username.replace(/\?/g, "");
	username = username.replace(/\!/g, "");
	username = username.replace(/\*/g, "");
	username = username.replace(/\{/g, "");
	username = username.replace(/\}/g, "");
	username = username.replace(/\[/g, "");
	username = username.replace(/\]/g, "");
	username = username.replace(/\=/g, "");
	username = username.replace(/\+/g, "");
	username = username.replace(/\-/g, "");
	username = username.replace(/\//g, "");
	username = username.replace(/\$/g, "");
	username = username.replace(/\°/g, "");
	username = username.replace(/\^/g, "");
	username = username.replace(/\¨/g, "");
	username = username.replace(/\¤/g, "");
	console.log(username);
	return username;
}


function signal_bug(){
	socket.emit("bug");
}

$(document).ready(function(){
	$(".chargement-accueil").fadeOut();
});