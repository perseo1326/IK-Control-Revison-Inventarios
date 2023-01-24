
    class StockControl {
        constructor(hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) {
            this.hfb = Number (hfb);
            this.articleNumber = articleNumber;
            this.articleName = articleName;
            this.salesMethod = Number (salesMethod.replace(',', '.'));
            this.avgSales = Number (avgSales.replace(',', '.'));
            this.availableStock = Number (availableStock.replace(',', '.'));
            this.salesLocationLV = salesLocationLV;
            this.rotationRatio = 0;
        }
    }

    // *********************************************************
    const loadingFrame = document.getElementById("loading-frame");
    const loading = document.getElementById("loading");
    const fileSelector = document.getElementById('file-input');
    const radioButtons = document.getElementsByName("estate");
    const tableBody = document.getElementById("data-body");
    const processFile = document.getElementById("process-file");
    const printButton = document.getElementById("print-button");

    const ESTATE_ONE = 'estateOne';
    const ESTATE_TWO = 'estateTwo';
    const ESTATE_THREE = 'estateThree';

    const fileReader = new FileReader();
    let contentOriginal = [];
    let content = [];
    let weekDay = new Date();

    fileSelector.addEventListener('change', openFile); 
    fileReader.addEventListener('loadstart', () => {
        loadingFrame.classList.remove("no-visible");
    });
    fileReader.addEventListener('progress', loadingInfo);
    fileReader.addEventListener('loadend', () => {
        loadingFrame.classList.add("no-visible");
    });
    printButton.addEventListener('click', printDocument);
    processFile.addEventListener('click', loadFile);
    tableBody.addEventListener('click', dataClick);
    
    // *********************************************************
    // Auto seleccionar el dia de la semana correspondiente para el 'estado'
    switch (weekDay.getDay()) {
        case 1:
        case 4:
            document.getElementById(ESTATE_ONE).checked = true;
            break;
        case 2:
        case 5:
            document.getElementById(ESTATE_TWO).checked = true;
            break;
        case 3: 
        case 6:
            document.getElementById(ESTATE_THREE).checked = true;
            break;
        default:
            console.log("es Domingo?");
    }

    // *********************************************************
    // Encontrar el radio button del 'estado' seleccionado
    function estateSelected() {
        for (let i = 0; i < radioButtons.length; i++) {
            if(radioButtons[i].checked) {
                return radioButtons[i].value;
            }
        }
        return null;
    }
    
    // *********************************************************
    function openFile(evento) {
        console.clear();
        let file = evento.target.files[0];

        file = verifyTextFile(file);
        if(!file) {            
            return;
        }

        fileReader.readAsText(file);
        document.getElementById("upload-file-b").innerText = file.name;
        // fileReader.onload = loadFile;
    }

    // *********************************************************
    // Funcion para visualizar el estado de carga del archivo 
    function loadingInfo(evento) {
            if (evento.loaded && evento.total) {
                const percent = (evento.loaded / evento.total) * 100;
                const loaded = (`Cargando... ${Math.round(percent)}%`);
                loading.innerText = loaded;
            }
    }

    // *********************************************************
    function loadFile() {
        if (contentOriginal.length <= 0) {
            if(!readDataFromFile()) { 
                return;
            }
            filterColumns();
            // console.log("filtrar columnas", content.length);
            contentOriginal = verifySalesMethodTwo();
            // console.log("verificado metodo de ventas 2: ", contentOriginal.length);
        }

        content = contentOriginal;

        let estate = estateSelected();
        if(!estate) {
            console.log("Error en la seleccion del dia de la semana(estado).");
            return;
        }

        processContent(estate);
        showContent();
    }

    // *********************************************************
    // Carga la info del archivo en memoria
    function readDataFromFile () {
        if (!fileReader.result) {
            console.log("Primero debe seleccionar un archivo.");
            alert("Primero debe seleccionar un archivo.");
            return false;
        }

        let rows = fileReader.result.split('\n');
        let columns = [];
        contentOriginal = [];
        rows.forEach(row => {
            columns = row.split('\t');
            contentOriginal.push(columns);
        });

        if(!validateContent(contentOriginal[0])) {
            console.log("El contenido del archivo NO tiene formato válido.");
            alert("El contenido del archivo NO tiene formato válido.");
            return false;
        }

        console.log("***********************************");
        console.log("Total filas iniciales: " + contentOriginal.length);
        deleteEmptyFinalLines(contentOriginal[0].length);
        // Eliminar los encabezados
        contentOriginal.shift();
        console.log("Encabezados eliminados: " + contentOriginal.length);
        return true;
    }

    // *********************************************************
    // Verifica el archivo seleccionado        
    function verifyTextFile(file) {
        if (!file) {
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
        return file;
    }

    // *********************************************************
    // Verificar la estructura de la informacion en el archivo
    function validateContent(arrayRow) {
        if (arrayRow[0].trim() == "HFB" && 
            arrayRow[2].trim() == "ARTNO" && 
            arrayRow[3].trim() == "ARTNAME_UNICODE" && 
            arrayRow[6].trim() == "SALESMETHOD" &&
            arrayRow[5].trim() == "AVGSALES" &&
            arrayRow[10].trim() == "AVAILABLESTOCK" &&
            arrayRow[18].trim() == "SLID_H" ) {
                return true;
        } 
        return false;
    }
    
    // *********************************************************
    // Elimina todas las lineas no validas del final de archivo.
    function deleteEmptyFinalLines(totalColumns) {
        // console.log("deleteEmptyFinalLines");
        if (contentOriginal[contentOriginal.length - 1].length < totalColumns) {
            contentOriginal.pop();
            deleteEmptyFinalLines(totalColumns);
        }
    }

    // *********************************************************
    function filterColumns() {
        let stockControlData = [];
        for (let row = 0; row < contentOriginal.length; row++) {
        // (hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) rotationRatio
            const stock = new StockControl(contentOriginal[row][0].trim(), 
                                            contentOriginal[row][2].trim(),
                                            contentOriginal[row][3].trim(),
                                            contentOriginal[row][6].trim(),
                                            contentOriginal[row][5].trim(),
                                            contentOriginal[row][10].trim(),
                                            contentOriginal[row][18].trim() ); 
            stockControlData.push(stock);
        }
        contentOriginal = stockControlData;
    }
    
    // *********************************************************
    // Verificar y eliminar cualquier objeto con metodo de venta diferente de '2'
    function verifySalesMethodTwo() {
        return contentOriginal.filter( (row) => {return row.salesMethod == 2 } );
    }

    // *********************************************************
    // Seleccionar la logica dependiendo del 'estado' seleccioando
    function processContent(estate) {
        console.log("Estado seleccionado: " + estate);
        switch (estate) {
            case ESTATE_ONE:
                content = removeHFB_Kitchens();
                console.log("removeHFB_Kitchens", content.length);

                content = filterAvgSales_MoreThanCero();
                console.log("filterAvgSales_MoreThanCero", content.length);

                content = filterAvailableStock_MoreThanCero();
                console.log("filterAvailableStock_MoreThanCero", content.length);

                divideAvailableStockByAvgSales();

                content = filterRotationRatio_MoreThanOne();
                console.log("filterRotationRatio_MoreThanOne", content.length);

                orderBySalesLocationLV();
                break;
            case ESTATE_TWO:
                content = selectOnlyHFB_Kitchens();
                console.log("selectOnlyHFB_Kitchens", content.length);

                content = filterAvgSales_MoreThanCero();
                console.log("filterAvgSales_MoreThanCero", content.length);

                content = filterAvailableStock_MoreThanCero();
                console.log("filterAvailableStock_MoreThanCero", content.length);

                divideAvailableStockByAvgSales();

                content = filterRotationRatio_MoreThanOne();
                console.log("filterRotationRatio_MoreThanOne", content.length);

                orderBySalesLocationLV();
                break;
            case ESTATE_THREE:
                content = filterAvgSales_LessThanEqualOne();
                console.log("filterAvgSales_LessThanEqualOne", content.length);

                content = filterAvailableStock_OnlyEqualOne();
                console.log("filterAvailableStock_OnlyEqualOne", content.length);

                orderBySalesLocationLV();
                break;
        
            default:
                console.log("Error inesperado, actualice la pagina.");
                alert("Error inesperado, actualice la pagina.");
                return;
        }
    }
    
    // *********************************************************
    // Eliminar objetos con 'AVG_SALES' > 0
    function filterAvgSales_MoreThanCero() {
        return content.filter( row => { return row.avgSales > 0  } );
    }

    // *********************************************************
    // Filtrar objetos con 'AVG_SALES' <= 1
    function filterAvgSales_LessThanEqualOne () {
        return content.filter( row => { return row.avgSales <= 1 });
    }

    // *********************************************************
    // Eliminar objetos con 'AVAILABLE_STOCK' > 0
    function filterAvailableStock_MoreThanCero() {
        return content.filter( row => { return row.availableStock > 0  } );
    }
    
    // *********************************************************
    // Eliminar objetos con 'AVAILABLE_STOCK' !== 1
    function filterAvailableStock_OnlyEqualOne() {
        return content.filter( row => { return row.availableStock === 1 });
    }

    // *********************************************************
    // Remover objetos con FHB == 07
    function removeHFB_Kitchens() {
        return content.filter( row => {return row.hfb !== 7 } );
    }

    // *********************************************************
    // Remueve TODOS los objetos MENOS los de 'HFB' == 07
    function selectOnlyHFB_Kitchens() {
        return content.filter( row => { return row.hfb === 7 });
    }

    // *********************************************************
    // Calcula el valor de dividir 'AVAILABLE_STOCK' / 'AVG_SALES'
    function divideAvailableStockByAvgSales() {
        for (const row of content) {
            row.rotationRatio = row.availableStock / row.avgSales;
        }
    }

    // *********************************************************
    // Eliminar todos los obj con 'rotationRatio' > 1
    function filterRotationRatio_MoreThanOne() {
        return content.filter( row => { return row.rotationRatio <= 1 })
    }

    // *********************************************************
    // Funcion para encontrar un elemento segun su 'Art Number'
    function findArticleNumber() {
        return this.articleNumber === BUSQUEDA;
    }

    // *********************************************************
    // Ordenar el array de obj x el lugar de venta
    function orderBySalesLocationLV() {
        content.sort((x, y) => x.salesLocationLV.localeCompare(y.salesLocationLV));
    }

    // *********************************************************
    function showContent() {
        // Limpiar o inicializar valores para la tabla, en los datos y en la vista
        tableBody.innerHTML = "";
        let dataTableBody = "";
        let count = 1;

        content.forEach(row => {
            dataTableBody += "<tr class=''>";
            dataTableBody += "<td class='centrar'>";
            dataTableBody += count;
            dataTableBody += "</td>";
            dataTableBody += "<td class='centrar'>";
            dataTableBody += row.hfb;
            dataTableBody += "</td>";
            dataTableBody += "<td>";
            dataTableBody += row.articleName;
            dataTableBody += "</td>"; 
            dataTableBody += "<td class='centrar'>";
            dataTableBody += row.availableStock;
            dataTableBody += "</td>"; 
            dataTableBody += "<td>";
            dataTableBody += row.articleNumber;
            dataTableBody += "</td>";
            dataTableBody += "<td data-index='" + (count -1) + "' data-article-number='" + row.articleNumber + "' data-sales-location='" + row.salesLocationLV + "' class='centrar' contentEditable=true onblur='javascript:removeRowSelection(this)' onchange='javascript:changeRowData(this)'>";
            dataTableBody += row.salesLocationLV;
            dataTableBody += "</td>";
            dataTableBody += "</tr>";
            count++;
        });
        
        tableBody.innerHTML += dataTableBody;
    }

    // *********************************************************
    // Reordena el contenido por la columna 'Lugar de Venta' e imprime el documento
    function printDocument() {
        orderBySalesLocationLV();
        showContent();
        window.print();
    }

    // *********************************************************
    function dataClick(evento) {
        const element = evento.srcElement;
        if(element.dataset.articleNumber) {
            element.parentElement.classList.add("editable");
        }
    }

    // *********************************************************
    function removeRowSelection(element){
        console.log("Evento blur");
        if (element.textContent !== element.dataset.salesLocation) {
            if(content[element.dataset.index].articleNumber !== element.dataset.articleNumber ) {
                console.log("Ocurrió un error al actualizar la información");
                alert("Ocurrió un error al actualizar la información");
                return;
            }
            // console.log("Elemento: ", content[element.dataset.index]);
            content[element.dataset.index].salesLocationLV = element.textContent;
        }
        element.parentElement.classList.remove("editable");
    }
    
    // *********************************************************
