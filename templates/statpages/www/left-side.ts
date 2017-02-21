/**
 * Created by Lobova.A on 03.02.2017.
 */

"use strict";

let client = require('./../../js/utility/client-data/client-data');
let Mustache = require('mustache');
let createElement = require('./../articles/createElement');
let defineObject = require('./define-object');
let request = require('./../../js/utility/request/request');
let path = require('./../../js/utility/path/path');
let url = require('./../../js/utility/url/url-third-column');
let LeftSideParent = require('./../left-side/left-side');

class LeftSide extends LeftSideParent{
  public elementAttribute: string;
  public requestUrl;
  public buttonForm: HTMLElement;

  constructor() {
    super();
    this.elementAttribute = 'data-id';
    this.requestUrl = function (): string {
      return `${path.buildUrl(path.item)}${url.objectType.url}/?direction=${this.scrollDirection}&key=${this.getElementIdDirection(this.elementAttribute)}`;
    };
    this.buttonForm = this.page.querySelector('.left-side__button') as HTMLElement;
    console.log(this.buttonForm);

    this.openForm = this.openForm.bind(this);
    this.addEvent();
  }

  public addEvent() {
    super.addEvent();

    if (this.buttonForm) {
      this.buttonForm.addEventListener('click', this.openForm);
    }
  }

  public removeEvent() {
    super.removeEvent();
  }

  public render(response) {
    super.render(response);

    if (this.scrollDirection == 1) {
      response.ItemList = response.Data.ItemList.reverse();
    }

    if (response.Data) {
      this.scrollBegin = response.Data;
    }

    if (response.Data) {
      this.scrollEnd = response.Data;
    }

    let oldHeight = this.listElement.getBoundingClientRect().height;

    if (response.Data.ItemList.length) {
      response.Data.ItemList.forEach(function(item) {
        let templateElement = document.getElementById('left-side__item').innerHTML;
        let template = Handlebars.compile(templateElement);
        let element = defineObject.leftSide.createItem(item);
        let html = template(defineObject.leftSide.templateConf(item));
        element.innerHTML = html;

        if (this.scrollDirection === -1) {
          this.listElement.appendChild(element);
        } else if (this.scrollDirection === 1) {
          this.listElement.insertBefore(element, this.listElement.firstChild);
          this.listElement.parentElement.scrollTop = '100';
          if (!this.scrollBegin) {
            this.listElement.parentElement.scrollTop = '100';
          }
        } else {
          this.listElement.appendChild(element);
        }
      }.bind(this));
      if (super.scrollDirection === 1) {
        this.listElement.parentElement.scrollTop = this.listElement.getBoundingClientRect().height - oldHeight;
        super.scrollTop = this.listElement.parentElement.scrollTop;
      }
    }

    setTimeout(function () {
      this.addEvent();
    }.bind(this), 0);
  }

  public openItem(e) {
    e.preventDefault();

    let target = e.target;
    while (target != this) {
      if (target.classList.contains('left-side__item')) {

        let departureid = target.getAttribute('data-id');

        if (departureid) {
          let href = `/${url.objectType.url}/${departureid}/`; // заменить

          if (target.classList.contains('left-side__item--active')) {
            page.show(href, {active: true});
          } else {
            page.show(href,  {open: true});
          }
        }
        return;
      }
      target = target.parentNode;
    }
  }

  public openForm(e) {
    e.preventDefault();

    let href = `/${url.objectType.url}/form/`;
    page.show(href,  {open: true});
  }

  // private getRequestUrl(): string {
  //   return `${path.buildUrl(path.item)}${url.type.address}${url.address.id}?direction=${this.scrollDirection}&status=${this.filter.status}&departureID=${this.getElementIdDirection(this.elementAttribute)}`
  // }
}

module.exports = LeftSide;


