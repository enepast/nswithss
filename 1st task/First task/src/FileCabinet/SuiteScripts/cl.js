/**
 * @NApiVersion 2.1
 * @NAmdConfig /SuiteScripts/Adistec - ISM/ISM - Global Libraries/ism_global_paths.json
 */
define(
    ['N/currentRecord', 'swal'],
  
    (currentRecord, swal) => {
      async function download(filename, data) {
        const element = document.createElement('a');
        // remove the square brackets around data; it's already an array
        const text = data;
        const encoding = 'latin1'; // a.k.a ANSI
        const utf8_blob = new Blob([text], { type: 'text/csv;charset=windows-1252;' });
        const utf_8_txt = await utf8_blob.text();
        const encoder = new TextEncoder(encoding, {
          NONSTANDARD_allowLegacyEncoding: true,
        });
        const dataFile = encoder.encode(utf_8_txt); // now `data` is an Uint8Array
        const file = new Blob([dataFile]);
  
        element.href = URL.createObjectURL(file);
        element.download = filename;
        window.elementToDownload = element;
        element.click();
      }
  
      function pageInit() {
      }
  
      async function generateTxt() {
        await swal.fire({
          type: 'info',
          allowOutsideClick: false,
          title: 'Notification',
          html: 'This is an UTF-8 report. In case that you need ANSI, you must do it manually',
          footer: '<sup>If you need help, please contact to IT</sup>',
        });
  
        swal.fire({
          onBeforeOpen: swal.showLoading,
          async onOpen() {
            const cRecord = currentRecord.get();
            const allLines = cRecord.getLineCount({
              sublistId: 'custpage_txt_sublist',
            });
            let reportString = '';
            
            for (let index = 0; index < allLines; index++) {
              const includedLine = cRecord.getSublistValue({
                sublistId: 'custpage_txt_sublist',
                fieldId: 'custpage_include_in_report',
                line: index,
              });
  
              if (!includedLine) { continue; }
              const sublistId = 'custpage_txt_sublist';
              const fields = [
                'custpage_item_id',
                'custpage_item_name',
                'custpage_vendor_name',
                'custpage_subsidiary',
                'custpage_manufacturer',
              ];
  
              const lineArray = fields.map(field => cRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: field,
                line: index,
              }));
  
              const stringLine = lineArray.join('');
              reportString += `${stringLine}\n`;
            }
            const fileName = `report-item`;
  
            if (reportString === '') {
              swal.fire({
                type: 'error',
                title: 'Notification',
                html: 'You must select at least one line to generate a report.',
              });
              return;
            }
  
            download(fileName, reportString);
            swal.close();
            swal.fire({
              type: 'success',
              title: 'Notification',
              html: 'Reporte generated succesfully',
              footer: 'You can download it again &nbsp;<a href=# onclick="elementToDownload.click()">here</a>',
            });
            // ---------------------------------------------------
          },
        });
      }
  
      return {
        generateTxt,
        pageInit,
      };
    },
  );
  