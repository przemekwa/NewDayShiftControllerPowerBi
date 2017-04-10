

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

    enum ShiftResult {
        GOOD,
        UP,
        DOWN,
        NONE
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
        <th>S01</th>
        <th>S02</th>
      </tr>
    </thead>
    <tbody>`

            console.log(groupByDate);

            for (var propertyName in groupByDate) {

                var date = new Date(propertyName);

                htmlOutput += "<tr><td>" + this.getFormattedDate(date) + "</td>"


                htmlOutput += this.getTdTag(this.CheckTask1Shft(date, groupByDate[propertyName] as Array<DataRow>, "S11"));

                htmlOutput += this.getTdTag(this.CheckTask1Shft(date, groupByDate[propertyName] as Array<DataRow>, "S12"));
                htmlOutput += this.getTdTag(this.CheckTask1NShft(date, groupByDate[propertyName] as Array<DataRow>, "S14"));
                htmlOutput +=  this.getTdTag(this.CheckTask1NShft(date, groupByDate[propertyName] as Array<DataRow>, "S16"));
                htmlOutput +=  this.getTdTag(this.CheckTask1NShft(date, groupByDate[propertyName] as Array<DataRow>, "S15"));
                htmlOutput += this.getTdTag(this.CheckTask1Shft(date, groupByDate[propertyName] as Array<DataRow>, "S21"));
                htmlOutput += this.getTdTag(this.CheckTask1Shft(date, groupByDate[propertyName] as Array<DataRow>, "S22"));
                htmlOutput +=  this.getTdTag(this.CheckTask1NShft(date, groupByDate[propertyName] as Array<DataRow>, "S23"));
                htmlOutput +=  this.getTdTag(this.CheckTaskWeekendShft(date, groupByDate[propertyName] as Array<DataRow>, "S01"));
                htmlOutput +=  this.getTdTag(this.CheckTaskWeekendShft(date, groupByDate[propertyName] as Array<DataRow>, "S02"));






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


        private getTdTag(result: ShiftResult): string {

            switch (result) {
                case ShiftResult.GOOD:
                    return '<td><span data-toggle="tooltip" title="Hooray!" class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>'
                case ShiftResult.DOWN:
                    return '<td><span class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></td>'
                case ShiftResult.UP:
                    return '<td><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></td>'
                case ShiftResult.NONE:
                    return '<td><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></td>'
            }

        }

        private CheckTask1Shft(date: Date, rows: Array<DataRow>, task: string): ShiftResult {

            if (date.getDay() == 6 || date.getDay() == 0) {
                return ShiftResult.NONE
            }   

            switch (rows.filter(e => e.Name == task).length) {
                case 1:
                    return ShiftResult.GOOD
                case 0:
                    return ShiftResult.UP
                default:
                    return ShiftResult.DOWN
            }
        }

           private CheckTaskWeekendShft(date: Date, rows: Array<DataRow>, task: string): ShiftResult {

            if (date.getDay() > 0 && date.getDay() < 6) {
                return ShiftResult.NONE
            }   

            switch (rows.filter(e => e.Name == task).length) {
                case 1:
                    return ShiftResult.GOOD
                case 0:
                    return ShiftResult.UP
                default:
                    return ShiftResult.DOWN
            }
        }

          private CheckTask1NShft(date: Date, rows: Array<DataRow>, task: string): ShiftResult {

            if (date.getDay() == 6 || date.getDay() == 0) {
                return ShiftResult.NONE
            }   

            switch (rows.filter(e => e.Name == task).length) {
                case 0:
                    return ShiftResult.UP
                default:
                    return ShiftResult.GOOD
            }
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