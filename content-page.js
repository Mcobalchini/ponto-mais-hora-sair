let imgSrc = chrome.runtime.getURL('images/loading.gif');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	const version = request.version;

	if ((document.querySelector('[ng-if=all_loaded]') != null && version === 'v1')
		|| (document.querySelector('.dx-row.dx-data-row.dx-row-lines') != null && version === 'v2')
	) {
		let response = null;
		response = performActions(request.command === 'evaluateOnly', version);

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

function performActions(evaluateOnly, version) {

	try {
		if (!evaluateOnly) {
			createIdempotent();
		}

		const entries = getEntriesFromDOM(version);

		if (entries != null) {
			const shiftEndHour = calculate(entries.arrivalTime, entries.departureTime, entries.secondArrivalTime);
			fillDOM(shiftEndHour, entries.modal);	
		}
	
		return { 'complete': true };
	} catch (e) {
		return { 'complete': false };
	}

}

function calculate(arrivalTime, departureTime, secondArrivalTime) {
	const arrivalDate = splitDate(arrivalTime);
	const departureDate = splitDate(departureTime);
	let secondArrivalDate = splitDate(secondArrivalTime);
	var morningHour = departureDate.getTime() - arrivalDate.getTime();
	var millisecondToFinish = (28800000 - morningHour);
	secondArrivalDate.setTime(secondArrivalDate.getTime() + millisecondToFinish);
	return secondArrivalDate
}

function splitDate(time) {
	const date = new Date();
	date.setHours(time.split(':')[0]);
	date.setMinutes(time.split(':')[1]);
	date.setSeconds(0);
	return date
}

function createIdempotent() {
	if (document.getElementById('idemPotent') == null) {
		let div = document.createElement('div');
		div.setAttribute('id', 'idemPotent');
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

	document.querySelector('#idemPotent').style.display = '';
}

function getEntriesFromDOM(version) {
	let modal = '';
	let arrivalTime, departureTime, secondArrivalTime;
	let hourElements, hourContainer;

	if (version === 'v2') {
		hourElements = '.col.cont.hour';
		hourContainer = `.modal-dialog.modal-lg.modal-dialog-scrollable ${hourElements}`;
		if (document.querySelector(hourContainer) == null) {
			document.querySelector('.pm-icon-arrow-outline-down').click();
			document.querySelector('.pm-dropdown-options .ng-star-inserted').click();
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
		[arrivalTime, departureTime, secondArrivalTime] =
			Array.from(modal.querySelectorAll(hourElements))
				.map(it => it.innerText.match(/([0-9])*:\w+/g, '')[0]);
	} else {
		throw new Error();
	}

	if (arrivalTime && departureTime && secondArrivalTime) {
		return {
				arrivalTime,
				departureTime,
				secondArrivalTime,
				modal
			}
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
	if (document.getElementById('idemPotent') != null) {
		document.querySelector('#idemPotent').style.display = 'none';
	}
}

function createLabel(text, modal) {
	let label = document.getElementById('hourLabel');
	if (label == null) {
		label = document.createElement('label');
		label.setAttribute('id', 'hourLabel');
		label.setAttribute('class', 'col-6');
		label.setAttribute('style', 'float: left');
	}
	label.innerText = text;
	modal.querySelector('.modal-footer').appendChild(label);
}

function fillDOM(shiftEndHour, modal) {	
	createLabel(`Você pode sair ás ${shiftEndHour.toLocaleTimeString()}`, modal);
	hideIdemPotent();
}