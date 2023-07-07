
'use strict';

class ExcelFileOpen {

    constructor(pointerFile) {
        if(!pointerFile) {
            console.log("ERROR:ExcelFileOpen: No se ha seleccionado ningun archivo.");
            throw new Error("No se ha seleccionado ningun archivo.");
        }

        this.file = pointerFile;
    }
}


    // *********************************************************
    // Verify the valid structure of data readed from the file based on the headers of info
    function validateContentExcel(dataRows) {
        
        if(dataRows === undefined || dataRows.length <= 0 ) {
            return false;
        }

        if(
            dataRows[0][HFB] === undefined ||
            dataRows[0][ARTICLE_NUMBER] === undefined || 
            dataRows[dataRows.length - 1][AVGSALES] === undefined ||
            dataRows[dataRows.length - 1][SALES_LOCATION] === undefined ||
            dataRows[dataRows.length - 1][SALES_METHOD] === undefined ||
            dataRows[dataRows.length - 1][AVAILABLE_STOCK] === undefined ) {
            return false;
        }
    
        return true;
    }


    // *********************************************************
    // Check and remove all elements with "Order Type" different that "PUP"
    function filterOrderTypeOnlyPUP(dataArray) {
        return dataArray.filter( (row) => { 
            return row[ORDER_TYPE_EXCEL].trim() === ORDER_TYPE_DATA;
        } );
    }
    

    // *********************************************************
    function readReportsExcel(file, fileDataArray) {

        let excelDataArray = fileDataArray;

        // check the file type
        if(file === undefined || (!file.name.toLowerCase().endsWith(EXCEL_EXTENSION_FILE) && file.type !== EXCEL_MIME_TYPE) ) {
            console.log("ERROR:readReportsExcel: El archivo \"" + file.name + "\" NO es válido.");
            throw new Error("El archivo \"" + file.name + "\" NO es válido.");
        }

        // Validate the format of the file and data structure
        if(!validateContentExcel(excelDataArray)) {
            console.log("ERROR:readReportsExcel: Contenido del archivo NO válido.");
            throw new Error("Contenido del archivo NO válido.");
        }
        
        // excelDataArray = filterOrderTypeOnlyPUP(excelDataArray);

        return excelDataArray;
    }


    // *********************************************************
    function mappingArrayDataExcel(dataArrayExcel) {

        let orderDetailsMap = new Map();
        dataArrayExcel.forEach(rowData => {
            
            if(!orderDetailsMap.has(rowData[ISELL])) {
                let orderDetail = new OrderDetail(rowData[ISELL]);
                orderDetailsMap.set(rowData[ISELL], orderDetail);
            }
            
            let producto = new Product(rowData);
            let orderDetailObject = orderDetailsMap.get(rowData[ISELL]);

            orderDetailObject.addProduct(producto, rowData[PICK_AREA]);
            orderDetailsMap.set(orderDetailObject.isell, orderDetailObject);
        });
        
        return orderDetailsMap;
    }
