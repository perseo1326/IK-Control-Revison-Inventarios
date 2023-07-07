

class StockControl {
    constructor(hfb, articleNumber, articleName, salesMethod, avgSales, availableStock, salesLocationLV) {
        this.hfb = Number (hfb);
        this.articleNumber = articleNumber;
        this.articleName = articleName.trim();
        this.salesMethod = Number (salesMethod);
        this.avgSales = Number (avgSales);
        this.availableStock = Number (availableStock);
        this.salesLocationLV = salesLocationLV.trim();
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


    const ESTATE_ONE = 'estateOne';
    const ESTATE_TWO = 'estateTwo';
    const ESTATE_THREE = 'estateThree';
    // constante NECESARIA si se Uglify el codigo
    // const SALES_LOCATION = "salesLocation";
    // const ARTICLE_NUMBER = "articleNumber";

    // const fileReader = new FileReader();
    let dataContent = [];

    fileSelector.addEventListener('change', openFile); 
    processFile.addEventListener('click', processData);
    printButton.addEventListener('click', printDocument);


    // tableBody.addEventListener('click', dataClick);
    // tableBody.addEventListener('focusout', removeRowSelection);
    
    window.onload = function(){
        // TODO: inicializar la pagina al cargarla 
        try {
            console.log("Versión: ", VERSION);
            document.getElementById("version-titulo").innerText = "(v" + VERSION + ")";
            document.getElementById("version-footer").innerText = "Versión " + VERSION + " - (https://github.com/perseo1326/IK-Control-Revison-Inventarios.git)";
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
        dataContent = [];
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

                dataContent = createStockControlObjects(arrayExcel);
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
            // console.log("product : ", product);
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

        console.log("process data!");   

    }





    // *********************************************************
    // Reordena el contenido por la columna 'Lugar de Venta' e imprime el documento
    function printDocument() {
        console.log("print document!!");
        // orderBySalesLocationLV();
        // showContent();
        // window.print();
    }




