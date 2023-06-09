$( document ).ready(function() {

	fetch('https://sheetdb.io/api/v1/ut53j8nck1dab/')
		.then(response => response.json())
    	.then(data => {

			const myInput = $('#file-1');

			// Establecer el atributo "disabled"
			myInput.prop('disabled', true);

      		const nombres = data.map(record => record.Nombre);

			const nombreInput = document.getElementById('nombreInput');
			const semanaInput = document.getElementById('semanaInput');
			const dropdown = document.createElement('ul');
			dropdown.classList.add('dropdown');

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

			if (options.length > 0) {
				nombreInput.parentNode.appendChild(dropdown);
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
				label.querySelector( 'span' ).innerHTML = fileName;

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

function recognizeFile(file){
	$("#log").empty();
  	const corePath = window.navigator.userAgent.indexOf("Edge") > -1
    ? 'js/tesseract-core.asm.js'
    : 'js/tesseract-core.wasm.js';


	const worker = new Tesseract.TesseractWorker({
		corePath,
	});

	worker.recognize(file,
		$("#langsel").val()
	)
		.progress(function(packet){
			console.info(packet)
			progressUpdate(packet)

		})
		.then(function(data){
			console.log("aaaaaaaaahasdasdada: ", data.text)
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
			// const valor = 150;

			fetch(`https://sheetdb.io/api/v1/ut53j8nck1dab/Nombre/${selectedNombre}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					[selectedSemana]: valor
				})
			})
				.then(response => response.json())
				.then(data => {
					console.log('Registro actualizado:', data);
					// Realizar acciones adicionales después de actualizar el registro
				})
				.catch(error => {
					console.log(error);
				});


			progressUpdate({ status: 'done', data: data })
		})
}


function buscarNombre() {
	const nombreInput = document.getElementById('nombreInput');
	const nombreSeleccionado = nombreInput.value;
  
	fetch('https://sheetdb.io/api/v1/ut53j8nck1dab/')
	  .then(response => response.json())
	  .then(data => {
		const nombres = data.map(record => record.Nombre);
  
		const selectizeConfig = {
		  options: nombres,
		  create: false,
		  onChange: function(value) {
			nombreInput.value = value;
		  }
		};
  
		$(nombreInput).selectize(selectizeConfig);
  
		if (nombres.includes(nombreSeleccionado)) {
		  console.log('El nombre se encuentra en los registros.');
		} else {
		  console.log('El nombre no se encuentra en los registros.');
		}
	  })
	  .catch(error => {
		// Manejo de errores
		console.log(error);
	  });
  }
  
  