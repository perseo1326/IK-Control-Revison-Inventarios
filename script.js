

    class StockControl {
        constructor(hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) {
            this.hfb = hfb;
            this.articleNumber = articleNumber;
            this.articleName = articleName;
            this.salesMethod = salesMethod;
            this.avgSales = avgSales;
            this.availableStock = availableStock;
            this.salesLocationLV = salesLocationLV;
            this.rotationRatio = 0;
        }
    }

    // *********************************************************
    // Hacer visible el cuadro de "Cargando..."
    let loading = document.getElementById("loading");
    let fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', processFile, false);
    fileInput.addEventListener('click', toggleLoading, false);


    // *********************************************************
    function toggleLoading() {
        loading.classList.toggle("no-visible");
    }

    // *********************************************************
    function processFile(file) {
        // Inicio del proceso de carga y analisis del archivo de texto o CSV
        const aFile = openTextFile(file);
        if(!aFile) {            
            return;
        }
        // console.log("Propiedades del archivo:");
        // console.log(aFile);
        loadTextFile(aFile);
        toggleLoading();

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

            // Eliminar lineas vacias o incompletas al final del archivo.
            deleteEmptyFinalLines(content[0].length, content);

            let filteredData = processContent(content);
            


            

            
            showContent(filteredData);
        };
        lector.readAsText(aFile);
    }

    // *********************************************************
    function deleteEmptyFinalLines(totalColumns, content) {
        // console.log("deleteEmptyFinalLines");
        if (content[content.length - 1].length < totalColumns) {
            content.pop();
            deleteEmptyFinalLines(totalColumns, content);
        }
    }

    // *********************************************************
    // Nucleo de la logica de negocio de la aplicacion
    function processContent(content) {
        if(!verifyContent(content[0])) {
            alert("El contenido del archivo NO tiene formato válido.");
            console.log("El contenido del archivo NO tiene formato válido.");
            return;
        }
        return filterColumns(content);
    }

    // *********************************************************
    function filterColumns(content) {
        let stockControlData = new Array();
        for (let row = 1; row < content.length; row++) {
        // (hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) rotationRatio

            const stock = new StockControl(content[row][0].trim(), 
                                            content[row][2].trim(),
                                            content[row][3].trim(),
                                            content[row][6].trim(),
                                            content[row][5].trim(),
                                            content[row][10].trim(),
                                            content[row][18].trim() ); 
            stockControlData.push(stock);
        }
        return stockControlData;
    }
    
    // *********************************************************
    function verifyContent(content) {

        // Verificar la estructura de la informacion en el archivo
        if (content[0].trim() == "HFB" && 
            content[2].trim() == "ARTNO" && 
            content[3].trim() == "ARTNAME_UNICODE" && 
            content[6].trim() == "SALESMETHOD" &&
            content[5].trim() == "AVGSALES" &&
            content[10].trim() == "AVAILABLESTOCK" &&
            content[18].trim() == "SLID_H" ) {
                return true;
        } 
        return false;
    }

    // *********************************************************
    function showContent(content) {
        let element = document.getElementById('contenido-archivo');
        let data = "";

        // (hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) rotationRatio

            data = "hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV, rotationRatio\n";
        content.forEach(row => {
            data += row.hfb + '\t' + row.articleNumber + '\t' + row.articleName + '\t' + 
            row.avgSales + '\t' + row.salesMethod + '\t' + row.availableStock + '\t' + row.salesLocationLV + '\n'
        })



        element.innerHTML = data;
        console.log("Show content:");   
        console.log(content);
    }

    // *********************************************************

    
