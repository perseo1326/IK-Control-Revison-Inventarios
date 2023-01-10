

        function processFile(file) {

            const aFile = openTextFile(file);
            if(!aFile) {            
                return;
            }
            // console.log("Propiedades del archivo:");
            // console.log(aFile);
            loadTextFile(aFile);
        }

        // *********************************************************
        function openTextFile(file) {
            // Apertura del archivo seleccionado
            let aFile = file.target.files[0];
            
            if (!aFile) {
                alert("No se ha seleccionado ningun archivo.");
                console.log("No se ha seleccionado ningun archivo.");
                return null;
            }
            /*
            if (aFile.type && !aFile.type.startsWith('text/')) {
                alert('El archivo seleccionado NO es válido.');
                console.log('El archivo seleccionado NO es válido.');
                return null;
            }
            */
            return aFile;
        }

        // *********************************************************
        function loadTextFile(aFile) {
            // Carga del contenido del archivo
            let lector = new FileReader();
            lector.onload = function(aFile) {
                let content = new Array;
                let rows = aFile.target.result.split("\n");
                rows.forEach(row => {
                    let columns = row.split("\t"); 
                    content.push(columns);    
                });

                processContent(content);
                showContent(content);
            };
            lector.readAsText(aFile);
        }

        // *********************************************************
        function processContent(content) {
            console.log(content);

            
        }
        // *********************************************************
        function showContent(content) {
            let element = document.getElementById('contenido-archivo');
            element.innerHTML = content;
        }

        // *********************************************************
        document.getElementById('file-input')
        .addEventListener('change', processFile, false);
        
