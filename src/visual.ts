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
        Date: string,
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
        private arrowUpImageSoruceHtml = `<img class="icon icons8-Up" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABX0lEQVRoQ+2W4W3CQAyFnU0YhW5SJitswibtJq0sJdIlutw9+9lCVOYnnOH7fA87i7z5a3lzfimBV99g9g18roL3LNFMAYX/WsFvIpIikSXQwm/NT5HIEOjBp0lEC4zgUyQiBRD4cIkoAQt8qESEgAc+TIIVOIPXibON0Bb2+J5+Rk0nRmAErzP/97C89LdmNeZ95xVAQHoCCojUwiIeARTgTCBUwiqAwivkSCBMwiJggUcEQiRQASs8KkBLIAIeeIsAJTET8MJbBdwSIwEG3iPgkjgTYOG9AmaJnsBFRL47m8S68mdjdLSszhr4ISLPthC9ASs8cwMb31HisW7xnTjyH/DARwi0cerC64HZFNI4/cAPJvuDTITab7oeY4NEyMm8K4sSGLLMboARKQGke3UDgy5VhCpCSAcqQmSXagpVhCpCZAcqQmQDawr95wiR4cDKMyOEEZCnSoBsIF3+B67DaDFZf1UHAAAAAElFTkSuQmCC" width="12" height="12">`
        private arrowDownImageSoruceHtml = `<img class="icon icons8-Down" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABc0lEQVRoQ+2Y6w3CMAyEr5swCmwCk8EobAKbAJZIVYU8/IpCJecPEqX2fT47iViw87XsXD8CYLaDIx14ZXBDcg0J+hUeAJz2DAcaVYoWihbiVCBayFil2IWihaKFjBWIFjIWMHahf2+hA4Cn0mWvy9wRwL2modVCZwBXABcANwWEB0DSQPlJx8+qAaQX0wsaCCtArqEIUQKgtnkUYKUQFoBcfJJzytuJ64DGCS1ATXyxgJwZyM3gOqEBEIknYb1zQBxwQysFUOXqAZAeVWAAEgBtjq4DqaCaBFwATezVaI4DWggOgEk8ZwbyAZYk7AFIYlXPUYkDUidaAC7iNQ5IIGoAbuItAJzdqQTgKt4K0IOgi+B20QGYf0fPuQdjcQ40M8Ad7OrgbR6YxHs40JuJFoRZvCdAq51KEC7ivQG4EG7iRwD0IFzFjwKoQbiLHwmQQwwRPxogQdCn5k8BzjbMvk6zgs34kcdBNkP3mjMAppb/k/wNpdxoMZbJgZUAAAAASUVORK5CYII=" width="12" height="12">`
        private goodImageSourceHtml = `<img class="icon icons8-Checkmark" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAABJElEQVRIS92V0U0DQQxE33VACXQQqCCkgkAHUAFJB9BBUklCBdABUAFKB9ABmmjvZFnry65uFQn8kx+v33k8djrOFN2ZOPxZ0C2wBNbAt1WrZUc3wGsqLsgDsO9hrUAXwDtw6WY+1G8F2gCPDvICSMpjtABZyfq6P6m7YU5TQZFkd3Y+LTo6KVkL6YokmwqSZF+Afm0sgLfctcnNSI/lILnmIzhR2g8tpo0tsIpOmgcJoqW7SputL/QwWXbnCh7MmyzLg9T23GTKnhZWLVk0Iw9SnoVVSxaB9MWCzVz/gsnKT7WSjbkuguW0D13mk6PLUAJ7znQYmW701o3BPpPLwsKlHfV5Eex6ZMeK7J1L8rAqyWpPkGD36ZHcVx1T/yaKgf8P9AvaUjgbWlRgnwAAAABJRU5ErkJggg==" width="13" height="13">`
        private noneImageSoruceHtml = `<img class="icon icons8-Minus-Math-" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAYElEQVRIS2NkoBNgpJM9DKMWkR3So0E3GnTwEBiwxHCDgYFBneyIQNV4k4GBQQMmhO6j/1SyBMP8AbOImkF3lYGBQQdX0FE55BDGDViqG/UR0SEwGkdEBxW6wtGgIzvoANnBBhvKkqj1AAAAAElFTkSuQmCC" width="13" height="13">`

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.target.innerHTML = "";
            console.log("Wersja 0.0.0.4");


            jQuery(this.target).ready(() => {
                console.log("Dokument ready")
            });
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            let allData: Array<DataRow> = [];
            this.target.innerHTML = "";

            options.dataViews[0].table.rows.forEach(element => {
                let dateString = element[0].toString() + "-" + this.getNumberMonth(element[2].toString()) + "-" + (element[3] < 10 ? '0' : '') + element[3]
                let obj: DataRow = { Date: dateString, TaskId: element[5].toString(), Name: element[4].toString() };
                allData.push(obj);
            });


            let dateGroupBy = this.GroupBy(allData, "Date") as Array<any>;

            let panelArray: Array<string> = [];

            var temp = 0;

            let panelHeaderHtml = `<div class="panel-group shiftPanel"><div class="panel panel-default"><div class="panel-heading">Zmiany</div><div class="panel-body"><table class="table table-striped tablefont"><thead>      <tr> <th>Dzień</th>        <th>Data</th>        <th>S11</th>        <th>S12</th>        <th>S14</th>        <th>S16</th>        <th>S15</th>        <th>S21</th>        <th>S22</th>        <th>S23</th>        <th>S01</th>        <th>S02</th>      </tr>    </thead>    <tbody>`
            let panelFooterHtml = `</tbody></table></div></div><div class="panel-group"><div class="panel panel-default" style="margin-top: 10px; width: 400px "><div class="panel-heading" style="font-size: 10px">Legenda</div><div class="panel-body"><div></div><div style="font-size: 10px"><table><tr><td>`+ this.goodImageSourceHtml +`&nbsp;</td><td>Zmiana obsadzona</td><td> `+this.arrowDownImageSoruceHtml+`</td><td>&nbsp;Za dużo dyżurów</td><td>`+this.arrowUpImageSoruceHtml+`</span></td><td>&nbsp;Za mało dyżurów</td><td>`+this.noneImageSoruceHtml+`</td><td>&nbsp;Nie dotyczy</td></tr></table></div></div></div></div></div>`


            let panel = panelHeaderHtml;

            for (var key in dateGroupBy) {

                let date: Date = this.getDate(key)

                panel += "<tr><td>" + this.polishDay[date.getDay()] + "</td>"
                panel += "<td>" + this.getFormattedDate(date) + "</td>"
                panel += this.getTdTag(this.checkExaclyOneShft(date, dateGroupBy[key] as Array<DataRow>, "S11"));
                panel += this.getTdTag(this.checkExaclyOneShft(date, dateGroupBy[key] as Array<DataRow>, "S12"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, dateGroupBy[key] as Array<DataRow>, "S14"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, dateGroupBy[key] as Array<DataRow>, "S16"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, dateGroupBy[key] as Array<DataRow>, "S15"));
                panel += this.getTdTag(this.checkExaclyOneShft(date, dateGroupBy[key] as Array<DataRow>, "S21"));
                panel += this.getTdTag(this.checkExaclyOneShft(date, dateGroupBy[key] as Array<DataRow>, "S22"));
                panel += this.getTdTag(this.checkAtLeastOneShft(date, dateGroupBy[key] as Array<DataRow>, "S23"));
                panel += this.getTdTag(this.checkkWeekendShft(date, dateGroupBy[key] as Array<DataRow>, "S01"));
                panel += this.getTdTag(this.checkkWeekendShft(date, dateGroupBy[key] as Array<DataRow>, "S02"));

                temp++;

                if (temp == 6) {
                    panel += panelFooterHtml;
                    panelArray.push(panel);
                    panel = panelHeaderHtml;
                    temp = 0;
                }
            }

            if (panelArray.length === 0) {
                panel += panelFooterHtml;
                panelArray.push(panel);
                panel = panelHeaderHtml;
                temp = 0;
            }

            let htmlOutput = "";

            let carouselHtmlHeader = `<div class="container"><br><div id="myCarousel" class="carousel slide" data-ride="carousel"  data-interval="false"><!-- Indicators --><ol class="carousel-indicators"><li data-target="#myCarousel" data-slide-to="0" class="active"></li><li data-target="#myCarousel" data-slide-to="1"></li><li data-target="#myCarousel" data-slide-to="2"></li><li data-target="#myCarousel" data-slide-to="3"></li></ol>    <!-- Wrapper for slides --><div class="carousel-inner" role="listbox">`
            let carouselHtmlFooter = `</div><!-- Left and right controls --><a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev"><img class="icon icons8-Circled-Chevron-Left-Filled" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAC1klEQVRoQ92a8VEVMRCHf1SAViBUgFaAViBUAFagVgBUoFagVABUAFSAVgBUgFag8zGXN7lc7i532eSeLzM375/bZL/d7GY397a0IWNrQzhkCfJC0r6k15LeStppHt9WD5J4biT9lHQr6beFMS1AjiQdNM8cnS4l8ZzPEXYyOSAfJX2KWH2uPnjqq6RvcyaYA8K2+W4IEOoN0Idm+yUzTQX50ngheYGMF/HO51T5VBAC+boJ5NS5Ld4jIbxLSQgpIGQhthK/S4wkmDGQpTwRGmwUZgzkbkFPxGDe9G2JIRCCjRS7ToPUTMrvjD4QUizBvY6D4KcyaI0+kPuC50SucThndlNATiWd5K4Wkf/T1GAugeQswfnC1l+NmEdKeMNBkH0stm3HKyHIcXNm5FgrlPUhOIuIPbySOyhjfrhJQhCq0Pe5K3jypSBY4sqvuH0QrPT0n0A4NV+68sUHoae4MAIp6QlfxcOml2l1iFbZqhYEQGeS0LsFwiFDq5ozakKgJ60yWbAFkpt2a0OgP+n8uf7yY+RvhiuWgGhlXisQV/9YnhOpdn1mKAFCrG2namHwnikId1N4hT2LV2rCdECoX15lWGgJmF+u8fO3lkX6rQ0TTb9WB2JNmOiBaFmi1IKJlijWRWMNmGjRSJxbl/ElYXrLeEBKNFalYAYbK2By03Asg/swFq3uY3g5EuvZuTfistp6OBiLy4eWN8ISxVe8hFesDNPxxhCIhfutFA/nmXRBh/BGXJk6K1AE7pUy7cR5V3VVTG7sNp7ApAZbGgYItnvvF+AxEOD5zMxBuRTMKMRQsIfeW8ozSRBTQBxYzQTQ+y1kTozEZNir3LnmNGFDcc45QanU+QYyJJQSI33yVAA8VkAA4PHW54LUzJYD4tbAevQycy+/qWJJJqub9VTl/fcsQNx8JAS2nf+nmtBbBC8p1P2pht+1+VPNHAOay1h6xFy5KRP+A9TeqjObcmRJAAAAAElFTkSuQmCC" width="50" height="50"><span class="sr-only">Previous</span></a><a class="right carousel-control" href="#myCarousel" role="button" data-slide="next"><img class="icon icons8-Circled-Chevron-Right-Filled" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAC00lEQVRoQ92a4XHUMBBGv1QAVACpAKgAqABSAaECoAKgAqACSAVABUAFSSoAKgAqgHkZ6UaWZVuWdvFxmvHcj7NkvV3p213ZRzqQdnQgHLIEuS7pnqQ7ku5LuhWu1FbfJXF9kXQh6aukXxbGtAB5LOlRuFrm9FES11lL59inB+SppGcFq7fOB0+9kfS2ZYAWEJbNO0OAfN4APQnLr5ppLcjr4IXqB3TciHee1/avBWEjfw4buXZsi/sQhAc1glADggqxlPjdolXBLIFs5YncYIswSyDnG3qiBHN3aknMgbDZkNh9akgzkj9qUyBILJt7Hxubn8xg0KZAvjnGiV7jEGeOa0BeSnrR+bQomVjuWudYpe7EF5b+rpU8YuGN6H4k2wNm5JUc5DTEjF4jktECg2x6wZDGvI8TzUHIQh/2UoT+3jCf0ow7BSH4/TSCiMN4w9yI6UsKQk3xwRiE4TxhTkItM6gQLdRqyg5eMK8kMe8BCOpCqerVPGAolQneAxAL2V0ygjUMqniVf6V75M/SLIz+t4a5YtgCJBeA3rxuU5DfYW2zNP5bkBSCqE+WTQxrbSOPkL/cbB2tsp81xGUs/NI94i2/1hDYrii/ngHRAwKQYkD0SlG8IAAppigeSaMnBCDFpJE/LNN4b4jJNB4Qq8LKG4K5zhZW3GAhw2mp2xsnSsr+Iz8cKdXsnBtxWN3T4uGDB8TIG3mulU7cwis9hpjrO/LGHEhv/uMFwbirDujocBBHptGiZKe3Pc27YuxdXlXqs3QaT5AkB9saBgiW++Qb4CUQ4HnNTKDcCmYRYm6z597byjNVEGtAIti/FIDJdyEte6TUh7XKmatXEUacIFUavQOZE4aaPTLVnwyAywoIADw+eF1Qq2o9IPEZWI9apvXwmywWMdmdrNdOPr3PAiSOhyCw7NKPanJvsXmR0PhRDb9781FNiwHN+1h6xHxyawb8C4SxqjMR5dLnAAAAAElFTkSuQmCC" width="50" height="50"><span class="sr-only">Next</span></a></div></div>`

            htmlOutput = carouselHtmlHeader

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
            htmlOutput += carouselHtmlFooter

            this.target.innerHTML = htmlOutput;
        }

        /**Parses string formatted as YYYY-MM-DD to a Date object.
  * If the supplied string does not match the format, an 
  * invalid Date (value NaN) is returned.
  * @param {string} dateStringInRange format YYYY-MM-DD, with year in
  * range of 0000-9999, inclusive.
  * @return {Date} Date object representing the string.
  */
        private getDate(dateStringInRange): Date {

            var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
                date = new Date(NaN), month, parts = isoExp.exec(dateStringInRange);

            if (parts) {
                month = +parts[2];
                date.setFullYear(+parts[1], month - 1, +parts[3]);
                if (month != date.getMonth() + 1) {
                    date.setTime(NaN);
                }
            }
            return date;
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
                    return '<td>'+ this.goodImageSourceHtml +'</td>'
                case ShiftResult.DOWN:
                    return '<td>'+this.arrowDownImageSoruceHtml+'</td>'
                case ShiftResult.UP:
                    return '<td>'+this.arrowUpImageSoruceHtml+'</td>'
                case ShiftResult.NONE:
                    return '<td>'+this.noneImageSoruceHtml+'</td>'
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

        private getNumberMonth(stringMonth: string): string {
            switch (stringMonth) {
                case "January":
                    return "01";
                case "February":
                    return "02";
                case "March":
                    return "03";
                case "April":
                    return "04";
                case "May":
                    return "05";
                case "June ":
                    return "06";
                case "July":
                    return "07";
                case "August":
                    return "08";
                case "September":
                    return "09";
                case "October":
                    return "10";
                case "November":
                    return "11";
                case "December":
                    return "12";
            }
        }
    }
}