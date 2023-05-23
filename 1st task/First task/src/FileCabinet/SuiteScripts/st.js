/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(
    ['N/search', 'N/ui/serverWidget'],
    /**
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{log} log
     */
    (search, serverWidget) => {
      const itemSearch = (filters, quantity) => {
        return search.create({ // 21: Argentina
            type: "item",
            filters,
            columns:
            [
               search.createColumn({name: "itemid", sort: search.Sort.ASC, label: "Name"}),
               search.createColumn({name: "vendorname", label: "Vendor Name"}),
               search.createColumn({name: "subsidiary", label: "Subsidiary"}),
               search.createColumn({name: "manufacturer", label: "Manufacturer"})
            ]
         });
      };

      const setTransactionsInSublist = (sublist, subsidiary, manufacturer, quantity) => {
        const filters = [
            ['subsidiary','ANYOF',subsidiary],
         ];
        if(manufacturer) {
            filters.push('AND');
            filters.push(['manufacturer','IS',manufacturer])
        };       

        const itemSearchObj = itemSearch(filters, quantity);
        let sublistLine = 0; //.getRange({start: 0, end: 1000})
        itemSearchObj.run().each((result) => {

            sublist.setSublistValue({
                id: 'custpage_item_id',
                line: sublistLine,
                value: result.id,
            });
            
            const itemName = result.getValue({
                name: 'itemid',
            });

            sublist.setSublistValue({
                id: 'custpage_item_name',
                line: sublistLine,
                value: itemName,
            });

            const vendorName = result.getValue({
                name: 'vendorname',
            }) || "no data";
            sublist.setSublistValue({
                id: 'custpage_vendor_name',
                line: sublistLine,
                value: vendorName,
            });

            const subsidiary = result.getText({
                name: 'subsidiary',
            }) || "no data";
            sublist.setSublistValue({
                id: 'custpage_subsidiary',
                line: sublistLine,
                value: subsidiary,
            });

            const manuf = result.getValue({
                name: 'manufacturer',
            }) || "no data";

            sublist.setSublistValue({
                id: 'custpage_manufacturer',
                line: sublistLine,
                value: manuf,
            })
            sublistLine ++;
            if(sublistLine == 1000) return;
            return true;
         })
    };


      const onRequest = (scriptContext) => {
        const { parameters } = scriptContext.request;
        const thisForm = serverWidget.createForm({
          title: 'Item manager',
        });
        
        thisForm.clientScriptModulePath = './cl.js';

        thisForm.addButton({
        id: 'custpage_generate_txt_btn',
        label: 'Generate Report',
        functionName: 'generateTxt',
      });

        const thisSublist = thisForm.addSublist({
          id: 'custpage_txt_sublist',
          label: 'Preview',
          type: 'LIST',
        });

        thisSublist.addField({
            id: 'custpage_item_id',
            label: 'ID',
            type: 'TEXT',
        });

          thisSublist.addField({
            id: 'custpage_item_name',
            label: 'ITEM NAME/NUMBER',
            type: 'TEXT',
        });

        thisSublist.addField({
            id: 'custpage_vendor_name',
            label: 'VENDOR NAME/CODE',
            type: 'TEXT',
        });

        thisSublist.addField({
            id: 'custpage_subsidiary',
            label: 'SUBSIDIARY',
            type: 'TEXT',
        });

        thisSublist.addField({
            id: 'custpage_manufacturer',
            label: 'MANUFACTURER',
            type: 'TEXT',
        });

        thisSublist.addField({
            id: 'custpage_include_in_report',
            label: 'INCLUDE IN REPORT',
            type: 'CHECKBOX',
        }).defaultValue = 'T';

        thisForm.addFieldGroup({
            id: 'custpage_ism_filters_group',
            label: 'Filters',
        });

        const filterSubsidiary = thisForm.addField({
            id: 'custpage_filter_subsidiary',
            label: 'SUBSIDIARY',
            type: 'TEXT',
            container: 'custpage_ism_filters_group',
          }).updateDisplaySize({
            height: 10,
            width: 40,
          });

        setTransactionsInSublist(thisSublist, '21', 'Pure', 1000);

        scriptContext.response.writePage({
          pageObject: thisForm,
        });
      };
      return { onRequest };
    },
  );
  