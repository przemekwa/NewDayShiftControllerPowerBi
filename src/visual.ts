

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
    export interface DataRow {
        Date: Date,
        TaskId: string,
        Name: string
    }
    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;

        constructor(options: VisualConstructorOptions) {



            console.log('Visual constructor', options);
            this.target = options.element;
            this.target.innerHTML = "";
            this.updateCount = 0;

            jQuery(this.target).ready(() => {
                console.log("Dokument ready")

            });
        }

        public update(options: VisualUpdateOptions) {
            let allData: Array<DataRow> = [];
            this.target.innerHTML = "";

            options.dataViews[0].table.rows.forEach(element => {
                let date = new Date(element[3].toString() + "-" + element[2].toString() + "-" + element[0].toString());
                let obj: DataRow = { Date: date, TaskId: element[5].toString(), Name: element[4].toString() };
                allData.push(obj);
            });

            console.log("Działa2?")

            var d = allData.filter(element => this.CheckS11(element, 1, 5)).length;

            let groupByDate = this.GroupBy(allData, "Date") as Array<any>;

            for (var propertyName in groupByDate) {

                var date = new Date(propertyName);

                var value = groupByDate[propertyName] as Array<DataRow>;

                console.log(value.length);


                console.log(this.getFormattedDate(date));
            }










            switch (d) {
                case 0:
                    this.target.innerHTML += "<div class='taskBlock few'>S11 </div>"
                    break;
                case 1:
                    this.target.innerHTML += "<div class='taskBlock good'>S11</div>"
                    break;
                default:
                    this.target.innerHTML += "<div class='taskBlock lot'>S11</div>"
            }


            //   console.log(allDate.filter((element)=>element.Day == "21").length)
            console.log(jQuery().jquery)


            console.log(jQuery(this.target).html())
        }


        private GroupBy(xs: Array<DataRow>, key: any): any {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }

        private CheckS11(row: DataRow, dayFrom: number, dayTo: number): boolean {
            if (row.TaskId === "S11") {

                var day = row.Date.getDay();

                if (day => dayFrom && day <= dayTo) {
                    return true;
                }
            }
            return false;
        }

        private getFormattedDate(date) {
            var year = date.getFullYear();
            var month = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var day = date.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            return day + '-' + month + '-' + year;
        }
    }
}