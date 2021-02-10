
let imgSrc = chrome.runtime.getURL("images/loading.gif");
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	let response = null;
	if (request.command === 'calcularSaida') {
		response = calcularSaida();
	} else if (request.command === 'calculateOnly') {
		response = calcularSaida(true);
	}

	if (response.complete) {
		sendResponse({ result: `Você pode sair ás: </br> ${response.hora}` });
	} else {
		sendResponse({ result: `recalculate` });
	}

});

function calcularSaida(calculateOnly) {
	let dateRetorno = null;

	try {
		if (calculateOnly) {
			dateRetorno = performCalculation();
		} else {
			if (document.getElementById("idemPotencia") == null) {
				let div = document.createElement("div");
				div.setAttribute("id", "idemPotencia");
				div.setAttribute("style", "width: 100%;height: 102%;position: absolute;z-index: 10000;float: left;background: #50505087;margin-top: -2%;display:none");

				let table = document.createElement("table");
				table.setAttribute("height", "100%");
				table.setAttribute("width", "100%");

				let tr = document.createElement("tr");
				let td = document.createElement("td");
				td.setAttribute("align", "center");

				let img = document.createElement("img");
				img.setAttribute("src", imgSrc)
				img.setAttribute("style", "max-width: 60px;");

				td.appendChild(img);
				tr.appendChild(td);
				table.appendChild(tr);
				div.appendChild(table);

				document.querySelector('body').appendChild(div);
			}

			document.querySelector("#idemPotencia").style.display = "";
			
			if(document.querySelector('.close')){
				document.querySelector('.close').click();
			}
			
			document.querySelector('button[title="Ver todos os pontos do dia"]').click();

			dateRetorno = performCalculation();
		}


		return { "complete": true, "hora": dateRetorno.toLocaleTimeString() };
	} catch (e) {
		return { "complete": false };
	}

}

function performCalculation() {
	const label = document.createElement("label");
	label.setAttribute("id", "labelHora");
	label.setAttribute("style", "float: left");
	
	let items = document.getElementsByClassName("pull-right ng-binding")
	for (let i = 0; i < items.length; i++) {
		if (items[i].firstElementChild != null)
			items[i].firstElementChild.remove();
	}
	var horaChegada = document.getElementsByClassName("pull-right ng-binding")[0].innerText;
	var horaSaida = document.getElementsByClassName("pull-right ng-binding")[1].innerText;
	var horaRetorno = document.getElementsByClassName("pull-right ng-binding")[2].innerText;

	const dateChegada = new Date();
	dateChegada.setHours(horaChegada.split(":")[0]);
	dateChegada.setMinutes(horaChegada.split(":")[1]);
	dateChegada.setSeconds(0);

	const dateSaida = new Date();
	dateSaida.setHours(horaSaida.split(":")[0]);
	dateSaida.setMinutes(horaSaida.split(":")[1]);
	dateSaida.setSeconds(0);

	let dateRetorno = new Date();
	dateRetorno.setHours(horaRetorno.split(":")[0]);
	dateRetorno.setMinutes(horaRetorno.split(":")[1]);
	dateRetorno.setSeconds(0);

	var horaManha = dateSaida.getTime() - dateChegada.getTime();
	var millisecondToFinish = (28800000 - horaManha);
	dateRetorno.setTime(dateRetorno.getTime() + millisecondToFinish);

	document.querySelector("#idemPotencia").style.display = "none";

	label.innerText = `Você pode sair ás ${dateRetorno.toLocaleTimeString()}`;

	document.querySelector('.modal-dialog.modal-md .modal-footer.ng-scope').appendChild(label);

	return dateRetorno
}
