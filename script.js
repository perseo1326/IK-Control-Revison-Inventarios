
'use strict';

class StockControl {
    constructor(hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) {
        this.hfb = Number (hfb);
        this.setArticleNumber(articleNumber);
        this.articleName = articleName.trim();
        this.salesMethod = Number (salesMethod);
        this.avgSales = Number (avgSales);
        this.availableStock = Number (availableStock);
        this.salesLocationLV = salesLocationLV.trim();
        this.rotationRatio = 0;
    }

    setArticleNumber(value) {
        let string = String (value);
        this.articleNumber = string.padStart(8, '0');
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
    
    const VERSION = "2.0";
    const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const EXCEL_EXTENSION_FILE = ".xlsm";

    const WORKING_SHEET         = "Data";
    const HFB                   = "HFB";
    const ARTICLE_NUMBER        = "ARTNO";
    const ARTICLE_NAME          = "ARTNAME_UNICODE";
    const AVGSALES              = "AVGSALES";
    const SALES_LOCATION        = "SLID_H";
    const SALES_METHOD          = "SALESMETHOD";
    const AVAILABLE_STOCK       = "AVAILABLESTOCK";

    const ESTATE_ONE            = 'estateOne';
    const ESTATE_TWO            = 'estateTwo';
    const ESTATE_THREE          = 'estateThree';

    const FICTICIOUS_LOCATION = "is-fictitious-location";
    const pattern1 = /950150/;
    const pattern2 = /950250/;
    const pattern3 = /[a-z]/i;

    // GLOBAL variables
    let originalContent = [];
    let cleanData = [];

    // *********************************************************
    // EVENT LISTENERS

    fileSelector.addEventListener('change', openFile); 
    processFile.addEventListener('click', processData);
    printButton.addEventListener('click', printDocument);

    tableBody.addEventListener('click', dataClickEdit_In);
    tableBody.addEventListener('focusout', dataClickEdit_Out);
    
    window.onload = function(){
        // TODO: inicializar la pagina al cargarla 
        try {
            initializePage();
        } catch (error) {
            console.log("ERROR ONLOAD: ", error);
            alert(error.message);
        }
    }

    // *********************************************************
    // Auto seleccionar el dia de la semana correspondiente para el 'estado'
    function autoSelectDay () {
        let weekDay = new Date();
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
    }

    // *********************************************************
    function initializePage(){
        cleanData = originalContent = [];
        document.title = "Previsión Excesos en el Full(v" + VERSION +")";
        document.getElementById("version-titulo").innerText = "(v" + VERSION + ")";
        document.getElementById("version-footer").innerText = "Versión " + VERSION + " - (https://github.com/perseo1326/IK-Control-Revison-Inventarios.git)";
        console.log("Versión: ", VERSION);

        loadingFrame.classList.add("no-visible");
        document.getElementById("upload-file-b").innerText = "Subir archivo...";
        autoSelectDay();
    }

    // *********************************************************
    function openFile(evento) {
        
        try {
            let file = evento.target.files[0];
            loadingFrame.classList.remove("no-visible");

            let excelFile = new ExcelFileOpen(file);
            loadReportsExcel(excelFile);

        } catch (error) {
            console.log("ERROR:openFile: ", error);
            alert(error.message);
            initializePage();
        }
    }

    // *********************************************************
    function loadReportsExcel (excelFile){

        let fileReader = new FileReader();

        fileReader.readAsArrayBuffer(excelFile.file);
        fileReader.onload =  function(){
            try {
                let buffer = this.result;
                let workbook =  XLSX.read(buffer);
                let contentFile =  XLSX.utils.sheet_to_row_object_array(workbook.Sheets[WORKING_SHEET]);

                // process and clean info from the file
                let arrayExcel = readReportsExcel(excelFile.file, contentFile);
                console.log("Carga \"" + excelFile.file.name + "\" Finalizada!", arrayExcel); 
                document.getElementById("upload-file-b").innerText = excelFile.file.name;

                arrayExcel = filterSalesMethodTwo(arrayExcel);

                originalContent = createStockControlObjects(arrayExcel);
                loadingFrame.classList.add("no-visible");
                processFile.classList.remove("disable");
                processFile.disabled = false;

            } catch (error) {
                console.log("ERROR:", error);
                alert(error.message);
                window.onload();
                return;
            }
        };
    }
    
    // *********************************************************
    // function to create an array of 'StockControl' objects and remove extra and unneeded info
    function createStockControlObjects( excelDataArray ) {
        let dataArray = [];
        excelDataArray.forEach( row => {
            let product = new StockControl(row[HFB], 
                                            row[ARTICLE_NUMBER], 
                                            row[ARTICLE_NAME], 
                                            row[SALES_METHOD], 
                                            row[AVGSALES], 
                                            row[AVAILABLE_STOCK], 
                                            row[SALES_LOCATION] );
            
            dataArray.push(product);
        });

        return dataArray;
    }

    // *********************************************************
    // Filter only rows with sales method = 2
    function filterSalesMethodTwo(dataArray) {
        return dataArray.filter( (row) => {return row[SALES_METHOD] === 2 } );
    }
    
    // *********************************************************
    function processData() {

        try {
            let state = estateSelected();
            if(state === undefined){
                console.log("ERROR:processData: Error en la seleccion del dia de la semana(estado).");
                throw new Error("Error en la seleccion del dia de la semana(estado).");
            }

            cleanData = processContent(state, originalContent);
            showContent(cleanData);

            printButton.classList.remove("disable");
            printButton.disabled = false;

        } catch (error) {
            console.log(error);
            alert(error.message);            
        }
    }

    // *********************************************************
    // Encontrar el radio button del 'estado' seleccionado
    function estateSelected() {
        for (let i = 0; i < radioButtons.length; i++) {
            if(radioButtons[i].checked) {
                return radioButtons[i].value;
            }
        }
        return undefined;
    }

    // *********************************************************
    // Seleccionar la logica dependiendo del 'estado' seleccioando
    function processContent(state, dataArray) {
        let content = [];

        switch (state) {
            case ESTATE_ONE:
                content = removeHFB_Kitchens(dataArray);
                console.log("removeHFB_Kitchens", content.length);

                content = filterAvgSales_MoreThanCero(content);
                console.log("filterAvgSales_MoreThanCero", content.length);

                content = filterAvailableStock_MoreThanCero(content);
                console.log("filterAvailableStock_MoreThanCero", content.length);

                divideAvailableStockByAvgSales(content);

                content = filterRotationRatio_MoreThanOne(content);
                console.log("filterRotationRatio_MoreThanOne", content.length);

                content = orderBySalesLocationLV(content);
                break;

            case ESTATE_TWO:
                content = selectOnlyHFB_Kitchens(dataArray);
                console.log("selectOnlyHFB_Kitchens", content.length);

                content = filterAvgSales_MoreThanCero(content);
                console.log("filterAvgSales_MoreThanCero", content.length);

                content = filterAvailableStock_MoreThanCero(content);
                console.log("filterAvailableStock_MoreThanCero", content.length);

                divideAvailableStockByAvgSales(content);

                content = filterRotationRatio_MoreThanOne(content);
                console.log("filterRotationRatio_MoreThanOne", content.length);

                content = orderBySalesLocationLV(content);
                break;

            case ESTATE_THREE:
                content = filterAvgSales_LessThanEqualOne(dataArray);
                console.log("filterAvgSales_LessThanEqualOne", content.length);

                content = filterAvailableStock_OnlyEqualOne(content);
                console.log("filterAvailableStock_OnlyEqualOne", content.length);

                content = orderBySalesLocationLV(content);
                break;
        
            default:
                console.log("ERROR:processContent: Error inesperado, actualice la pagina.");
                throw new Error("Error inesperado, actualice la pagina.");
        }

        return content;
    }

    // *********************************************************
    // Remover objetos con FHB == 07
    function removeHFB_Kitchens(array) {
        return array.filter( row => { return row.hfb !== 7 } );
    }

    // *********************************************************
    // Eliminar objetos con 'AVG_SALES' > 0
    function filterAvgSales_MoreThanCero(array) {
        return array.filter( row => { return row.avgSales > 0  } );
    }

    // *********************************************************
    // Eliminar objetos con 'AVAILABLE_STOCK' > 0
    function filterAvailableStock_MoreThanCero(array) {
        return array.filter( row => { return row.availableStock > 0  } );
    }

    // *********************************************************
    // Calcula el valor de dividir 'AVAILABLE_STOCK' / 'AVG_SALES'
    function divideAvailableStockByAvgSales(array) {
        for (const row of array) {
            if(row.avgSales !== 0 ){
                row.rotationRatio = row.availableStock / row.avgSales;
            }
        }
    }

    // *********************************************************
    // Eliminar todos los obj con 'rotationRatio' > 1
    function filterRotationRatio_MoreThanOne(dataArray) {
        return dataArray.filter( row => { return row.rotationRatio < 1 })
    }

    // *********************************************************
    // Remueve TODOS los objetos MENOS los de 'HFB' == 07
    function selectOnlyHFB_Kitchens(dataArray) {
        return dataArray.filter( row => { return row.hfb === 7 });
    }

    // *********************************************************
    // Filtrar objetos con 'AVG_SALES' <= 1
    function filterAvgSales_LessThanEqualOne (dataArray) {
        return dataArray.filter( row => { return row.avgSales <= 1 });
    }

    // *********************************************************
    // Eliminar objetos con 'AVAILABLE_STOCK' !== 1
    function filterAvailableStock_OnlyEqualOne(dataArray) {
        return dataArray.filter( row => { return row.availableStock === 1 });
    }

    // *********************************************************
    // Ordenar el array de obj x el lugar de venta
    function orderBySalesLocationLV(dataArray) {
        return dataArray.sort((x, y) => x.salesLocationLV.localeCompare(y.salesLocationLV));
    }

    // *********************************************************
    // Reordena el contenido por la columna 'Lugar de Venta' e imprime el documento
    function printDocument() {
        console.log("printing document...");
        cleanData = orderBySalesLocationLV(cleanData);
        showContent(cleanData);
        window.print();
    }

    // *********************************************************
    function showContent(dataArray) {
        // Inicializar valores para la tabla, en los datos y en la vista
        tableBody.innerHTML = "";
        let dataTableBody = "";
        let counter = 1;

        dataArray.forEach(row => { 
            dataTableBody += drawRow(row, counter);
            counter++;
        });
        
        tableBody.innerHTML += dataTableBody;
    }

    // *********************************************************
    function drawRow(row, count ) {
        let htmlRow = "";
        let classFictitiousLocation = "";
        // console.log("Show Content -> Row : ", row);

        htmlRow += "<tr class=''>";
        htmlRow += "<td class='centrar'>";
        htmlRow += count;
        htmlRow += "</td>";
        htmlRow += "<td class='centrar'>";
        htmlRow += row.hfb;
        htmlRow += "</td>";
        htmlRow += "<td><p class='text-print-overflow-hidden'>";
        htmlRow += row.articleName;
        htmlRow += "</p></td>"; 
        htmlRow += "<td class='centrar'>";
        htmlRow += row.availableStock;
        htmlRow += "</td>"; 
        htmlRow += "<td>";
        htmlRow += "<input type='text' class='unstyle' value='";
        htmlRow += row.articleNumber;
        htmlRow += "' readonly />";
        htmlRow += "</td>";
        if(isFictitiousLocation(row.salesLocationLV)) {
            classFictitiousLocation = FICTICIOUS_LOCATION;
        } 
        htmlRow += "<td class='centrar' >";
        htmlRow += "<input type='text' name='' class='unstyle " + classFictitiousLocation + "' id='" + (count - 1) + "' ";
        htmlRow += "value='" + row.salesLocationLV + "' ";
        htmlRow += " />";
        htmlRow += "</td>";
        htmlRow += "</tr>";

        return htmlRow;
    }

    // *********************************************************
    // funcion para "señalar" cuales ubicaciones ficticias deben ser actualizadas 
    function isFictitiousLocation(salesLocation) {
        
        // pattern1, pattern2 y pattern3 estan definidas como constantes al inicio
        if(!salesLocation ||
            pattern1.test(salesLocation) || 
            pattern2.test(salesLocation) || 
            pattern3.test(salesLocation)) {
                return true;
        }
        return false;
    }

    // *********************************************************
    function dataClickEdit_In(evento) {

        const element = evento.srcElement;
        if(element.tagName === "INPUT" && element.classList.contains("unstyle") && element.classList.contains(FICTICIOUS_LOCATION) ) {
            element.parentElement.parentElement.classList.add("editable");
        }
    }

    // *********************************************************
    function dataClickEdit_Out(evento) {

        const element = evento.srcElement;
        if(element.tagName === "INPUT" && element.classList.contains("unstyle") && element.classList.contains(FICTICIOUS_LOCATION) ) {
            element.parentElement.parentElement.classList.remove("editable");
            updateNewLocation(element.id, element.value);
            if( !isFictitiousLocation( element.value ) ) {
                element.classList.remove(FICTICIOUS_LOCATION);
                element.readOnly = true;
            }
        }
    }

    // *********************************************************
    function updateNewLocation(position, value) {
        if(cleanData[position].salesLocationLV !== value) {
            cleanData[position].salesLocationLV = value;
        }
    }

    // *********************************************************
