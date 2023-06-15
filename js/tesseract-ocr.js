$( document ).ready(function() {

	fetch('https://api.airtable.com/v0/appE1zifSr17F9ozk/Hoja%201', {
		headers: {
			'Authorization': 'Bearer patXVCepNHEZ3KKAE.c9516d96f418fb477d8e292ee5eff710d3ffeeacb3f009ce9c36d8d98410987f'
		},
	})
		.then(response => response.json())
    	.then(data => {
			const myInput = $('#file-1');

			// Establecer el atributo "disabled"
			myInput.prop('disabled', true);

      		// const nombres = data.map(record => record.Nombre);
			const nombres = data.records.map(record => record.fields.Nombre);

			const dropdown = document.createElement('ul');
			dropdown.classList.add('dropdown');

			const nombreInput = document.getElementById('nombreInput');
			const contenedorInput = nombreInput.parentElement;
			dropdown.style.display = 'none'

			const semanaInput = document.getElementById('semanaInput');

			const button = document.getElementById('miBoton');
			button.disabled = true;

			nombreInput.addEventListener('input', function() {
				const searchTerm = this.value.toLowerCase();
				const filteredNombres = nombres.filter(nombre =>
					nombre.toLowerCase().includes(searchTerm)
				);

        		showDropdownOptions(filteredNombres);
     		});

      		nombreInput.addEventListener('change', function() {
        		const selectedOption = nombres.find(
          			nombre => nombre.toLowerCase() === this.value.toLowerCase()
        		);

       			button.disabled = !selectedOption;
      		});

			semanaInput.addEventListener('change', function() {
				button.disabled = semanaInput.value === "";
			});

			function showDropdownOptions(options) {
				dropdown.innerHTML = '';

				options.forEach(option => {
					const li = document.createElement('li');
					li.textContent = option;

				li.addEventListener('click', function() {
					nombreInput.value = option;
					dropdown.innerHTML = '';
					button.disabled = false;
					myInput.prop('disabled', false);
				});

				dropdown.appendChild(li);
			});

			dropdown.style.display = 'none'

			if (options.length > 0) {
				// nombreInput.parentNode.appendChild(dropdown);
				const nextSibling = nombreInput.nextSibling;
    			nombreInput.parentNode.insertBefore(dropdown, nextSibling);
				dropdown.style.display = 'block'
			} else {
				dropdown.innerHTML = '';
				button.disabled = true;
			}
     	}
    })
    .catch(error => {
      	console.log(error);
    });


	


	var inputs = document.querySelectorAll( '.inputfile' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName ){
				// label.querySelector( 'span' ).innerHTML = fileName;
				label.querySelector( 'span' ).innerHTML = "Cargando...";

				let reader = new FileReader();
				reader.onload = function () {
					let dataURL = reader.result;
					$("#selected-image").attr("src", dataURL);
					$("#selected-image").addClass("col-12");
				}
				let file = this.files[0];
				reader.readAsDataURL(file);
				startRecognize(file);
			}
			else{
				label.innerHTML = labelVal;
				$("#selected-image").attr("src", '');
				$("#selected-image").removeClass("col-12");
				$("#arrow-right").addClass("fa-arrow-right");
				$("#arrow-right").removeClass("fa-check");
				$("#arrow-right").removeClass("fa-spinner fa-spin");
				$("#arrow-down").addClass("fa-arrow-down");
				$("#arrow-down").removeClass("fa-check");
				$("#arrow-down").removeClass("fa-spinner fa-spin");
				$("#log").empty();
			}
		});

		// Firefox bug fix
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	});
});

$("#startLink").click(function () {
	var img = document.getElementById('selected-image');
	startRecognize(img);
});

function startRecognize(img){
	$("#arrow-right").removeClass("fa-arrow-right");
	$("#arrow-right").addClass("fa-spinner fa-spin");
	$("#arrow-down").removeClass("fa-arrow-down");
	$("#arrow-down").addClass("fa-spinner fa-spin");
	recognizeFile(img);
}

function progressUpdate(packet){
	var log = document.getElementById('log');

	if(log.firstChild && log.firstChild.status === packet.status){
		if('progress' in packet){
			var progress = log.firstChild.querySelector('progress')
			progress.value = packet.progress
		}
	}else{
		var line = document.createElement('div');
		line.status = packet.status;
		var status = document.createElement('div')
		status.className = 'status'
		status.appendChild(document.createTextNode(packet.status))
		line.appendChild(status)

		if('progress' in packet){
			var progress = document.createElement('progress')
			progress.value = packet.progress
			progress.max = 1
			line.appendChild(progress)
		}


		if(packet.status == 'done'){
			log.innerHTML = ''
			var pre = document.createElement('pre')
			pre.appendChild(document.createTextNode(packet.data.text.replace(/\n\s*\n/g, '\n')))
			line.innerHTML = ''
			line.appendChild(pre)
			$(".fas").removeClass('fa-spinner fa-spin')
			$(".fas").addClass('fa-check')
		}

		log.insertBefore(line, log.firstChild)
	}
}



function recognizeFile(file) {
	$("#log").empty();
	const corePath = window.navigator.userAgent.indexOf("Edge") > -1
		? 'js/tesseract-core.asm.js'
		: 'js/tesseract-core.wasm.js';

	const worker = new Tesseract.TesseractWorker({
		corePath,
	});

	worker.recognize(file, $("#langsel").val())
		.progress(function(packet) {
			console.info(packet);
			progressUpdate(packet);
		})
		.then(function(data) {
			console.log("aaaaaaaaahasdasdada: ", data.text);
			const pattern = /(\d{1,3}(?:[,.]\d{3})*)\s*(?:steps|passi|pasos)/i;
			const match = data.text.match(pattern);

			let valor = 0;

			if (match) {
				valor = match[1].replace(/[,.]/g, ''); // Remover comas de los números
				console.log("El valor numérico antes de 'steps' es:", valor);
			} else {
				console.log("No se encontró ningún valor numérico antes de 'steps'");
			}

			const nombreInput = document.getElementById('nombreInput');
			const semanaInput = document.getElementById('semanaInput');

			const selectedNombre = nombreInput.value;
			const selectedSemana = semanaInput.value;

			fetch(`https://api.airtable.com/v0/appE1zifSr17F9ozk/Hoja%201?filterByFormula=AND(Nombre%3D%27${selectedNombre}%27%2CNOT({${selectedSemana}}%3D%27%27))`, {
				headers: {
					'Authorization': 'Bearer patXVCepNHEZ3KKAE.c9516d96f418fb477d8e292ee5eff710d3ffeeacb3f009ce9c36d8d98410987f',
					'Content-Type': 'application/json'
				}
			})
				.then(response => response.json())
				.then(data => {
					console.log(data)
					if (data.records.length != 0) {
						// Ya existe un valor para esa combinación de nombre y semana
						alert("Ya existe un valor para el nombre y la semana seleccionada. No es posible actualizarlo.");
						nombreInput.value = '';
						location.reload();
					} else {
						// No existe un valor para esa combinación de nombre y semana, realizar la actualización
						fetch(`https://api.airtable.com/v0/appE1zifSr17F9ozk/Hoja%201?filterByFormula=Nombre='${selectedNombre}'`, {
							headers: {
								'Authorization': 'Bearer patXVCepNHEZ3KKAE.c9516d96f418fb477d8e292ee5eff710d3ffeeacb3f009ce9c36d8d98410987f'
							},
						})
							.then(response => response.json())
							.then(data => {
								if (data.records && data.records.length > 0) {
									const recordId = data.records[0].id;
									fetch(`https://api.airtable.com/v0/appE1zifSr17F9ozk/Hoja%201/${recordId}`, {
										method: 'PATCH',
										headers: {
											'Authorization': 'Bearer patXVCepNHEZ3KKAE.c9516d96f418fb477d8e292ee5eff710d3ffeeacb3f009ce9c36d8d98410987f',
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({
											fields: {
												[selectedSemana]: parseInt(valor)
											}
										})
									})
										.then(response => response.json())
										.then(data => {
											console.log('Registro actualizado:', data);
											alert('Hola ' + selectedNombre + ', se han registrado ' + valor + ' pasos. Si este número no es correcto, por favor comunícate con un miembro del Comité SYSO.');
											nombreInput.value = '';
											var span = document.getElementById("algo");
											span.innerHTML = "Seleccionar screenshot";
											location.reload();
										})
										.finally(function() {
											button.innerText = "Texto por defecto";
											location.reload();
										})
										.catch(error => {
											console.log(error);
										});
								} else {
									console.log('Registro no encontrado');
								}
							})
							.catch(error => {
								console.log(error);
							});
					}
				})
				.catch(error => {
					console.log(error);
				});

			progressUpdate({ status: 'done', data: data });
		});
}


  
  