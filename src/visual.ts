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

    export function logExceptions(): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>)
            : TypedPropertyDescriptor<Function> {

            return {
                value: function () {
                    try {
                        return descriptor.value.apply(this, arguments);
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                }
            }
        }
    }






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

    interface ExtraShiftResult {
        Result: ShiftResult,
        UserNames: string
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private polishDay: Array<string> = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"]


        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.target = options.element;
            this.target.innerHTML = "";



            jQuery(this.target).ready(() => {
                console.log("Dokument ready")
            });
        }




        @logExceptions()
        public update(options: VisualUpdateOptions) {
            let allData: Array<DataRow> = [];
            this.target.innerHTML = "";

            options.dataViews[0].table.rows.forEach(element => {
                let date = new Date(element[3].toString() + "-" + element[2].toString() + "-" + element[0].toString());
                let obj: DataRow = { Date: date, TaskId: element[5].toString(), Name: element[4].toString() };
                allData.push(obj);
            });


            let groupByDate = this.GroupBy(allData, "Date") as Array<any>;

            console.log(groupByDate);



            let panelArray: Array<string> = [];

            var temp = 0;

            let panelHeaderHtml = `<div class="panel-group shiftPanel"><div class="panel panel-default"><div class="panel-heading">Zmiany</div><div class="panel-body"><table class="table table-striped tablefont"><thead>      <tr> <th>Dzień</th>        <th>Data</th>        <th>S11</th>        <th>S12</th>        <th>S14</th>        <th>S16</th>        <th>S15</th>        <th>S21</th>        <th>S22</th>        <th>S23</th>        <th>S01</th>        <th>S02</th>      </tr>    </thead>    <tbody>`
            let panelFooterHtml = `</tbody></table></div></div><div class="panel-group">
    <div class="panel panel-default" style="margin-top: 10px; width: 400px ">
      <div class="panel-heading" style="font-size: 10px">Legenda</div>
      <div class="panel-body">
      <div></div>
      <div style="font-size: 10px">
      <table>
      <tr>
      <td> <span  class="glyphicon glyphicon-ok legendIco" aria-hidden="true"></td>
       <td>Zmiana obsadzona</td>
        <td> <span class="glyphicon glyphicon-arrow-down down legendIco" aria-hidden="true"></td>
       <td>Za dużo dyżurów</td>
        <td> <span class="glyphicon glyphicon-arrow-up up legendIco" aria-hidden="true"></span></td>
       <td>Za mało dyżurów</td>
       <td><span class="glyphicon glyphicon-minus none legendIco" aria-hidden="true"></span></td>
       <td>Nie dotyczy</td>
      </tr>
          </table>
      </div>
       
      </div>
    </div>
   
  </div></div>`


            let panel = panelHeaderHtml;

            for (var propertyName in groupByDate) {

                var date = new Date(propertyName);
                panel += "<tr><td>" + this.polishDay[date.getDay()] + "</td>"
                panel += "<td>" + this.getFormattedDate(date) + "</td>"
                panel += this.getTdTag(this.checkExaclyOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S11"));
                panel += this.getTdTag(this.checkExaclyOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S12"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S14"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S16"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S15"));
                panel += this.getTdTag(this.checkExaclyOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S21"));
                panel += this.getTdTag(this.checkExaclyOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S22"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, groupByDate[propertyName] as Array<DataRow>, "S23"));
                panel += this.getTdTag(this.checkkWeekendShft(date, groupByDate[propertyName] as Array<DataRow>, "S01"));
                panel += this.getTdTag(this.checkkWeekendShft(date, groupByDate[propertyName] as Array<DataRow>, "S02"));

                temp++;

                if (temp == 6) {
                    panel += panelFooterHtml;
                    panelArray.push(panel);
                    panel = panelHeaderHtml;
                    temp = 0;
                }
            }

            if (panelArray.length === 0 )
            {
                 panel += panelFooterHtml;
                    panelArray.push(panel);
                    panel = panelHeaderHtml;
                    temp = 0;
            }

           

            let htmlOutput = "";






            htmlOutput = `<div class="container">
  <br>
  <div id="myCarousel" class="carousel slide" data-ride="carousel">
    <!-- Indicators -->
    <ol class="carousel-indicators">
      <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
      <li data-target="#myCarousel" data-slide-to="1"></li>
      <li data-target="#myCarousel" data-slide-to="2"></li>
      <li data-target="#myCarousel" data-slide-to="3"></li>
    </ol>

    <!-- Wrapper for slides -->
    <div class="carousel-inner" role="listbox">
 
          

`

            panelArray.forEach((element, index) => {

                if (index === 0) {
                    htmlOutput += `<div class="item active">`
                }
                else {
                    htmlOutput += `<div class="item">`
                }


                htmlOutput += element;


                htmlOutput += `</div>`

            });


            htmlOutput += `   </div>

    <!-- Left and right controls -->
    <a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">
      <span class="glyphicon glyphicon-chevron-left" style="color: black" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">
      <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>
</div>`



            this.target.innerHTML = htmlOutput;
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
                    return '<td><a href="#" data-toggle="tooltip" data-placement="top"  data-html="true" title="<em>Tooltip</em> <u>with</u> <b>HTML</b>"><span class="glyphicon glyphicon-ok good" aria-hidden="true" ></span></a></td>'
                case ShiftResult.DOWN:
                    return '<td><span class="glyphicon glyphicon-arrow-down down" aria-hidden="true"></span></td>'
                case ShiftResult.UP:
                    return '<td><span class="glyphicon glyphicon-arrow-up up" aria-hidden="true"></span></td>'
                case ShiftResult.NONE:
                    return '<td><span class="glyphicon glyphicon-minus none" aria-hidden="true"></span></td>'
            }
        }

        private checkExaclyOneShft(date: Date, rows: Array<DataRow>, task: string): ShiftResult {

            if (date.getDay() == 6 || date.getDay() == 0) {
                return ShiftResult.NONE
            }

            let result = rows.filter(e => e.Name == task);

            switch (result.length) {
                case 1:
                    return ShiftResult.GOOD
                case 0:
                    return ShiftResult.UP
                default:
                    return ShiftResult.DOWN
            }
        }

        private checkkWeekendShft(date: Date, rows: Array<DataRow>, task: string): ShiftResult {

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

        private checkAtLeastOneShft(date: Date, rows: Array<DataRow>, task: string): ShiftResult {

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