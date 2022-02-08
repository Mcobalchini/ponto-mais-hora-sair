let imgSrc = chrome.runtime.getURL('images/loading.gif');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	const version = request.version;

	if ((document.querySelector('[ng-if=all_loaded]') != null && version === 'v1')
		|| (document.querySelector('.dx-row.dx-data-row.dx-row-lines') != null && version === 'v2')
	) {
		let response = null;
		response = calcularSaida(request.command === 'calculateOnly', version);

		if (response.complete) {
			sendResponse({ result: `` });
		} else {
			sendResponse({ result: `recalculate` });
		}
	} else {
		Swal.fire({
			title: 'Atenção',
			text: 'Aguarde o carregamento da página',
			icon: 'warning',
			confirmButtonText: 'Entendi'
		});
	}
});

function calcularSaida(calculateOnly, version) {

	try {
		if (!calculateOnly) {
			createIdempotent();
		}

		getEntriesFromDOM(version);

		return { 'complete': true };
	} catch (e) {
		return { 'complete': false };
	}

}

function createIdempotent() {
	if (document.getElementById('idemPotencia') == null) {
		let div = document.createElement('div');
		div.setAttribute('id', 'idemPotencia');
		div.setAttribute('style', 'width: 100%;height: 100vh;position: absolute;z-index: 999999;float: left;background: #50505087;margin-top: -2%;display:none');

		let table = document.createElement('table');
		table.setAttribute('height', '100%');
		table.setAttribute('width', '100%');

		let tr = document.createElement('tr');
		let td = document.createElement('td');
		td.setAttribute('align', 'center');

		let img = document.createElement('img');
		img.setAttribute('src', imgSrc)
		img.setAttribute('style', 'max-width: 60px;');

		td.appendChild(img);
		tr.appendChild(td);
		table.appendChild(tr);
		div.appendChild(table);

		document.querySelector('body').appendChild(div);
	}

	document.querySelector('#idemPotencia').style.display = '';
}

function getEntriesFromDOM(version) {
	let modal = '';
	let horaChegada, horaSaida, horaRetorno;
	let hourElements, hourContainer;

	if (version === 'v2') {
		hourElements = '.col.cont.hour';
		hourContainer = `.modal-dialog.modal-lg.modal-dialog-scrollable ${hourElements}`;
		if (document.querySelector(hourContainer) == null) {
			document.querySelector('dx-drop-down-button div div div').click();
			document.querySelector('.dx-item-content.dx-list-item-content').click();
		}

		modal = document.querySelector('.modal-dialog.modal-lg.modal-dialog-scrollable');

	} else {
		hourElements = 'div.pull-right.ng-binding';
		hourContainer = `.modal-dialog.modal-md ${hourElements}`;
		if (document.querySelector(hourContainer) == null) {
			document.querySelector('button[title="Ver todos os pontos do dia"]').click();
		}

		modal = document.querySelector('.modal-dialog.modal-md');
	}

	if (document.querySelector(hourContainer) != null) {
		[horaChegada, horaSaida, horaRetorno] =
			Array.from(modal.querySelectorAll(hourElements))
				.map(it => it.innerText.match(/([0-9])*:\w+/g, '')[0]);
	} else {
		throw new Error();
	}

	if (horaChegada && horaSaida && horaRetorno) {
		incrementDOM({
			horaChegada,
			horaSaida,
			horaRetorno
		}, modal)
	} else {
		hideIdemPotent();
		closePopUp(version);
		Swal.fire({
			title: 'Ops',
			text: 'Não foi possível calcular a sua hora de sair (você precisa ter no mínimo 3 registros de ponto no dia)',
			icon: 'error',
			confirmButtonText: 'Entendi'
		});
	}
}
			
function closePopUp(version) {
	const clazz = version === 'v1' ? '.close' : '.dimiss';
	if (document.querySelector(clazz))
		document.querySelector(clazz).click();
}


function hideIdemPotent() {
	if (document.getElementById('idemPotencia') != null) {
		document.querySelector('#idemPotencia').style.display = 'none';
	}
}

function createLabel(text, modal) {
	let label = document.getElementById('labelHora');
	if (label == null) {
		label = document.createElement('label');
		label.setAttribute('id', 'labelHora');
		label.setAttribute('class', 'col-6');
		label.setAttribute('style', 'float: left');
	}

	label.innerText = text;
	modal.querySelector('.modal-footer').appendChild(label);
}

function incrementDOM(hours, modal) {
	const dateRetorno = calculate(hours.horaChegada, hours.horaSaida, hours.horaRetorno);
	createLabel(`Você pode sair ás ${dateRetorno.toLocaleTimeString()}`, modal);
	hideIdemPotent();
}

function calculate(horaChegada, horaSaida, horaRetorno) {
	const dateChegada = new Date();
	dateChegada.setHours(horaChegada.split(':')[0]);
	dateChegada.setMinutes(horaChegada.split(':')[1]);
	dateChegada.setSeconds(0);

	const dateSaida = new Date();
	dateSaida.setHours(horaSaida.split(':')[0]);
	dateSaida.setMinutes(horaSaida.split(':')[1]);
	dateSaida.setSeconds(0);

	let dateRetorno = new Date();
	dateRetorno.setHours(horaRetorno.split(':')[0]);
	dateRetorno.setMinutes(horaRetorno.split(':')[1]);
	dateRetorno.setSeconds(0);

	var horaManha = dateSaida.getTime() - dateChegada.getTime();
	var millisecondToFinish = (28800000 - horaManha);
	dateRetorno.setTime(dateRetorno.getTime() + millisecondToFinish);
	return dateRetorno
}