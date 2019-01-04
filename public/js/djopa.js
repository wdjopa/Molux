/*Vérifie si un élément ('elt') est dans un tableau ('tab')*/
function in_array(elt, tab){
    var a = 0;
    for(i=0;i<tab.length;i++)
        if(elt == tab[i])
            a = 1;
	return a;
}
/*Retire un élément ('elt') de tableau ('tab')*/
function remove(elt, table){
	if(elt instanceof Array){
		var n = position(elt, table);
	    for(i=n;i<table.length-1;i++){				
			table[i] = table[i+1];
		}
		table.pop();
	}
	else{
		delete table[elt];
	}
}
/*Donne la position d'un élément ('elt') dans un tableau('tab')*/
function position(elt, tab){
    var a = -1;
    for(i=0;i<tab.length;i++)
        if(elt == tab[i])
            a = i;
    return a;
}
/*Génère un nombre aléatoire dans l'interval [min, max]*/
function random(min, max){
	if(max <= min)
		return min;
	else
		return ((parseInt( Math.random() * 1000 ) + min) % (max - min +1) )+ min;
}
/*Convertit un chaine en minuscules, puis transforme sa première lettre en majuscule*/
function ucfirst(chaine){
	var chaine2 = "";
	chaine = chaine.toLowerCase();
	chaine2 = chaine[0].toUpperCase();
	for(var i=1;i<chaine.length;i++)
		chaine2+=chaine[i];
	return chaine2;
}
/*remplace 'ch1' par 'ch2' dasn un tableau ('tab')*/
function replace(ch1, ch2, tab){
	var tab2 = "";
	for(var i=0;i<tab.length;i++){
		if(tab[i] == ch1)
			tab2 += ch2;
		else
		tab2+=tab[i];
	}
	return tab2;
}
/*Mélange les éléments d'un tableau*/
function shuffle(proposition){
	var shuffled=[proposition.length];
	shuffled[0]=proposition[random(0,proposition.length-1)];
	for(var i=1;i<proposition.length;i++){
		do{
			var n=random(0,proposition.length-1);
			var inside=0;
			for(var j=0;j<i;j++){
				if(in_array(proposition[n],shuffled))
					inside=1;
			}
		}while(inside!=0);
		shuffled[i]=proposition[n];
	}
	return shuffled;
}
/*Dans un systemes de plusieurs pages, elle sert a aller vers une page précise en y prenant le nom de la page en paramètre*/
function go_section(pos){
	var sections = document.querySelectorAll(".section");
	for(var i=0;i<sections.length;i++){
		sections[i].style.width="0";
	}
	document.querySelector(".section."+pos).style.width = "100%";
}
/*Génère un tableau de 'num' valeurs a partir d'un tableau de 'tab'*/
function former(tab, num){
	var arr ="", arr2 = [];
	if(tab.length > num){
		if(num<tab.length){
			for(i=0;i<num;i++){
				do{
					do{
						a = random(0, tab.length);
					}while(in_array(tab[a], arr2) || (a<0 || a>tab.length));
				}while(tab[a] == null);
				arr2[i] = tab[a];
			}
		}
		else{
			for(i=0;i<tab.length;i++){
				arr2[i] = tab[a];
			}
		}
	}
	else{
		arr2 = tab;
	}

	for(i=0;i<num;i++){
		if(i < num - 1)
			arr+=arr2[i]+", ";
		else
			arr+=arr2[i];
	}
		return arr;
}
/*Génère un élément aléatoire dans le tableau*/
function randElt(table){
    return table[random(0, table.length-1)];
}
/*Vérifie que 2 chaines sont égales*/
function egal(chaine1, chaine2){    
    var l1 = chaine1.length, l2 = chaine2.length;
    if(l1 == l2)
    {
        var a = 0;
        for(i=0;i<l1;i++){
            if(chaine1[i] == chaine2[i])
                a++;
        }
        if(a == l1)
        {
            return 1;   
        }
        else
        {
            return 0;    
        }
    }
    else
    {
        return 0;
    }
        
}
/*RANGE UN TABLEAU DANS L'ORDRE CROISSANT OU L'ORDRE DECROISSANT*/
function rangement(tab, type){
	var c;
	if(type != "DESC"){
		for(var i=0;i<tab.length;i++){
			for(var j=0;j<tab.length;j++){
				if(tab[i] > tab[j]){
					c = tab[i];
					tab[i] = tab[j];
					tab[j] = c;
				}
			}
		}
	}	
	else{
		for(var i=0;i<tab.length;i++){
			for(var j=0;j<tab.length;j++){
				if(tab[i] > tab[j]){
					c = tab[i];
					tab[i] = tab[j];
					tab[j] = c;
				}
			}
		}
	}
	return tab;
}