//actions à effectuer au chargement de la page 
window.onload = function() 
{
    //pour appliquer les paramètres css avant la génération du tableau
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "css/listeMots.css";
    document.head.appendChild(link);

    //on stocke la valeur de l'utilisateur en cours
    var utilisateur = "";
    utilisateur = getParameterByName('username');

    /*  si aucun utilisateur n'est pas présent dans la barre d'url, alors on le rédirige vers la page de connexion, ou si l'utilisateur n'existe pas
        alors on le redirige vers la page d'accueil pour se reconnecter */
    if(utilisateur == "" || utilisateur == false)
    {
        alert("Problème sur votre identifiant. " + "\n" +"Veuillez vous reconnecter")
        document.location.href = "index.html";
    }
    else
    {
        document.getElementById("utilisateurConnecte").innerHTML += utilisateur;
        document.title += "Mots de " + utilisateur;
    }

    getNbMots(utilisateur);

    //on supprime la valeur de l'utilisateur pour éviter une modification directe dans l'url
    //history.replaceState({}, null, "listeMots.html");

    //permet d'empêcher le rechargement de la page 
    var form = document.getElementById("formPrincipal");
        function handleForm(event) 
        { 
            event.preventDefault(); 
        } 

    form.addEventListener('submit', handleForm);
}

//permet de générer un tableau contenant les mots
function genererTableauDeMots(mots)
{
    //pour chaque ligne, on crée une nouvelle ligne dans le tableau
    for (i = 0; i< mots.MOTS.length; i++)
    {    
        //on attribut les valeurs du mot dans d'autre variables pour plus tard
        var tag = mots.MOTS[i].TAGMOT;
        var lemme = mots.MOTS[i].LEMMEMOT;
        var correction = mots.MOTS[i].CORRECTIONMOT;
        var postTraitement = mots.MOTS[i].POSTTRAITE;
        var commentaire = mots.MOTS[i].COMMENTAIRE;

        //si les valeurs du mot en cours sont celles par défaut, on les définit à "" pour éviter certains problèmes liées à la saisie par la suite
        if(tag == "&nbsp;")
        {
            tag = "";
        }
        if(lemme == "&nbsp;")
        {
            lemme = "";
        }
        if(correction == "&nbsp;")
        {
            correction = "";
        }
        if(postTraitement == "&nbsp;")
        {
            postTraitement = "";
        }
        if(commentaire == "&nbsp;")
        {
            commentaire = "";
        }   

        //on crée une ligne de tableau qui contient les valeurs récupérées du dessus
        var ligne = document.createElement('tr'); 
        ligne.setAttribute('id', 'row-'+i);
        ligne.innerHTML = `<td><input id=\"champMOT\" type=\"text\" value=\"${mots.MOTS[i].MOT}\" disabled=\"disabled\"></td>
        <td><input id=\"champTAG\" type=\"text\" value=\"${tag}\" title=\"Séparateurs possibles : / , - espace\"></td>

        <td><input id=\"champLEMME\" type=\"text\" value=\"${lemme}\"></td>
        <td><input id=\"champCORRECTION\" type=\"text\" pattern=\"[a-z]+\" title=\"Uniquement des lettres en minuscules\" value=\"${correction}\"></td>
        <td><input id=\"champPOSTTRAITE\" type=\"text\" title=\"Non obligatoire\" value=\"${postTraitement}\"></td>
        <td><input id=\"champNER\" type=\"text\" value=\"Champ non-existant"\"></td>
        <td><input id=\"champCOMMENTAIRE\" type=\"text\"  title=\"Non obligatoire\" value=\"${commentaire}\"></td>
        <td><button type=\"button\" id=\"bouton${mots.MOTS[i].IDMOT}\" onclick=\"requestContexte(${mots.MOTS[i].IDMOT})\">Afficher</button></td>        
        <td><input id=\"champIDMOT\" type=\"text\" value=\"${mots.MOTS[i].IDMOT}\" hidden=\"true\"></td>`;

        //on insère le la ligne en tant que dernier enfant du tableau
        document.getElementById("tableauMots").appendChild(ligne);    
    }

    //permet la création d'une popup vide qui accueillera le contexte du mot
    createPopUpContexte();
}
//permet la creation des éléments nécessaires pour la popup
function createPopUpContexte()
{
    //permet l'ajout d'une fenêtre popup vide qui contiendra les contextes du mot en cours
    var contextePopUp = document.createElement('div');
    contextePopUp.setAttribute("id", "myModal");
    contextePopUp.setAttribute("class", "modal");
    contextePopUp.innerHTML = `<div class="modal-content"><span class="close">&times;</span><section></section></div>`;
    document.getElementById("divPrincipal").appendChild(contextePopUp);

    //on définit le script de la popup contexte ici pour qu'il soit exécuté après la génération du tableau
    var script = document.createElement('script');
    script.src = "js/scriptPopUp.js";
    script.async = false;
    document.head.appendChild(script); 
}

//permet l'envoi de la fonction depuis généreTableau
//à chaque nouvel id de mot, on envoie une requête différente au serveur
function requestContexte(idMotEnCours)
{
    //commande pour récupérer le contexte depuis le serveur
    command="customgetcontexte";
    p1="";
    p2=idMotEnCours;
    p3="";

    getDatafromZenidoc("", command, p1, p2, p3);
}

//est appelé directement depuis getDataFromZenidoc
function setContexte(contexte)
{
    //var paragraphe = document.getElementById("contexte-contenu").innerHTML;
    var paragraphe = document.getElementsByTagName("section")[0];
    //on remet à zéro le contenu de la fenêtre
    paragraphe.innerHTML = "";

    //selon si le mot possède un contexte ou pas, on affiche le message correspondant
    if(contexte.CONTEXTES.length == 0)
    {
        paragraphe.innerHTML = "Aucun contexte pour ce mot n'est actuellement disponible"
    }

    //sinon si le mot contient au moins un contexte
    else if (!contexte.CONTEXTES.length == 0)
    {
        //pour chaque ligne du contexte du même mot, on affiche une ligne supplémentaire
        for (i = 0; i< contexte.CONTEXTES.length; i++)
        {
            //console.log("on rentre dans la boucle for de setContexte")
            paragraphe.innerHTML = paragraphe.innerHTML + `<p>${contexte.CONTEXTES[i].CONTEXTE}</p>`;
        }
    }

    //permet l'affichage de la popup
    var modal = document.getElementById("myModal");
    modal.style.display = "block";

}

//permettre la vérification des lignes qui ont été remplies
//la valeur envoiDirect représente par quel bouton l'utilisateur accède à la fonction
//permet ainsi de savoir s'il s'agit d'une demande d'envoi des informations ou d'une simple vérification
function verificationLigne(envoiDirect)
{
    //on passe sur toutes les lignes du tableau
    //si un élément est rempli, on récupère de le num de la ligne 

    //contient les lignes d'erreur de toutes les lignes du tableau
    var lignesErreurs = "";
    var nbAVerif = document.getElementsByTagName("span")[0].innerHTML;

    for(var numLigneEnCours = 0; numLigneEnCours<nbAVerif; numLigneEnCours++)
    {
        //on défini les éléments de verification
        const mot = document.getElementById("row-"+numLigneEnCours).children[0].children[0].value;//le mot
        const tag = document.getElementById("row-"+numLigneEnCours).children[1].children[0].value;//le tag
        const lemme = document.getElementById("row-"+numLigneEnCours).children[2].children[0].value;//lemme
        const postTraitement = document.getElementById("row-"+numLigneEnCours).children[4].children[0].value;//post traitement pas obligatoire
        const correction = document.getElementById("row-"+numLigneEnCours).children[3].children[0].value;//la correction

        var compteurDeLigne = numLigneEnCours+1;
        var debutLigneErreur = "Mot " + mot + " à la ligne " + compteurDeLigne + ": ";
        var ligneErreur = "";//contient la ligne d'erreur pour la ligne en cours

        //on ne vérifie uniquement si une valeur a été saisie sur la ligne sinon on passe à la ligne suivante 
        if ((!correction == "") || (!tag == "" && !lemme == ""))
        {
            //si la correction est vide ou égale à la valeur par défaut 
            if (correction == "" && !tag == "" && !lemme == "")
            {
                //console.log("OK, la correction n'est pas renseigné au champ n° " + compteurDeLigne);

                //on vérifie que le tag soit bien valide
                var validiteTag = checkTag(tag);

                if(!validiteTag)
                {
                    ligneErreur = debutLigneErreur + "Veuillez vérifier votre saisie de Tag" +"\n";
                }                           
            }
                
            //si les trois autres champs sont vides
            else if (!correction == "" && tag == "" && lemme == "" && postTraitement == "")
            {
                //console.log("OK, seulement correction est renseigné au champ n° " + compteurDeLigne);

                //vérifie la validité des champs correction
                var validiteCorrection = checkCorrection(correction);

                if(!validiteCorrection)
                {
                    ligneErreur = debutLigneErreur + "Veuillez vérifier votre saisie de correction" +"\n";
                }
            }

            //dans tous les autres cas
            else 
            {
                ligneErreur = debutLigneErreur + "Les champs tag/lemme/post-traitement et correction ne peuvent pas être remplis simultanément" +"\n";
            }
        }

        //dans le cas ou un seul des champs tag ou lemme ou post traitement est rempli et que la correction est vide
        else if((!tag == "" || !lemme == "" || !postTraitement == "") && correction == "" )
        {
            //si seulement le post traitement est rempli
            if (!postTraitement == "" && tag == "" && lemme == "")
            {
                ligneErreur = debutLigneErreur + "Veuillez saisir un tag et un lemme pour continuer" +"\n";
            }

            //si le tag est vide
            else if (tag == "")
            {
                ligneErreur = debutLigneErreur + "Veuillez saisir un tag pour continuer" +"\n";
            }

            //si le lemme est vide
            else
            {
                ligneErreur = debutLigneErreur + "Veuillez saisir un lemme pour continuer" +"\n";
            }
        }

        //si une erreur a été trouvée sur la ligne actuelle
        if(!ligneErreur == "")
        {
            //défini la ligne en cours en rouge si la saisie n'est pas correcte
            document.getElementById("row-"+numLigneEnCours).style.backgroundColor = "red";

            //on ajoute la ligne d'erreur de la ligne en cours au total des lignes
            lignesErreurs = lignesErreurs + ligneErreur;
        }
        
        //si aucune erreur n'a été trouvée sur la ligne actuelle
        else if(ligneErreur == "")
        {
            //on attribue à la ligne une couleur normale au cas ou une vérification avait déjà été effectuée
            document.getElementById("row-"+numLigneEnCours).style.backgroundColor = "white";
        }
    }

    //si aucune erreur n'a été enregistrée, on n'affiche rien
    if (lignesErreurs == "")
    {
            alert("Aucune erreur n'a été relevée sur les lignes complètement saisies"); 

            //si l'utilisateur a demandé un envoi direct des données depuis le bouton envoyer
            if(envoiDirect)
            {
                envoiData();   
            }  
  
    }
    //on affiche les erreurs trouvées et on change la couleur des lignes concernées également
    else if (!lignesErreurs == "")
    {
        alert(lignesErreurs);
    }
}

//permet de vérifier la validité de la correction
function checkCorrection(correctionSaisie)
{
    const patternCorrection = "[a-z]+";
    const regex = new RegExp("\\b"+correctionSaisie+"\\b");
    const found = patternCorrection.match(regex);

    //si aucun match n'a été fait, alors la correction saisie n'est pas bonne
    if(found == null)
    {
        return false;
    }

    //sinon la correction est bonne
    else
    {
        return true;
    }
}

//permet de vérifier la saisie du tag
function checkTag(tagSaisi)
{
    //on split pour que meme si on utilise des delimiteurs differents ce soit au meme format, on obtient alors un tableau
    var tagArray = tagSaisi.split('-').join(',').split('/').join(',').split(' ').join(',').split(',');
    //console.log(tagArray);

    const tags = "ADV|ADVNE|ADVPAS|AINDFP|AINDFS|AINDMP|AINDMS|AFP|AFS|AMP|AMS|CHIF|COCO|COSUB|DETFP|DETFS|DETMP|DETMS|DINTFP|DINTFS|DINTMP"+
        "|DINTMS|MOTINC|NFP|NFS|NMP|NMS|PDEMFP|PDEMFS|PDEMMP|PDEMMS|PINDFP|PINDFS|PINDMP|PINDMS|PINTFP|PINTFS|PINTMP|PPER1P|PPER1S|PPER2P|"+
        "PPER2S|PPER3FP|PPER3FS|PPER3MP|PPER3MS|PPOBJFP|PPOBJFS|PPOBJMP|PPOBJMS|PREFFS|PREFMP|PREFMS|PRELFP|PRELFS|PRELMP|PRELMS|PREP|PREPADE|"+
        "PREPAU|PREPAUX|PREPDES|PREPDU|V1P|V1S|V2P|V2S|V3P|V3S|VA1P|VA1S|VA2P|VA2S|VA3P|VA3S|VAINF|VE1P|VE1S|VE2P|VE2S|VE3P|VE3S|VEINF|"+
        "VINF|VPPFP|VPPFS|VPPMP|VPPMS|VPPRE|XFAM|XPAYFP|XPAYFS|XPAYMP|XPAYMS|XPREF|XPREM|XSOC|XVILLE";

    //permet de savoir si une des valeurs du tableau a retourne un null suite a la verification ou pas
    var compteur = 0;

    //cette boucle permet de parcourir le tableau contenant l'ensemble des tags saisis par l'utilisateur
    for(var j = 0; j < tagArray.length; j++)
    {
        //ceci represente la valeur du tableau correpondant a l'indice actuel du tableau
        const check = tagArray[j];
        //on definit une nouvelle expression reguliere qui contient la valeur du tableau correpondant a l'indice actuel du tableau
        const regex = new RegExp("\\b"+check+"\\b");

        //on verifie que la valeur du tableau matche avec l'expression régulière
        const found = tags.match(regex);
        //console.log(found);

        //si la valeur ne matche pas, alors on rajoute 1 au compteur 
        if(found == null)
        {
            //console.log("PAS BON.");
            //on ajoute +1 au compteur pour faire en sorte que plus tard, si compteur est different de 0, saisie du tag est pas bonne
            compteur++;
        }

        else if (found != null)
        {
            //console.log("OK.")
        }
    }
    //un fois sorti de la boucle for, valeur du compteur egale a 0, signifie que la saisie de l'utilisateur est bonne 
    if(compteur == 0)
    {
        //console.log("COMPTEUR OK.");
        return true;
    }
    //si elle est differente de 0, alors la saisie de l'utilisateur n'est pas bonne
    else
    {
        //console.log("COMPTEUR PAS OK.")
        return false;
    }
    
}

function triTagsAvantEnvoi(tagATrier)
{
    //on convertit en tableau les tags saisis
    var tagArray = tagATrier.split('-').join(',').split('/').join(',').split(' ').join(',').split(',');
    var nouveauTagTrie = "";

    //si il n'y a qu'un seul élément dans le tableau, alors on renvoi la valeur de base du tag
    if(tagArray.length == 1)
    {
        return tagATrier;
    }

    //sinon on trie la valeur et on la retourne
    else if (tagArray.length > 1)
    {
        tagArray.sort();
        nouveauTagTrie = tagArray.toString();
        return nouveauTagTrie;
    }
}

//permet l'envoi des données sur le serveur
function envoiData()
{    
    //on récupère le nb de mots à traiter
    var nbMots = document.getElementsByTagName("h1")[0].getElementsByTagName("span")[0].innerHTML;

    if(!confirm("Êtes-vous sûr de vouloir enregistrer votre travail? "+"\n"
        +"Vous serez automatiquement déconnecté."))
    {
        console.log("Annulation de l'envoi");        
    }

    //on envoit le contenu du formulaire et on renvoit l'utilisateur à la page d'accueil (login)
    else
    {
        //la longueur du tableau 
        for(i = 0; i< nbMots; i++)
        {
            //l'id du mot
            var idMot = document.getElementById("row-"+i).children[8].children[0].value;
            //le tag
            var tag = document.getElementById("row-"+i).children[1].children[0].value;
            //lemme
            var lemme = document.getElementById("row-"+i).children[2].children[0].value;
            //la correction
            var correction = document.getElementById("row-"+i).children[3].children[0].value;
            //le commentaire
            var commentaire = document.getElementById("row-"+i).children[6].children[0].value;
            //post traitement 
            var postTraitement = document.getElementById("row-"+i).children[4].children[0].value;

            //si la valeur tag est remplie, on trie sa valeur par ordre alphabétique. Sinon il garde sa valeur de base
            if(tag != "")
            {
                tag = triTagsAvantEnvoi(tag); 
            }
            
            var recapitulatifForm = tag + ";" + lemme + ";" + correction + ";" + commentaire + ";" + postTraitement;
            //console.log(recapitulatifForm);

            //commande pour l'envoi des données sur le serveur
            command="customvalidationcorrection";
            p1="";
            p2=idMot;
            p3=recapitulatifForm;

            getDatafromZenidoc("", command, p1, p2, p3);
        }
        
        document.location.href = "index.html";
    }
}

//permet de récupérer la valeur d'un paramètre de l'url donné
function getParameterByName(name) 
{
    //on détermine automatquement l'url actuel en fonction de la page
    const url = window.location.href;

    //on vérifie que le paramètre username est bien présent dans l'url, sinon on bloque l'accès au site
    const valeurVerificationDebut = "?";
    const valeurVerificationFin = "=";
    const valeurVerificationUser = "username";

    if(url.includes(valeurVerificationDebut) && url.includes(valeurVerificationFin) && url.includes(valeurVerificationUser))
    {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);

        if (!results)
        {
            return null;
        }

        if (!results[2]) 
        {
            return '';
        }

        //console.log(decodeURIComponent(results[2].replace(/\+/g, ' ')));
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    else
    {
        return false;
    }
}

//permet la récupération du nombre de mots
function getNbMots(utilisateur)
{
    command="customVERIFLISTE";
    p1="";
    p2=utilisateur;
    p3="";

    getDatafromZenidoc("", command, p1, p2, p3);
}

//permet d'allouer les mots à l'utilisateur ou pas en fonction du nombre de mots qui lui ont déjà été alloués
function allocationDeMots(nbMots) 
{
    if (nbMots == 0)
    {
        console.log("Allocation en cours")
        command="customAttributionListe";
        p1="";
        p2=getParameterByName('username');
        p3="";
        getDatafromZenidoc("", command, p1, p2, p3);
    }

    else 
    {
        console.log("Pas besoin d'allocation, on génère tableau");
        command="customListeMots";
        p1="";
        p2=getParameterByName('username');
        p3="";
        getDatafromZenidoc("", command, p1, p2, p3);
    }
}

//permet la récupération ou l'envoi de données depuis le serveur
function getDatafromZenidoc(
    portal = "",
    command,//correspond au point d'entrée dans la fonction
    p1 = "",
    p2,
    p3) {
    portal = "";//contient normalement l'adresse ip du portail qui a été cachée pour la version publique du github
    const url = portal + "/portail.iz?DoCommand?logon=&command=" + command + "&p1=" + p1 + "&p2=" + p2 + "&p3=" + p3;
    //console.log(url);
    fetch(url, {
        method: "GET",
    //si il ya deux then c'est pour la récursivité
    }).then(response => {
        return response.text();
    }).then(function (data) {
        var body = data

        if (body.toString().startsWith("{")) {
            result = body.replace('},\n\n]}', '}]}');
            result = JSON.parse(result)
            //console.log(result);

            //on vérifie par quelle fonction on est rentré dans la fonction getDataFromZenidoc
            if (command == "customVERIFLISTE" || command == "customAttributionListe")
            {
                //on affiche le nb de mots à l'utilisateur
                document.getElementsByTagName("h1")[0].getElementsByTagName("span")[0].innerHTML = result.QUANTITEMOT;
                allocationDeMots(result.QUANTITEMOT);//si l'on doit allouer des mots ou pas
            }

            else if (command == "customListeMots")
            {
                genererTableauDeMots(result);
                //permet d'accéder globalement à la liste des mots
            }

            else if (command == "customgetcontexte")
            {
                //on définit le contexte
                setContexte(result);
            }
        } else {
            var getFullURl = RegExp(
                '(?<=var target=").*?(?=";)',
            );
            var getP1 = RegExp(
                '(?<=&p1=).*?(?=&p2)',
            );
            p1 = body.match(getFullURl).toString();
            p1 = body.match(getP1).toString() ?? "";
            return getDatafromZenidoc(
                portal, command, p1, p2, p3);
        }
    }).catch(err => {
        console.log(err);
    })
}