document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('consultPatient').addEventListener('click', function(event) {
        event.preventDefault();
        loadPatientConsultationForm();
    });

    document.getElementById('newPatient').addEventListener('click', function(event) {
        event.preventDefault();
        loadNewPatientForm();
    });

    document.getElementById('personalData').addEventListener('click', function(event) {
        event.preventDefault();
        loadPersonalDataForm();
    });

    function loadPatientConsultationForm() {
        document.getElementById('container-home').style.display = "none";
        document.getElementById('container-consultation').style.display = 'block';
        document.getElementById('container-new').style.display = 'none';
        document.getElementById('container-personal-data').style.display = "none";
        
    }

    function loadNewPatientForm() {
        document.getElementById('container-home').style.display = "none";
        document.getElementById('container-consultation').style.display = 'none';
        document.getElementById('container-new').style.display = 'block';
        document.getElementById('container-personal-data').style.display = "none";
    }

    function loadPersonalDataForm() {
        document.getElementById('container-consultation').style.display = 'none';
        document.getElementById('container-new').style.display = 'none';
        document.getElementById('container-personal-data').style.display = "block";
    }

    document.getElementById('fhirForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        // Capturar los datos del formulario
        const patientNacionalidad = document.getElementById('patientNacionalidad').value;
        const patientDNI = document.getElementById('patientDNI').value;
        const patientName = document.getElementById('patientName').value;
        const patientLastName = document.getElementById('patientLastName').value;
        const patientBirthDate = document.getElementById('patientBirthDate').value;
        const patientSexo = document.getElementById('patientSexo').value;
        const patientGender = document.getElementById('patientGender').value;
        const patientOcupation = document.getElementById('patientOcupation').value;
        const patientVoluntad = document.getElementById('patientVoluntad').value;
        const patientDiscapacidad = document.getElementById('patientDiscapacidad').value;
        const patientResidentActual = document.getElementById('patientResidentActual').value;
        const patientMunipioActual = document.getElementById('patientMunipioActual').value;
        const patientPertEtnica = document.getElementById('patientPertEtnica').value;
        const patientZonaTerritorial = document.getElementById('patientZonaTerritorial').value;
        const patientEntidadRespondiente = document.getElementById('patientEntidadRespondiente').value;

        const patientResource = {
            resourceType: "Patient",
            identifier: [{
                system: "http://localhost:8080/patient-ids",
                value: patientDNI
            }],
            name: [{
                given: [patientName],
                family: patientLastName
            }],
            birthDate: patientBirthDate,
            gender: patientGender.toLowerCase(),
            extension: [
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/nationality",
                    valueString: patientNacionalidad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/sex",
                    valueString: patientSexo
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/occupation",
                    valueString: patientOcupation
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/advanced-directive",
                    valueString: patientVoluntad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/disability",
                    valueString: patientDiscapacidad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/address",
                    valueAddress: {
                        country: patientResidentActual,
                        city: patientMunipioActual
                    }
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/ethnicity",
                    valueString: patientPertEtnica
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/residence-area",
                    valueString: patientZonaTerritorial
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/responding-entity",
                    valueString: patientEntidadRespondiente
                }
            ]
        };

        try {
            const response = await fetch('http://localhost:8080/fhir/Patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/fhir+json'
                },
                body: JSON.stringify(patientResource)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                alert('Datos enviados con éxito');
                this.reset();
            } else {
                const errorText = await response.text(); // Capturar el texto del error
                console.error('Error:', errorText || response.statusText);
                alert(`Error al enviar los datos: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar los datos');
        }
    });

    document.getElementById('searchButton').addEventListener('click', function() {
        let patientDNIConsult = document.getElementById('patientDNIConsult').value.trim();

        if (patientDNIConsult === '') {
            alert('Por favor, ingrese un número de identificación válido.');
            return;
        }

        fetch(`http://localhost:8080/fhir/Patient?identifier=${patientDNIConsult}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');
                }
                return response.json();
            })
            .then(data => {
                displayPatientInfo(data);
            })
            .catch(error => {
                alert("Identificación no registrada!");
                document.getElementById('patientDetails').classList.add('d-none');
                document.getElementById('editPatientFormContainer').classList.add('d-none');
                document.getElementById('patientDNIConsult').value = '';
            });
    });

    
    function displayPatientInfo(patientData) {
        const patientInfoDiv = document.getElementById('patientInfo');
        const observationContainer = document.getElementById('patientObservations');

        patientInfoDiv.innerHTML = '';
    
        for (const patient of patientData.entry) {
            const patientName = patient.resource.name[0].given.join(' ') + ' ' + patient.resource.name[0].family;
            const patientGender = patient.resource.gender;
            const patientBirthDate = patient.resource.birthDate;
            const patientNacionalidad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/nationality');
            const patientDNI = patient.resource.identifier[0].value;
            const patientLastName = patient.resource.name[0].family;
            const patientSexo = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/sex');
            const patientOcupation = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/occupation');
            const patientVoluntad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/advanced-directive');
            const patientDiscapacidad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/disability');
            const patientResidentActual = getExtensionAddressValue(patient, 'http://localhost:8080/fhir/StructureDefinition/address', 'country');
            const patientMunipioActual = getExtensionAddressValue(patient, 'http://localhost:8080/fhir/StructureDefinition/address', 'city');
            const patientPertEtnica = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/ethnicity');
            const patientZonaTerritorial = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/residence-area');
            const patientEntidadRespondiente = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/responding-entity');
    
            const patientDetailsHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Nombres:</strong> ${patientName}</p>
                        <p><strong>Género:</strong> ${patientGender}</p>
                        <p><strong>Fecha de Nacimiento:</strong> ${patientBirthDate}</p>
                        <p><strong>País de Nacionalidad:</strong> ${patientNacionalidad}</p>
                        <p><strong>Documento de Identificación:</strong> ${patientDNI}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Sexo:</strong> ${patientSexo}</p>
                        <p><strong>Ocupación:</strong> ${patientOcupation ? patientOcupation : 'No especificado'}</p>
                        <p><strong>Voluntad Anticipada:</strong> ${patientVoluntad ? patientVoluntad : 'No especificado'}</p>
                        <p><strong>Categoría de Discapacidad:</strong> ${patientDiscapacidad ? patientDiscapacidad : 'No especificado'}</p>
                        <p><strong>País de Residencia:</strong> ${patientResidentActual ? patientResidentActual : 'No especificado'}</p>
                        <p><strong>Municipio de Residencia:</strong> ${patientMunipioActual ? patientMunipioActual : 'No especificado'}</p>
                        <p><strong>Pertenencia Étnica:</strong> ${patientPertEtnica ? patientPertEtnica : 'No especificado'}</p>
                        <p><strong>Zona Territorial:</strong> ${patientZonaTerritorial ? patientZonaTerritorial : 'No especificado'}</p>
                        <p><strong>Entidad Respondiente:</strong> ${patientEntidadRespondiente ? patientEntidadRespondiente : 'No especificado'}</p>
                    </div>
                    </div>
                    <button type="button" class="btn btn-primary" id="editHistoryButton">Editar historia</button>
                    
                `;
                patientInfoDiv.innerHTML += patientDetailsHTML;
                displayObservations(patient.resource.id);
            }

            document.getElementById('patientDetails').classList.remove('d-none');

            document.getElementById('editHistoryButton').addEventListener('click', function() {
                document.getElementById('editPatientFormContainer').classList.remove('d-none');
            });
    }
  
    function getExtensionValue(patient, url) {
        const extension = patient.resource.extension.find(ext => ext.url === url);
        return extension ? extension.valueString : undefined;
    }
    
    function getExtensionAddressValue(patient, url, field) {
        const extension = patient.resource.extension.find(ext => ext.url === url);
        return extension && extension.valueAddress ? extension.valueAddress[field] : undefined;
    }

    document.getElementById('editPatientForm').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        const patientDNIConsult = document.getElementById('patientDNIConsult').value.trim();
        if (!patientDNIConsult) {
            alert('Por favor, ingrese el número de identificación del paciente.');
            return;
        }
    
        const observationText = document.getElementById('observationPatient').value.trim();
        if (!observationText) {
            alert('Por favor, ingrese una observación.');
            return;
        }
    
        try {
            const patientResponse = await fetch(`http://localhost:8080/fhir/Patient?identifier=${patientDNIConsult}`);
            if (!patientResponse.ok) {
                throw new Error('No se pudo encontrar el paciente');
            }
            const patientData = await patientResponse.json();
            const patientId = patientData.entry[0].resource.id;
    
            const observation = {
                resourceType: 'Observation',
                status: 'final',
                code: {
                    coding: [{
                        system: 'http://loinc.org',
                        code: '34109-9',
                        display: 'Note'
                    }]
                },
                subject: {
                    reference: `Patient/${patientId}`
                },
                valueString: observationText,
                effectiveDateTime: new Date().toISOString()
            };
    
            const response = await fetch('http://localhost:8080/fhir/Observation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/fhir+json'
                },
                body: JSON.stringify(observation)
            });
    
            if (response.ok) {
                const observationData = await response.json();
                console.log('Observation created:', observationData);
                alert('La observación se ha guardado correctamente.');
                document.getElementById('observationPatient').value = ''; 
                document.getElementById('editPatientFormContainer').classList.add('d-none');

            } else {
                const errorText = await response.text();
                console.error('Error creating Observation:', errorText || response.statusText);
                alert(`Ha ocurrido un error al guardar la observación: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Error creating Observation:', error);
            alert('Ha ocurrido un error al guardar la observación.');
        }
    });
    
    function displayObservations(patientId) {
        fetch(`http://localhost:8080/fhir/Observation?subject=Patient/${patientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');
                }
                return response.json();
            })
            .then(observationData => {
                const observationContainer = document.getElementById('observationContainer');
                observationContainer.innerHTML = '';
            if (observationData.entry && observationData.entry.length > 0) {
                observationData.entry.forEach(observationEntry => {
                    const observation = observationEntry.resource;
                    const observationText = observation.valueString;
                    let observationDate = '';
                    if (observation.effectiveDateTime) {
                        observationDate = new Date(observation.effectiveDateTime).toLocaleDateString();
                    }
                    else if (observation.issued) {
                        observationDate = new Date(observation.issued).toLocaleDateString();
                    }
                    else {
                        observationDate = new Date().toLocaleDateString();
                    }
                    const observationHTML = `
                        <div class="observation">
                            <p><strong>Fecha:</strong> ${observationDate}</p>
                            <p><strong>Observación:</strong> ${observationText}</p>
                        </div>
                    `;
                    observationContainer.insertAdjacentHTML('beforeend', observationHTML);
                });
            }else {
                const noObservationsHTML = `
                    <div class="no-observations">
                        <p>No se encontraron observaciones para este paciente.</p>
                    </div>
                `;
                observationContainer.insertAdjacentHTML('beforeend', noObservationsHTML);
            
            }
            })
            .catch(error => {
                console.error('Error al consultar las observaciones del paciente:', error);
                alert('Ha ocurrido un error al recuperar las observaciones del paciente.');
            });
    }
    
});