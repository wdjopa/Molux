<html>
	<head>
		<meta charset="utf-8"/>
		<link rel="stylesheet" href=""/>
	</head>
	<body>
	
		<!-- <input type="text" id="mot"/>
		<button onclick="launch()">Recherche</button> -->
		<div class="resultats">

		</div>
		<script src="js/script.js"></script>
		<script src="dicosSansAccent.js"></script>
		<script>
			tri();
			function tri(){
				var dic = <?=strtoupper($_GET['lettre']);?>.split(",");
				var a = 0;
				document.querySelector(".resultats").innerHTML = "<?=strtoupper($_GET['lettre']);?> = '";
				for(i=0;i<dic.length;i++){
					// console.log(dic[i].length);
					if(dic[i].length<=7){
						if(a == 0){
							document.querySelector(".resultats").innerHTML +=dic[i];
						}
						else{
							document.querySelector(".resultats").innerHTML +=","+dic[i];
						}
						a++;
					}
				}
				document.querySelector(".resultats").innerHTML += "';";
			}

			var FINAL = "";
			//affichage(liste_def);			
			
			function launch(){
				var liste_def, MAX = new Array(), mot = document.getElementById('mot').value, MIN = 3;
				if(mot.length >= MIN){
					document.querySelector(".resultats").innerHTML = "Le(s) mot(s) le plus long pouvant être formé avec "+mot.toUpperCase()+ " est (sont) : ";
					liste_def = search_words(mot, MIN);
					MAX = plus_long_mots(liste_def);
					affichage(MAX);
					affichage(liste_def);
					tab = MAX;
					for(i=0;i<tab.length;i++){
						document.querySelector(".resultats").innerHTML += "<br>"+tab[i];
					}
					document.querySelector(".resultats").innerHTML += "<br>";
					tab = liste_def;
					for(i=0;i<tab.length;i++){
						document.querySelector(".resultats").innerHTML += "<br>"+tab[i];
					}
					
				}
				else{
					alert("Entrez un mot d'au moins "+MIN+" lettres");
				}
			}
			
			function search_words(word, MIN){
				var dico = new Array(), all = new Array(), a = 0, tous = new Array();
				word = word.toUpperCase();
				FINAL  += word+',';
				console.log(FINAL);
				for(var i=0;i<word.length;i++){				
					neww = ""; j = 0;
					while(j < word.length){
						if(j != i)
							neww += word[j];
						j++;
					}
					if(neww.length >= MIN){
						lettres(neww, neww.length, MIN);
					}
				}
				
				FINAL = FINAL.split(',');
				FINAL.pop();
				//FINAL = retirer_doublon(FINAL);
				console.log(FINAL);
				for(var i=0;i<FINAL.length;i++){
					all[a++] = anna(FINAL[i].split(''));
				}
				
				a = 0;
				
				for(var i=0;i<all.length;i++)
					for(var j=0;j<all[i].length;j++)
						tous[a++] = all[i][j];
				
				for(var i = 0;i<tous.length;i++){
					tous[i] = remove_comma(tous[i]);
				}
				tous = ranger(tous);
				for(var i = 0;i<tous.length;i++){
					switch(tous[i][0]){
						case "B":
							dico[i] = B.split(',');
							break;
						case "C":
							dico[i] = C.split(',');
							break;
						case "D":
							dico[i] = D.split(',');
							break;
						case "F":
							dico[i] = F.split(',');
							break;
						case "G":
							dico[i] = G.split(',');
							break;
						case "H":
							dico[i] = H.split(',');
							break;
						case "J":
							dico[i] = J.split(',');
							break;
						case "K":
							dico[i] = K.split(',');
							break;
						case "L":
							dico[i] = L.split(',');
							break;
						case "M":
							dico[i] = M.split(',');
							break;
						case "N":
							dico[i] = N.split(',');
							break;
						case "P":
							dico[i] = P.split(',');
							break;
						case "Q":
							dico[i] = Q.split(',');
							break;
						case "R":
							dico[i] = R.split(',');
							break;
						case "S":
							dico[i] = S.split(',');
							break;
						case "T":
							dico[i] = T.split(',');
							break;
						case "V":
							dico[i] = V.split(',');
							break;
						case "W":
							dico[i] = W.split(',');
							break;
						case "X":
							dico[i] = X.split(',');
							break;
						case "Y":
							dico[i] = Y.split(',');
							break;
						case "Z":
							dico[i] = Z.split(',');
							break;
						default:
							if(tous[i][0] == "A"||"À"||"Á"||"Â"||"Ã"||"Ä"||"Å")
								dico[i] = A.split(',');
							else if(tous[i][0] == "E"||"È"||"É"||"Ê"||"Ë")
								dico[i] = E.split(',');
							else if(tous[i][0] == "I"||"Ì"||"Í"||"Î"||"Ï")
								dico[i] = I.split(',');
							else if(tous[i][0] == "O"||"Ò"||"Ô"||"Ö"||"Õ"||"Ó")
								dico[i] = O.split(',');
							else if(tous[i][0] == "U"||"Ù"||"Ú"||"Û"||"Ü")
								dico[i] = U.split(',');
							break;
					}
					
				}		

				var def = new Array();a = 0;
				for(i=0;i<tous.length;i++){
					if(tous[i].length >= MIN){
						if(in_array(tous[i], dico[i])){
							def[a++] = tous[i];
						}
					}
				}
				// console.log(def);
				// def = retirer_doublon(def);
				// console.log(def);
				return def;
			}			
			function anna(liste_lettres){
				var c, m = liste_lettres.length, i = 0, annagrame = new Array(), a = 0, limite = facto(m);
				limite/=2;
				do{
					annagrame[a++] = liste_lettres;
					annagrame[a-1] = stringing(annagrame[a-1]); 
					if(liste_lettres.length != 1){
						inve = inv(liste_lettres);
						annagrame[a++] = inve;
					}
					c = liste_lettres[i%m];
					liste_lettres[i%m] = liste_lettres[(i+1) % m];
					liste_lettres[(i+1) % m] = c;
					i++;
				}while(i<limite);				
				return annagrame;
			}
			function lettres(chaine, nbre, min){
				var new_word = "";
				if(nbre >= min){
					FINAL += chaine+",";
					for(var i=0;i<chaine.length;i++){				
						new_word = ""; j = 0;
						while(j < chaine.length){
							if(j != i)
								new_word += chaine[j];
							j++;
						}
						lettres(new_word, new_word.length, min);
					}
				}
			}
		
		</script>
	</body>
</html>