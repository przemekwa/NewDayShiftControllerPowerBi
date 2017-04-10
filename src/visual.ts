

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


            let groupByDate = this.GroupBy(allData, "Date") as Array<any>;

            let htmlOutput = `<div class="container">
  <div class="panel-group">
    <div class="panel panel-default">
      <div class="panel-heading">Zmiany</div>
      <div class="panel-body">
       <table class="table table-striped">
    <thead>
      <tr>
        <th>Data</th>
        <th>S11</th>
        <th>S12</th>
        <th>S14</th>
        <th>S16</th>
        <th>S15</th>
        <th>S21</th>
        <th>S22</th>
        <th>S23</th>
      </tr>
    </thead>
    <tbody>`

    console.log(groupByDate);

            for (var propertyName in groupByDate) {

                var date = new Date(propertyName);

                htmlOutput += "<tr><td>" + this.getFormattedDate(date) + "</td>"





                htmlOutput += this.getTdTag(this.CheckTask1Shft(groupByDate[propertyName] as Array<DataRow>, "S11", 1,5));

                htmlOutput +=  this.getTdTag(this.CheckTask1Shft(groupByDate[propertyName] as Array<DataRow>, "S12", 1,5));
                htmlOutput += `<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>`
                htmlOutput += `<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>`
                htmlOutput += `<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>`
                htmlOutput += this.getTdTag(this.CheckTask1Shft(groupByDate[propertyName] as Array<DataRow>, "S21", 1,5));
                htmlOutput += this.getTdTag(this.CheckTask1Shft(groupByDate[propertyName] as Array<DataRow>, "S22", 1,5));
                htmlOutput += `<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td></tr>`








            }


            htmlOutput += `
     
  
     
    </tbody>
  </table>
      </div>
    </div>
   
  </div>
</div>`

            this.target.innerHTML = htmlOutput;








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


        private getTdTag(result: boolean): string {

            switch (result) {
                case true:
                    return '<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>'
                case false:
                    return '<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>'
            }

        }

        private CheckTask1Shft(rows: Array<DataRow>, task:string, dayFrom:number, dayTo:number): boolean {

            return rows.filter(e => {

                if (e.Name === task) {

                    var day = e.Date.getDay();

                    if (day => dayFrom && day <= dayTo) {
                        return true;
                    }
                }
                return false;

            }).length === 1;
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