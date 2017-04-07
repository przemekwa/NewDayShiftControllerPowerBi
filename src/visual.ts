/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */




module powerbi.extensibility.visual {
     
     export interface DataRows {
    Year: string;
    Day: string;
    Month: string;


}

    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.target = options.element;
            this.updateCount = 0;

            jQuery(this.target).ready(()=>{
                console.log("Dokument ready")
            });
        }

        public update(options: VisualUpdateOptions) {
            console.log('Visual update', options);
            
            let allDate:Array<DataRows> = [];
            
            options.dataViews[0].table.rows.forEach(element => {
                
                let  obj:DataRows = { Day: element[3].toString(), Year: element[0].toString(), Month: element[2].toString() };

                allDate.push(obj);


                // console.log(obj);
               
            });

              console.log(allDate.filter((element)=>element.Day == "21").length)
            
            
            console.log(jQuery().jquery)






            this.target.innerHTML = ""
            console.log(jQuery(this.target).html())
        }
    }
}