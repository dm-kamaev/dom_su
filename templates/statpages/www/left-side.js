/**
 * Created by Lobova.A on 03.02.2017.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var client = require('./../../js/utility/client-data/client-data');
var Mustache = require('mustache');
var createElement = require('./../articles/createElement');
var defineObject = require('./define-object');
var request = require('./../../js/utility/request/request');
var path = require('./../../js/utility/path/path');
var url = require('./../../js/utility/url/url-third-column');
var LeftSideParent = require('./../left-side/left-side');
var LeftSide = (function (_super) {
    __extends(LeftSide, _super);
    function LeftSide() {
        var _this = _super.call(this) || this;
        _this.elementAttribute = 'data-id';
        _this.requestUrl = function () {
            return "" + path.buildUrl(path.item) + url.objectType.url + "/?direction=" + this.scrollDirection + "&key=" + this.getElementIdDirection(this.elementAttribute);
        };
        _this.buttonForm = _this.page.querySelector('.left-side__button');
        console.log(_this.buttonForm);
        _this.openForm = _this.openForm.bind(_this);
        _this.addEvent();
        return _this;
    }
    LeftSide.prototype.addEvent = function () {
        _super.prototype.addEvent.call(this);
        if (this.buttonForm) {
            this.buttonForm.addEventListener('click', this.openForm);
        }
    };
    LeftSide.prototype.removeEvent = function () {
        _super.prototype.removeEvent.call(this);
    };
    LeftSide.prototype.render = function (response) {
        _super.prototype.render.call(this, response);
        if (this.scrollDirection == 1) {
            response.ItemList = response.Data.ItemList.reverse();
        }
        if (response.Data) {
            this.scrollBegin = response.Data;
        }
        if (response.Data) {
            this.scrollEnd = response.Data;
        }
        var oldHeight = this.listElement.getBoundingClientRect().height;
        if (response.Data.ItemList.length) {
            response.Data.ItemList.forEach(function (item) {
                var templateElement = document.getElementById('left-side__item').innerHTML;
                var template = Handlebars.compile(templateElement);
                var element = defineObject.leftSide.createItem(item);
                var html = template(defineObject.leftSide.templateConf(item));
                element.innerHTML = html;
                if (this.scrollDirection === -1) {
                    this.listElement.appendChild(element);
                }
                else if (this.scrollDirection === 1) {
                    this.listElement.insertBefore(element, this.listElement.firstChild);
                    this.listElement.parentElement.scrollTop = '100';
                    if (!this.scrollBegin) {
                        this.listElement.parentElement.scrollTop = '100';
                    }
                }
                else {
                    this.listElement.appendChild(element);
                }
            }.bind(this));
            if (_super.prototype.scrollDirection === 1) {
                this.listElement.parentElement.scrollTop = this.listElement.getBoundingClientRect().height - oldHeight;
                _super.prototype.scrollTop = this.listElement.parentElement.scrollTop;
            }
        }
        setTimeout(function () {
            this.addEvent();
        }.bind(this), 0);
    };
    LeftSide.prototype.openItem = function (e) {
        e.preventDefault();
        var target = e.target;
        while (target != this) {
            if (target.classList.contains('left-side__item')) {
                var departureid = target.getAttribute('data-id');
                if (departureid) {
                    var href = "/" + url.objectType.url + "/" + departureid + "/"; // заменить
                    if (target.classList.contains('left-side__item--active')) {
                        page.show(href, { active: true });
                    }
                    else {
                        page.show(href, { open: true });
                    }
                }
                return;
            }
            target = target.parentNode;
        }
    };
    LeftSide.prototype.openForm = function (e) {
        e.preventDefault();
        var href = "/" + url.objectType.url + "/form/";
        page.show(href, { open: true });
    };
    return LeftSide;
}(LeftSideParent));
module.exports = LeftSide;
//# sourceMappingURL=left-side.js.map