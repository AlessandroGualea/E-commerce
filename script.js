const toggle = document.getElementById("toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => nav.classList.toggle("active"));
function scrollToTop() {
  window.scrollTo(0, 0);
}

const toggles = document.querySelectorAll(".faq-toggle");

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.parentNode.classList.toggle("active");
  });
});

const progressCircle = document.querySelector(".autoplay-progress svg");
const progressContent = document.querySelector(".autoplay-progress span");
var swiper = new Swiper(".mySwiper", {
  spaceBetween: 10,
  centeredSlides: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  on: {
    autoplayTimeLeft(s, time, progress) {
      progressCircle.style.setProperty("--progress", 1 - progress);
      progressContent.textContent = `${Math.ceil(time / 1000)}s`;
    }
  }
});






function getOnlinePaymentUrl(){
	return "https://billingonline-int.post.ch/OnlinePayment/Web/v1/"+getBOIntegration()+"/ShowCase";
}
// Online Payment
function loadOverlayPaymentMask(maskType) {
	var settings = {};
	settings.logoUrl = "";
	settings.shopColor = "#FFCC00";
	var amount = document.getElementById("shopping-card-total").innerText;
  var lang = window.localStorage.getItem("language");
	var integration = getBOIntegration();
	
	var usecase;
	switch (maskType) {
		case "AddCard":
			usecase = "UC7R";
			break;
		case "Payment":
			if (document.getElementById("radioLoggedIn").checked) {
				usecase = "UC2";
			} else {
				usecase = "UC1";
			}
			break;
		default:
			usecase = "UC2";
			break;
	}

	var paymentUrl = getOnlinePaymentUrl() + "?amount=" + amount + "&lang=" + lang + "&usecase=" + usecase;
	
	var overlayPayment = OnlinePayment("SHOP-PS", paymentUrl, settings);
	overlayPayment.payInOverlay().then(function (response) {
		window.paymentResponse = response;
		console.log('Promise resolved');
		console.log('result: ' + response.result);
		console.log('data: ' + response.data);
		console.log('errorCode: ' + response.errorCode);
		console.log('errorMessage: ' + response.errorMessage);
		console.log('FullResult: ' + JSON.stringify(response));
		window.setTimeout(function () { }, 100);

		if (usecase == "UC7R") {
			window.localStorage.setItem("usecase", "addCard");
		}
		if (response.errorCode == 0) {
			window.localStorage.setItem("paymentStatus", "succeded");
			window.localStorage.setItem("activePage", "paymentResponse");
		} else if (response.errorCode == 12) {
			window.localStorage.setItem("activePage", "showcase");
		} else {
			window.localStorage.setItem("paymentStatus", "failed");
			window.localStorage.setItem("activePage", "paymentResponse");
		}
		initializePage();
	}).catch(function (err) {
		console.log('Promise rejected: ' + JSON.stringify(err));
	});
}

// Online Shop Simulator
var appLanguage, languages;
window.localStorage.setItem("activePage", "showcase");
setBOIntegration()
startApplication();

function setBOIntegration() {
	var url = window.location.search;
	if (url.startsWith("?")) {
		window.localStorage.setItem("ShowCase", window.location.search.substr(10, 3).toUpperCase());
	}
}

function getBOIntegration() {
	var showcase = window.localStorage.getItem("ShowCase");
	switch (showcase) {
		case "BOI":
			return "BOI";
		case "BOE":
			return "BOE";
		default:
			return "BOE";
	}
}

function startApplication() {
	buildMainContent();
	initializePage();
}

function initializePage() {
	if (window.localStorage.getItem("successMessage") === "read") {
		window.localStorage.removeItem("paymentStatus");
		window.localStorage.removeItem("successMessage");
		window.localStorage.removeItem("usecase");
	}
	initializeContent();
	defineLanguageText();
	initializeLanguage();
	if (window.localStorage.getItem("activePage") === 'showcase') {
		updatePrices();
	}
}

function initializeContent() {
	var payment = window.localStorage.getItem("paymentStatus");
	if (typeof payment !== 'undefined' && payment !== null) {
		getSuccessMessage();
    document.getElementById("main-content-instruction").style.display = "none";
    document.getElementById("main-content-static").style.display = "none";
		window.localStorage.setItem("successMessage", "read");
	}
}

function userTypeChanged(isAnonym){
  var el = document.getElementById("addCardBtn");
  if(isAnonym){
    addCardBtn.style.display = "none";
  }else{
     addCardBtn.style.display = "inline";
  }
}

function initializeLanguage() {
	appLanguage = window.localStorage.getItem("language");
	if (typeof appLanguage === 'undefined' || appLanguage === null) {
		var navigatorLanguage = navigator.language;
		if (navigatorLanguage.indexOf("de") !== -1) {
			appLanguage = "de";
		} else if (navigatorLanguage.indexOf("fr") !== -1) {
			appLanguage = "fr";
		} else if (navigatorLanguage.indexOf("it") !== -1) {
			appLanguage = "it";
		} else {
			appLanguage = "en";
		}
	}
	window.localStorage.setItem("language", appLanguage);
	updateLanguage(appLanguage);
}

function updateCounter(idCounter, idCost, idTotal, increment) {
	var counter = document.getElementById(idCounter);
	var amount = 0;
	if (!isNaN(counter.value) && counter.value >= 0) {
		amount = Number(counter.value) + increment;
		if (amount < 0) {
			amount = 0;
		}
	} else {
		amount = 0;
	}
	counter.value = amount;
	costPerPiece = Number(document.getElementById(idCost).innerText);
	document.getElementById(idTotal).innerText = (amount * costPerPiece).toFixed(2);
	updatePrices();
}

function updatePrices() {
	var subtotal = 0;
	var products = document.getElementsByClassName("productCost");
	Array.prototype.forEach.call(products, function (el) {
		var costString = el.innerHTML;
		cost = Number(costString);
		subtotal += cost;
	});
	subtotal = subtotal.toFixed(2);
	document.getElementById("shopping-card-subtotal").innerHTML = subtotal;
	document.getElementById("shopping-card-total").innerHTML = subtotal;
}

function updateLanguage(newLanguage) {
	appLanguage = newLanguage;
	window.localStorage.setItem("language", appLanguage);
	document.getElementById("de").className = "";
	document.getElementById("fr").className = "";
	document.getElementById("it").className = "";
	document.getElementById("en").className = "";
	document.getElementById(appLanguage).className = "language-active";
	var langObj = languages[appLanguage];

	document.getElementById("nav-instructions").innerHTML = langObj.navInstructions;
	var page = window.localStorage.getItem("activePage");
	switch (page) {
		case "showcase":
			document.getElementById("shopping-card-title").innerHTML = langObj.shoppingCardTitle;
			document.getElementById("shopping-card-info").innerHTML = langObj.shoppingCardInfo;
			document.getElementById("header-product").innerHTML = langObj.headerProduct;
			document.getElementById("header-amount").innerHTML = langObj.headerAmount;
			document.getElementById("header-unitPrice").innerHTML = langObj.headerUnitPrice;
			document.getElementById("header-total").innerHTML = langObj.headerTotal;
			document.getElementById("product1-title").innerHTML = langObj.product1Title;
			document.getElementById("product1-productNr").innerHTML = langObj.product1ProductNr;
			document.getElementById("product1-stock").innerHTML = langObj.product1Stock;
			document.getElementById("product2-title").innerHTML = langObj.product2Title;
			document.getElementById("product2-productNr").innerHTML = langObj.product2ProductNr;
			document.getElementById("product2-stock").innerHTML = langObj.product2Stock;
			document.getElementById("product3-title").innerHTML = langObj.product3Title;
			document.getElementById("product3-productNr").innerHTML = langObj.product3ProductNr;
			document.getElementById("product3-stock").innerHTML = langObj.product3Stock;
			document.getElementById("summary-title").innerHTML = langObj.summaryTitle;
			document.getElementById("summary-subtotal").innerHTML = langObj.summarySubtotal;
			document.getElementById("summary-delivery").innerHTML = langObj.summaryDelivery;
			document.getElementById("summary-delivery-free").innerHTML = langObj.summaryDeliveryFree;
			document.getElementById("summary-total").innerHTML = langObj.summaryTotal;
			document.getElementById("radioLoggedInText").innerHTML = " " + langObj.radioLoggedIn + "<br>";
			document.getElementById("radioAnonymText").innerHTML = " " + langObj.radioAnonym;
			document.getElementById("addCardBtn").innerHTML = langObj.addCardBtn;
			document.getElementById("submitBtn").innerHTML = langObj.submitBtn;
			break;
		case "instructions":
			document.getElementById("instructions-title").innerHTML = langObj.instructionsTitle;
			document.getElementById("instructions-introduction").innerHTML = langObj.instructionsIntroduction;
			document.getElementById("instructions-showcase-text").innerHTML = langObj.instructionsShowcaseText;
			document.getElementById("instructions-showcase-note-title").innerHTML = "<br>" + langObj.instructionsNoteTitle;
			document.getElementById("instructions-showcase-note").innerHTML = langObj.instructionsShowcaseNote;
			document.getElementById("instructions-library-title").innerHTML = langObj.instructionsLibraryTitle;
			document.getElementById("instructions-library-text1").innerHTML = langObj.instructionsLibraryText1;
			document.getElementById("instructions-library-text2").innerHTML = langObj.instructionsLibraryText2;
			document.getElementById("instructions-library-text3").innerHTML = langObj.instructionsLibraryText3;
			document.getElementById("instructions-library-parameters").innerHTML = langObj.instructionsLibraryParameters;
			document.getElementById("instructions-library-parameters-logoUrl").innerHTML = langObj.instructionsLibraryLogoUrl;
			document.getElementById("instructions-library-parameters-shopColor").innerHTML = langObj.instructionsLibraryShopcolor;
			document.getElementById("instructions-library-parameters-amount").innerHTML = langObj.instructionsLibraryAmount;
			document.getElementById("instructions-library-parameters-lang").innerHTML = langObj.instructionsLibraryLang;
			document.getElementById("instructions-library-parameters-usecase").innerHTML = langObj.instructionsLibraryUsecase;
			document.getElementById("instructions-library-parameters-usecase-uc1").innerHTML = langObj.instructionsLibraryUsecaseUC1;
			document.getElementById("instructions-library-parameters-usecase-uc2").innerHTML = langObj.instructionsLibraryUsecaseUC2;
			document.getElementById("instructions-library-parameters-usecase-uc7r").innerHTML = langObj.instructionsLibraryUsecaseUC7R;
			document.getElementById("instructions-billingOnline-title").innerHTML = langObj.instructionsBillingOnline;
			document.getElementById("instructions-billingOnline-text").innerHTML = langObj.instructionsBillingOnlineText;
			document.getElementById("instructions-library-parameters-returnUrl").innerHTML = langObj.instructionsLibraryReturnUrl;
			break;
		case "paymentResponse":
			var title = document.getElementById("response-title");
			var message = document.getElementById("response-message");
			var succeded = window.localStorage.getItem("paymentStatus") === "succeded";
			var link = "<a href='#' role='button' class='responseLink' onclick='startApplication()'>" + langObj.linkText + "</a>.";
			if (window.localStorage.getItem("usecase") === "addCard") {
				if (succeded) {
					title.innerHTML = langObj.successTitleAddCard;
					message.innerHTML = langObj.successMessageAddCard + link;
				} else {
					title.innerHTML = langObj.failTitleAddCard;
					message.innerHTML = langObj.failMessageAddCard + link;
				}
			} else {
				if (succeded) {
					title.innerHTML = langObj.successTitle;
					message.innerHTML = langObj.successMessage + link;
				} else {
					title.innerHTML = langObj.failTitle;
					message.innerHTML = langObj.failMessage + link;
				}
			}
			break;
	}
}

function removeContent() {
	var content = document.getElementById("main-content");
	while (content.firstChild) {
		content.removeChild(content.firstChild);
	}
	var mainTitle = document.createElement("h1");
	mainTitle.innerHTML = "Payment ShowCase";
	content.appendChild(mainTitle);
	return content;
}

function getSuccessMessage() {
	window.localStorage.setItem("activePage", "paymentResponse");
	var content = removeContent();
	var div = document.createElement("div");
	div.setAttribute("class", "shopping-card-items");
	div.style.marginBottom = '300px';
	var title = document.createElement("h2");
	title.setAttribute("id", "response-title");
	title.style.color = "forestgreen";
	var message = document.createElement("p");
	message.setAttribute("id", "response-message");
	if (window.localStorage.getItem("paymentStatus") === 'failed') {
		title.style.color = 'red';
	}
	div.appendChild(title);
	div.appendChild(message);
	content.appendChild(div);
}

function getInstructionsPage() {
	window.localStorage.setItem("activePage", "instructions");
	window.localStorage.removeItem("paymentStatus");
	var content = removeContent();
  document.getElementById("main-content-instruction").style.display = "inline";
  document.getElementById("main-content-static").style.display = "none";
	
	initializePage();
}

function buildMainContent() {
    document.getElementById("main-content-instruction").style.display = "none";
      document.getElementById("main-content-static").style.display = "inline";
	window.localStorage.setItem("activePage", "showcase");
	var content = removeContent();
  document.getElementById('item1').src = resourcesFromOtherPen.item1;
  document.getElementById('item2').src = resourcesFromOtherPen.item2;
  document.getElementById('item3').src = resourcesFromOtherPen.item3;
  document.getElementById('headerLogo').src = resourcesFromOtherPen.headerLogo;
  var codeBlock2 = document.getElementById("code-block-2");
codeBlock2.innerHTML = codeBlock2.innerHTML.replace(/#BoIntegration/g,getBOIntegration());
}

function defineLanguageText() {
	var de = {
		"shoppingCardTitle": "Warenkorb",
		"shoppingCardInfo": "Produkte, die sich im Warenkorb befinden, sind nicht reserviert.",
		"headerProduct": "Produkt",
		"headerAmount": "Anzahl",
		"headerUnitPrice": "Stückpreis",
		"headerTotal": "Total",
		"product1Title": "Zustellfahrzeug Post",
		"product2Title": "Gelenkbus",
		"product3Title": "PostLogistic Mercedes-Benz",
		"product1ProductNr": "Produktnummer",
		"product2ProductNr": "Produktnummer",
		"product3ProductNr": "Produktnummer",
		"product1Stock": "Auf Lager",
		"product2Stock": "Auf Lager",
		"product3Stock": "Auf Lager",
		"summaryTitle": "Zusammenfassung",
		"summarySubtotal": "Zwischensumme",
		"summaryDelivery": "Lieferung",
		"summaryDeliveryFree": "Kostenlos",
		"summaryTotal": "Total (Preise inkl. MWST)",
		"radioLoggedIn": "Eingeloggter Benutzer",
		"radioAnonym": "Anonymer Benutzer",
		"addCardBtn": "Zahlungsmittel hinterlegen",
		"submitBtn": "Jetzt bestellen",
		"successTitle": "Bestellung erfolgreich!",
		"successMessage": "Die simulierte Zahlung konnte erfolgreich abgeschlossen werden. <br>Um den Warenkorb neu zu laden, klicken Sie ",
		"failTitle": "Bestellung fehlgeschlagen!",
		"failMessage": "Die simulierte Zahlung konnte nicht abgeschlossen werden. Bitte überprüfen Sie die Konsole auf Fehlermeldungen oder wenden Sie sich an Ihren Ansprechpartner, um den Fehler zu beheben. <br>Um den Warenkorb neu zu laden, klicken Sie ",
		"successTitleAddCard": "Erfolgreich!",
		"successMessageAddCard": "Die Zahlungsart konnte erfolgreich hinterlegt werden. Sie können diese nun bei der nächsten Zahlung verwenden. <br>Um den Warenkorb neu zu laden, klicken Sie ",
		"failTitleAddCard": "Fehlgeschlagen!",
		"failMessageAddCard": "Die Zahlungsart konnte nicht hinterlegt werden. Bitte überprüfen Sie die Konsole auf Fehlermeldungen oder wenden Sie sich an Ihren Ansprechpartner, um den Fehler zu beheben. <br>Um den Warenkorb neu zu laden, klicken Sie ",
		"linkText": "hier",
		"navInstructions": "Anleitung",
		"instructionsTitle": "Anleitung",
		"instructionsIntroduction": "Die Payment ShowCase-Applikation wurde dazu entwickelt, das Produkt BillingOnline in einem Demo-Modus austesten zu können. Nachfolgend wird die Funktionsweise des ShowCase erklärt und es wird gezeigt, wie man die Zahlungsmaske von BillingOnline selber in einem eigenen Shop-Prototyp/ShowCase einbinden kann, um sich ein besseres Bild vom Produkt zu machen. Bei Fragen wenden Sie sich bitte an Ihre Ansprechperson der Post CH AG.",
		"instructionsShowcaseText": "Die Applikation simuliert einen Warenkorb, der bereits mit Produkten gefüllt ist. Der Nutzer der Applikation hat die Möglichkeit, die Menge der einzelnen Produkte zu verändern. Dafür werden die Plus- und Minus-Buttons verwendet. Der Preis des Warenkorbs passt sich automatisch an. Weiter kann auch die Sprache der Applikation angepasst werden (unten rechts). Bevor man die Zahlungsmaske öffnet, kann eingestellt werden, ob die Zahlungsmaske für eingeloggte Benutzer oder diejenige für anonyme Benutzer angezeigt werden soll. Der Unterschied wird nachfolgend bei den Parametern beschrieben (UC1 und UC2). <br>Um die Zahlungsmaske von BillingOnline aufzurufen, betätigt man den 'Jetzt bestellen'-Button. Die Maske öffnet sich und man kann die Zahlung vornehmen. Mit dem Button 'Zahlungsmittel hinterlegen' wird eine Maske aufgerufen, in welcher Zahlungsmittel vorgängig gespeichert und dann bei (wiederkehrenden) Zahlung verwendet werden.",
		"instructionsNoteTitle": "Anmerkung:",
		"instructionsShowcaseNote": "Für die Bezahlung können Test-Kreditkarten verwenden werden. Um die Eingabe zu vereinfachen, kann ein Google Chrome-Plugin installiert werden, welches die Kartendaten durch Betätigen des 'valid card'-Buttons automatisch befüllt. Das entsprechende Plugin finden Sie hier: ",
		"instructionsLibraryTitle": "Payment-Library im eigenen Shop einbinden:",
		"instructionsLibraryText1": "Möchten Sie das Produkt BillingOnline in einem eigenen Online Shop testen? Kein Problem. Wir zeigen Ihnen, wie es geht.<br> Laden Sie die BillingOnline Javascript-Library hier herunter: https://codepen.io/BillingOnline/pen/qBEeLgo <br>Binden Sie unsere Library ein:",
		"instructionsLibraryText2": "Was jetzt noch fehlt, ist der Aufruf der Payment-Maske. Dies wird mit nachfolgendem Code-Block gemacht:",
		"instructionsLibraryText3": "In einem ersten Schritt werden die Einstellungen festgelegt, um die Zahlungsmaske anzupassen. Weitere Informationen zu diesen entsprechenden Parametern sind weiter unten beschrieben. Im nächsten Schritt  wird die URL zusammengebaut, mit welcher die Zahlungsmaske im ShowCase-Modus aufgerufen wird. Die Url wird mit den Parametern amount, language und usecase befüllt. Zum Schluss bleibt noch der eigentliche Aufruf der Zahlungsmaske. <br>Wir haben die Möglichkeit, die Antwort der Zahlung zu prüfen und auf das Resultat zu reagieren, indem der errorCode ausgewertet wird. (ErrorCode 0 bedeuetet erfolgreich, grösser 0 bedeutet Fehler, 12 entpricht einem Abbruch-Event durch den Benutzer). Um das Resultat genauer prüfen zu können, wird dieses in die Browser-Konsole geschrieben. Wenn Sie diese Informationen nicht brauchen, können die entsprechenden Codezeilen entfernt werden (console.log(...)).",
		"instructionsLibraryParameters": "<br>Folgende Parameter können individuell gesetzt werden:",
		"instructionsLibraryLogoUrl": "Geben Sie hier die URL Ihres Firmenlogos an. Sie können den Parameter auch leer lassen. In diesem Fall wird das Logo der Post angezeigt. Beispiel:",
		"instructionsLibraryShopcolor": "Geben Sie hier die Farbe des Shops in hexadezimaler Schreibweise an.",
		"instructionsLibraryAmount": "Geben Sie hier den Gesamtbetrag der Bestellung an. Dieser Wert wird der URL der Zahlungsmaske mitgegeben.",
		"instructionsLibraryLang": "Geben Sie hier die gewünschte Sprache der Zahlungsmaske an (de, fr, it, en). Dieser Wert wird der URL der Zahlungsmaske mitgegeben.",
		"instructionsLibraryUsecase": "Geben Sie hier den gewünschten Usecase (UC) ein (Dieser defninert Art und Bezahlmöglichkeiten der Zahlungsmaske). Folgende Usecases stehen zur Auswahl:",
		"instructionsLibraryUsecaseUC1": "Zahlungsmaske für anonyme Benutzer, bei welcher keine Zahlungsmittel hinterlegt werden können (wählen Sie im ShowCase die Option 'Anonymer Benutzer').",
		"instructionsLibraryUsecaseUC2": "Zahlungsmaske für eingeloggte Benutzer. Bei dieser Zahlungsmaske ist es unter anderem möglich, Zahlungsmittel zu hinterlegen (wählen Sie im ShowCase die Option 'Eingeloggter Benutzer').",
		"instructionsLibraryUsecaseUC7R": "Dies ist keine Zahlungsmaske, sondern eine Maske, bei der nur Zahlungsmittel hinterlegt werden können, ohne eine Zahlung auszuführen (drücken Sie im ShowCase den Button 'Zahlungsmittel hinterlegen').",
		"instructionsLibraryReturnUrl": "Die Return URL sagt aus, auf welche Seite nach der Zahlung weitergeleitet werden soll. Dieser Parameter muss nur gesetzt werden, wenn die Zahlungsmaske mittels Redirect (anstatt als Popup) eingebunden wurde. Sie können den Parameter wie folgt setzen:",
		"instructionsBillingOnline": "Produkt BillingOnline",
		"instructionsBillingOnlineText": "Wenn Sie weitere Informationen zu BillingOnline erhalten möchten, dann wählen Sie den Menüpunkt 'BillingOnline'. Sie werden direkt zur entsprechenden Seite weitergeleitet."
	}
	var fr = {
		"shoppingCardTitle": "Panier",
		"shoppingCardInfo": "Les articles qui se trouvent dans le panier ne sont pas réservés.",
		"headerProduct": "Produit",
		"headerAmount": "Quantité",
		"headerUnitPrice": "Prix unitaire",
		"headerTotal": "Total",
		"product1Title": "Véhicule de distribution Poste",
		"product2Title": "Bus articulé",
		"product3Title": "PostLogistic Mercedes-Benz",
		"product1ProductNr": "Numéro d'article",
		"product2ProductNr": "Numéro d'article",
		"product3ProductNr": "Numéro d'article",
		"product1Stock": "En stock",
		"product2Stock": "En stock",
		"product3Stock": "En stock",
		"summaryTitle": "Récapitulatif",
		"summarySubtotal": "Sous-total",
		"summaryDelivery": "Livraison",
		"summaryDeliveryFree": "Gratuit",
		"summaryTotal": "Total (Prix, TVA incluse)",
		"radioLoggedIn": "Utilisateur connecté",
		"radioAnonym": "Utilisateur anonyme",
		"addCardBtn": "Ajouter de l'argent",
		"submitBtn": "Commander maintenant",
		"successTitle": "Commande réussie!",
		"successMessage": "Le paiement simulé a été complété avec succès. <br>Pour recharger le panier, cliquez ",
		"failTitle": "L'ordre a échou!",
		"failMessage": "Le paiement simulé n'a pas pu être complété. Vérifiez les messages d'erreur sur la console ou contactez votre contact pour résoudre l'erreur. <br>Pour recharger le panier, cliquez ",
		"successTitleAddCard": "Réussi!",
		"successMessageAddCard": "Le mode de paiement pourrait être déposé avec succès. Vous pouvez maintenant les utiliser lors du prochain paiement. <br>Pour recharger le panier, cliquez ",
		"failTitleAddCard": "Échouée!",
		"failMessageAddCard": 
			"Le mode de paiement n'a pas pu être déposé. Vérifiez les messages d'erreur sur la console ou contactez votre contact pour résoudre l'erreur. <br>Pour recharger le panier, cliquez",
		"linkText": "ici",
		"navInstructions": "Instructions",
		"instructionsTitle": "Instructions (english only)",
	}
	var it = {
		"shoppingCardTitle": "Carrello",
		"shoppingCardInfo": "I prodotti che si trovano nel carrello non sono prenotati.",
		"headerProduct": "Prodotto",
		"headerAmount": "Quantità",
		"headerUnitPrice": "Prezzo unitario",
		"headerTotal": "Totale",
		"product1Title": "Veicolo per il recapito Posta",
		"product2Title": "Autopostale a due piani",
		"product3Title": "PostLogistic Mercedes-Benz",
		"product1ProductNr": "Numero prodotto",
		"product2ProductNr": "Numero prodotto",
		"product3ProductNr": "Numero prodotto",
		"product1Stock": "In magazzino",
		"product2Stock": "In magazzino",
		"product3Stock": "In magazzino",
		"summaryTitle": "Sommario",
		"summarySubtotal": "Subtotale",
		"summaryDelivery": "Consegna",
		"summaryDeliveryFree": "Gratuito",
		"summaryTotal": "Totali (prezzi IVA incl.)",
		"radioLoggedIn": "Utente registrato",
		"radioAnonym": "Utente anonimo",
		"addCardBtn": "Aggiungi contanti",
		"submitBtn": "Ordinare ora",
		"successTitle": "Ordine riuscito!",
		"successMessage": "Il pagamento simulato è stato completato con successo. <br>Per ricaricare il carrello, fai clic ",
		"failTitle": "L'ordine è falli!",
		"failMessage": 
			"Impossibile completare il pagamento simulato. Controlla i messaggi di errore sulla console o contatta il tuo contatto per risolvere l'errore. <br>Per ricaricare il carrello, fai clic ",
		"successTitleAddCard": "Successo!",
		"successMessageAddCard": 
			"Il metodo di pagamento potrebbe essere depositato correttamente. Ora puoi usarli sul prossimo pagamento. <br>Per ricaricare il carrello, fai clic ",
		"failTitleAddCard": "Mancato!",
		"failMessageAddCard": 
			"Non è stato possibile depositare il metodo di pagamento. Controlla i messaggi di errore sulla console o contatta il tuo contatto per risolvere l'errore. <br>Per ricaricare il carrello, fai clic ",
		"linkText": "qui",
		"navInstructions": "Istruzione",
		"instructionsTitle": "Istruzione (english only)",
	}
	var en = {
		"shoppingCardTitle": "Basket",
		"shoppingCardInfo": "Products in the basket are not reserved.",
		"headerProduct": "Product",
		"headerAmount": "Quantity",
		"headerUnitPrice": "Unit price",
		"headerTotal": "Total",
		"product1Title": "Zustellfahrzeug Post",
		"product2Title": "Gelenkbus Post",
		"product3Title": "PostLogistic Mercedes-Benz",
		"product1ProductNr": "Product number",
		"product2ProductNr": "Product number",
		"product3ProductNr": "Product number",
		"product1Stock": "In stock",
		"product2Stock": "In stock",
		"product3Stock": "In stock",
		"summaryTitle": "Summary",
		"summarySubtotal": "Subtotal",
		"summaryDelivery": "Delivery",
		"summaryDeliveryFree": "Free of charge",
		"summaryTotal": "Total (Prices incl. VAT)",
		"radioLoggedIn": "Logged in user",
		"radioAnonym": "Anonymous user",
		"addCardBtn": "Add means of payment",
		"submitBtn": "Order now",
		"successTitle": "Order successful!",
		"successMessage": "The simulated payment was successfully completed. <br>To reload the basket, click ",
		"failTitle": "Order failed!",
		"failMessage": `
			The simulated payment could not be completed. Please check the console for error messages or contact your contact person to resolve the error. <br>To reload the basket, click `,
		"successTitleAddCard": "Successful!",
		"successMessageAddCard": "The payment method could be deposited successfully. You can now use them on the next payment. <br>To reload the basket, click ",
		"failTitleAddCard": "Failed!",
		"failMessageAddCard": "The payment method could not be deposited. Please check the console for error messages or contact your contact person to resolve the error. <br>To reload the shopping cart, click ",
		"linkText": "here",
		"navInstructions": "Instructions",
		"instructionsTitle": "Instructions",
		"instructionsIntroduction": `
			The Payment ShowCase application was designed to test the product BillingOnline in a demo mode. The functionality of the application and the possibility to integrate the payment library in your own web shop for getting a better picture of the product will be explained below. If you have any questions, please contact your contact person of Post CH AG.`,
		"instructionsShowcaseText": `
			The application simulates a basket, that is already filled with some items. The user has the option of adjusting the count of the items by using the plus and minus buttons. In this case, the price of the respective item and the basket itself update automatically. Further you have the possibility of changing the language of the application (bottom right). Before you open the payment mask, you can set, which payment mask should be displayed. The one for anonymous users or the one for logged in users. The difference between these masks is descibed below at the parameters (UC1 und UC2). <br>For calling the payment mask of BillingOnline you only have to push the 'Order now' button. Then the mask will be opened, so you can proceed with the simulated payment. With the button 'Add means of payment' you can open another mask, in which you can save your means of payment and use them in following payments.`,
		"instructionsNoteTitle": "Annotation:",
		"instructionsShowcaseNote": `
			If you want to use a credit card for the payment, we recommend to install a Google Chrome plugin, which will fill the card information for you. With that you only need to click on the 'valid card' button. You can find this plugin here: `,
		"instructionsLibraryTitle": "Integrate the payment library in your own web shop:",
		"instructionsLibraryText1": `
			You want to test the payment mask in your own web shop? No problem. We show you how it's done.<br> Download the BillingOnline-Javascript-Library from here: https://codepen.io/BillingOnline/pen/qBEeLgo <br>This way you can integrate the payment library in your web shop:`,
		"instructionsLibraryText2": "The only thing left is the request to open the payment mask. You can achieve this with the following lines of code:",
		"instructionsLibraryText3": `
			In the first section you will find the settings to adjust the payment mask. More information about these parameters are described below. The next thing is URL for calling the payment mask. This string will be expanded with some parameters that we defined in the settings (amount, language and usecase). The last step is the request itself. <br>We can handle the specific response of the payment by checking the errorCode (0 means success, >0 means error, 12 corresponds to a cancel event). To verify the result, you can look at the console, where this information will be written. If you dont' need that, you can remove the lines with 'console.log'.`,
		"instructionsLibraryParameters": "<br>Some parameters can be set individually:",
		"instructionsLibraryLogoUrl": `
			Enter here the URL of your company's logo. This is optional. If you leave this string empty, a default logo will be shown (Post CH AG). Example:`,
		"instructionsLibraryShopcolor": "Enter here the color of your shop in a hexadecimal spelling.",
		"instructionsLibraryAmount": "Enter here the total amount of the order. This value will be added to the request URL.",
		"instructionsLibraryLang": "Enter here the language that the payment mask should use (de, fr, it, en). This value will be added to the request URL.",
		"instructionsLibraryUsecase": "Enter here the prefered usecase (type of payment mask). You can choose from following usecases:",
		"instructionsLibraryUsecaseUC1": `
			Payment mask for anonymous users, in which you don't have the possibility to add any means of payment (select the option 'anonymous user' in the ShowCase).`,
		"instructionsLibraryUsecaseUC2": `
			Payment mask for logged in users. Here you can add means of payment (select the option 'logged in user' in the ShowCase).`,
		"instructionsLibraryUsecaseUC7R": `
			This isn't a payment mask, but a mask, in which you can only add some means of payment, without performing a payment (push the button 'Add means of payment' in the ShowCase).`,
		"instructionsLibraryReturnUrl": `
			The return URL defines, which page should be redirected to after the payment. This parameter can only be set, if the payment mask has been integrated via redirect (instead of as a popup). You can set the parameter as follows:`,
		"instructionsBillingOnline": "Product BillingOnline",
		"instructionsBillingOnlineText": `
			If you wish to get more information about BillingOnline, feel free to visit the information page of the product by clicking 'BillingOnline' on the navigation bar.`
	}
	//fill english istruction for fr and it, since instruction is not available in these languages.
  var fr_en = {};
  Object.assign(fr_en, en);
  Object.assign(fr_en, fr);
   var it_en = {};
  Object.assign(it_en, en);
  Object.assign(it_en, it);
  
	languages = {
		"de": de,
		"fr": fr_en,
		"it": it_en,
		"en": en
	};
}